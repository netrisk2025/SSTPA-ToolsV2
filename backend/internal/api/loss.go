// Loss Tool backend (SRS §6.5.10): Attack Tree auto-build, path enumeration,
// metric propagation, RV detection. [:AT_RELATES_TO] edges (scoped by LossHID)
// are the semantic source of truth; AttackTreeJSON holds layout + validation
// snapshot. All mutations flow through the standard commit pipeline with the
// AT_RELATES_TO tool-authority gate (toolId == sstpa.loss, §3.3.4.11).
//
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// atNode is a node in the assembled Attack Tree.
type atNode struct {
	HID      string         `json:"hid"`
	UUID     string         `json:"uuid"`
	TypeName string         `json:"typeName"`
	Name     string         `json:"name"`
	Tier     int            `json:"tier"`
	Props    map[string]any `json:"props"`
}

// atEdge is one [:AT_RELATES_TO] edge in the tree.
type atEdge struct {
	SourceHID     string         `json:"sourceHid"`
	TargetHID     string         `json:"targetHid"`
	LogicOperator string         `json:"logicOperator"`
	SANDSequence  *int64         `json:"sandSequence"`
	TailoredOut   bool           `json:"tailoredOut"`
	Props         map[string]any `json:"props"`
}

// snapNode is one node fingerprint in the validation snapshot (§6.5.10.12).
type snapNode struct {
	HID      string `json:"hid"`
	TypeName string `json:"typeName"`
	Name     string `json:"name"`
}

// snapTrace is one CURRENT trace (entity, State) pair recorded at build time.
type snapTrace struct {
	EntityHID string `json:"entityHid"`
	StateHID  string `json:"stateHid"`
}

// treeSnapshot is the validationSnapshot section of AttackTreeJSON: a
// fingerprint of the Core Data state at the last successful build/Commit,
// used for change detection on open (§6.5.10.12).
type treeSnapshot struct {
	BuiltAt     string      `json:"builtAt"`
	Environment string      `json:"environment"`
	Nodes       []snapNode  `json:"nodes"`
	Traces      []snapTrace `json:"traces"`
}

// validationFinding is one reconciliation result row (§6.5.10.12/§6.5.10.16).
type validationFinding struct {
	Severity string `json:"severity"` // ERROR | WARNING | INFO
	Type     string `json:"type"`     // e.g. ATTACK_REMOVED, TRACE_INVALIDATED
	NodeHID  string `json:"nodeHid,omitempty"`
	Message  string `json:"message"`
}

// handleLossTree returns the assembled Attack Tree for a Loss: root, tiered
// nodes, [:AT_RELATES_TO] edges, plus trace-coverage info (SRS §6.5.10.4).
func (s *Server) handleLossTree(w http.ResponseWriter, r *http.Request) {
	lossHid := chi.URLParam(r, "lossHid")
	res, err := s.db.Read(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		return s.assembleTree(r.Context(), tx, lossHid)
	})
	if err != nil {
		writeError(w, http.StatusNotFound, "loss tree query failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) assembleTree(ctx context.Context, tx neo4j.ManagedTransaction, lossHid string) (map[string]any, error) {
	// Root Loss + Asset + Environment.
	rec, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})
		OPTIONAL MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		OPTIONAL MATCH (loss)-[:HAS_ENVIRONMENT]->(env:Environment)
		RETURN loss{.*} AS loss, asset{.HID, .Name, .uuid} AS asset, env{.HID, .Name, .uuid} AS env`,
		map[string]any{"hid": lossHid})
	if err != nil {
		return nil, err
	}
	single, err := rec.Single(ctx)
	if err != nil {
		return nil, fmt.Errorf("loss %s not found", lossHid)
	}
	m := single.AsMap()

	// All AT_RELATES_TO edges for this Loss with endpoint node data.
	er, err := tx.Run(ctx, `
		MATCH (src)-[rel:AT_RELATES_TO {LossHID: $hid}]->(tgt)
		RETURN src{.*} AS src, tgt{.*} AS tgt, properties(rel) AS props`,
		map[string]any{"hid": lossHid})
	if err != nil {
		return nil, err
	}
	nodes := map[string]atNode{}
	var edges []atEdge
	addNode := func(props map[string]any) {
		hid := str2s(props["HID"])
		if hid == "" {
			return
		}
		if _, ok := nodes[hid]; !ok {
			nodes[hid] = atNode{
				HID:      hid,
				TypeName: str2s(props["TypeName"]),
				Name:     str2s(props["Name"]),
				UUID:     str2s(props["uuid"]),
				Props:    props,
			}
		}
	}
	for er.Next(ctx) {
		rm := er.Record().AsMap()
		srcProps, _ := rm["src"].(map[string]any)
		tgtProps, _ := rm["tgt"].(map[string]any)
		addNode(srcProps)
		addNode(tgtProps)
		props, _ := rm["props"].(map[string]any)
		e := atEdge{
			SourceHID: str2s(srcProps["HID"]), TargetHID: str2s(tgtProps["HID"]),
			LogicOperator: "AND", Props: props,
		}
		if props != nil {
			if lo, ok := props["LogicOperator"].(string); ok {
				e.LogicOperator = lo
			}
			if to, ok := props["TailoredOut"].(bool); ok {
				e.TailoredOut = to
			}
			if ss, ok := props["SANDSequence"].(int64); ok {
				e.SANDSequence = &ss
			}
		}
		edges = append(edges, e)
	}
	if err := er.Err(); err != nil {
		return nil, err
	}

	// Tier assignment by BFS from the Loss root (§6.5.10.6 T0..T6+).
	rootHid := lossHid
	if lossProps, ok := m["loss"].(map[string]any); ok {
		addNode(lossProps)
	}
	tier := assignTiers(rootHid, edges)
	nodeList := make([]atNode, 0, len(nodes))
	for hid, n := range nodes {
		n.Tier = tier[hid]
		nodeList = append(nodeList, n)
	}
	sort.Slice(nodeList, func(i, j int) bool {
		if nodeList[i].Tier != nodeList[j].Tier {
			return nodeList[i].Tier < nodeList[j].Tier
		}
		return nodeList[i].HID < nodeList[j].HID
	})

	// Trace coverage (§6.5.10.5a): States VALID_IN the Env with CURRENT trace.
	cov, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})-[:HAS_ENVIRONMENT]->(env:Environment)
		MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		OPTIONAL MATCH (st:State)-[:VALID_IN]->(env)
		OPTIONAL MATCH (e)-[tr:HOLDS|TRANSPORTS|USES]->(asset)
		WHERE tr.TraceStatus = 'CURRENT' AND tr.TraceStateHID = st.HID
		RETURN st.HID AS stateHid, st.Name AS stateName, st.StateSequence AS seq,
		       count(DISTINCT e) AS tracedEntities`,
		map[string]any{"hid": lossHid})
	if err != nil {
		return nil, err
	}
	var coverage []map[string]any
	statesCovered, statesTotal := 0, 0
	for cov.Next(ctx) {
		cm := cov.Record().AsMap()
		if cm["stateHid"] == nil {
			continue
		}
		statesTotal++
		te, _ := cm["tracedEntities"].(int64)
		if te > 0 {
			statesCovered++
		}
		coverage = append(coverage, cm)
	}

	// Snapshot reconciliation (§6.5.10.12): compare the AttackTreeJSON
	// validationSnapshot against the live graph and emit findings.
	findings := s.reconcileTreeFindings(ctx, tx, lossHid, m["loss"], nodeList)
	shape, shapeErr := shapeOfLoss(lossHid, nodeList, edges)
	findings = append(findings, lossCapacityFindings(shape)...)
	if shapeErr != nil {
		findings = append(findings, validationFinding{Severity: "ERROR", Type: "TREE_STRUCTURE", Message: shapeErr.Error()})
	}

	exact, _ := countLossPaths(map[string]any{"nodes": nodeList, "edges": edges}, lossHid)
	return map[string]any{
		"loss":               m["loss"],
		"asset":              m["asset"],
		"environment":        m["env"],
		"nodes":              nodeList,
		"edges":              edges,
		"traceCoverage":      coverage,
		"statesCovered":      statesCovered,
		"statesTotal":        statesTotal,
		"validationFindings": findings,
		"capacity":           shape,
		"pathCountExact":     exact.String(), "pathCountSaturated": !exact.IsInt64(),
	}, nil
}

// assignTiers BFS-assigns each node's tier depth from the Loss root
// (§6.5.10.6). A node reachable through several branches takes its shallowest
// depth. Pure helper shared by assembleTree and unit tests.
func assignTiers(rootHid string, edges []atEdge) map[string]int {
	tier := map[string]int{rootHid: 0}
	children := map[string][]string{}
	for _, e := range edges {
		children[e.SourceHID] = append(children[e.SourceHID], e.TargetHID)
	}
	queue := []string{rootHid}
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		for _, c := range children[cur] {
			if _, seen := tier[c]; !seen {
				tier[c] = tier[cur] + 1
				queue = append(queue, c)
			}
		}
	}
	return tier
}

// reconcileTreeFindings loads the stored validationSnapshot from the Loss's
// AttackTreeJSON and compares it against the live graph (§6.5.10.12 steps
// 1–6). It returns an empty slice when no comparable snapshot exists.
func (s *Server) reconcileTreeFindings(ctx context.Context, tx neo4j.ManagedTransaction, lossHid string, lossProps any, treeNodes []atNode) []validationFinding {
	props, ok := lossProps.(map[string]any)
	if !ok {
		return []validationFinding{}
	}
	raw, _ := props["AttackTreeJSON"].(string)
	snap := parseTreeSnapshot(raw)
	if snap == nil || len(snap.Nodes) == 0 {
		return []validationFinding{}
	}

	// Live existence + current names for every snapshot node.
	hids := make([]string, 0, len(snap.Nodes))
	for _, n := range snap.Nodes {
		hids = append(hids, n.HID)
	}
	liveNodes := map[string]snapNode{}
	if res, err := tx.Run(ctx, `
		UNWIND $hids AS h
		MATCH (n {HID: h})
		RETURN n.HID AS hid, n.Name AS name, n.TypeName AS typeName`,
		map[string]any{"hids": hids}); err == nil {
		for res.Next(ctx) {
			rm := res.Record().AsMap()
			hid := str2s(rm["hid"])
			liveNodes[hid] = snapNode{HID: hid, Name: str2s(rm["name"]), TypeName: str2s(rm["typeName"])}
		}
	}

	// Live CURRENT trace (entity, State) pairs for the Loss's Asset.
	liveTraces := map[string]bool{}
	if res, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})
		MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		MATCH (e)-[t:HOLDS|TRANSPORTS|USES]->(asset)
		WHERE t.TraceStatus = 'CURRENT'
		RETURN e.HID AS entityHid, t.TraceStateHID AS stateHid`,
		map[string]any{"hid": lossHid}); err == nil {
		for res.Next(ctx) {
			rm := res.Record().AsMap()
			liveTraces[str2s(rm["entityHid"])+"|"+str2s(rm["stateHid"])] = true
		}
	}

	treeHids := map[string]bool{}
	for _, n := range treeNodes {
		treeHids[n.HID] = true
	}
	return reconcileFindings(*snap, liveNodes, treeHids, liveTraces, treeNodes)
}

// reconcileFindings is the pure snapshot-vs-live comparison (§6.5.10.12):
//   - snapshot node gone from graph          → ERROR *_REMOVED
//   - snapshot node in graph but not in tree → WARNING EDGE_REMOVED
//   - snapshot node renamed                  → INFO NAME_CHANGED
//   - snapshot trace no longer CURRENT       → ERROR TRACE_INVALIDATED
//   - tree node absent from snapshot         → INFO NODE_ADDED
func reconcileFindings(snap treeSnapshot, liveNodes map[string]snapNode, treeHids map[string]bool, liveTraces map[string]bool, treeNodes []atNode) []validationFinding {
	findings := []validationFinding{}
	snapSet := map[string]bool{}
	for _, sn := range snap.Nodes {
		snapSet[sn.HID] = true
		live, exists := liveNodes[sn.HID]
		if !exists {
			findings = append(findings, validationFinding{
				Severity: "ERROR",
				Type:     removedFindingType(sn.TypeName),
				NodeHID:  sn.HID,
				Message:  fmt.Sprintf("%s %q (%s) was removed from the graph since the last tree build. Rebuild the tree.", sn.TypeName, sn.Name, sn.HID),
			})
			continue
		}
		if !treeHids[sn.HID] {
			findings = append(findings, validationFinding{
				Severity: "WARNING",
				Type:     "EDGE_REMOVED",
				NodeHID:  sn.HID,
				Message:  fmt.Sprintf("%s %q (%s) still exists but is no longer connected in this Attack Tree.", sn.TypeName, sn.Name, sn.HID),
			})
		}
		if live.Name != sn.Name {
			findings = append(findings, validationFinding{
				Severity: "INFO",
				Type:     "NAME_CHANGED",
				NodeHID:  sn.HID,
				Message:  fmt.Sprintf("%s %s was renamed from %q to %q since the last tree build.", sn.TypeName, sn.HID, sn.Name, live.Name),
			})
		}
	}
	for _, tr := range snap.Traces {
		if !liveTraces[tr.EntityHID+"|"+tr.StateHID] {
			findings = append(findings, validationFinding{
				Severity: "ERROR",
				Type:     "TRACE_INVALIDATED",
				NodeHID:  tr.EntityHID,
				Message:  fmt.Sprintf("Trace for entity %s in State %s is no longer CURRENT. Verify with the Trace Tool, then Rebuild Tree.", tr.EntityHID, tr.StateHID),
			})
		}
	}
	for _, n := range treeNodes {
		if !snapSet[n.HID] {
			findings = append(findings, validationFinding{
				Severity: "INFO",
				Type:     "NODE_ADDED",
				NodeHID:  n.HID,
				Message:  fmt.Sprintf("%s %q (%s) was added to the tree since the last snapshot.", n.TypeName, n.Name, n.HID),
			})
		}
	}
	return findings
}

func removedFindingType(typeName string) string {
	switch typeName {
	case "Attack":
		return "ATTACK_REMOVED"
	case "Countermeasure":
		return "COUNTERMEASURE_REMOVED"
	case "State":
		return "STATE_REMOVED"
	case "Environment":
		return "ENVIRONMENT_REMOVED"
	case "Loss":
		return "LOSS_REMOVED"
	default:
		return "ENTITY_REMOVED"
	}
}

// parseTreeSnapshot extracts the validationSnapshot from an AttackTreeJSON
// document; nil when absent or unparseable.
func parseTreeSnapshot(raw string) *treeSnapshot {
	var wrapper struct {
		ValidationSnapshot treeSnapshot `json:"validationSnapshot"`
	}
	if raw == "" || json.Unmarshal([]byte(raw), &wrapper) != nil {
		return nil
	}
	snap := &wrapper.ValidationSnapshot
	// Read the SRS SSTPA-ATF-2.0 snapshot alongside the deployed 1.0 shape.
	if len(snap.Nodes) == 0 {
		var doc map[string]any
		_ = json.Unmarshal([]byte(raw), &doc)
		value, _ := doc["validationSnapshot"].(map[string]any)
		if value != nil {
			snap.Environment = str2s(value["environmentHID"])
			snap.BuiltAt = str2s(value["snapshotAt"])
			appendNode := func(v map[string]any, id, name, typ string) {
				if hid := str2s(v[id]); hid != "" {
					snap.Nodes = append(snap.Nodes, snapNode{HID: hid, Name: str2s(v[name]), TypeName: typ})
				}
			}
			if states, ok := value["states"].([]any); ok {
				for _, x := range states {
					state, _ := x.(map[string]any)
					appendNode(state, "stateHID", "stateName", "State")
					if entities, ok := state["traceEntities"].([]any); ok {
						for _, x := range entities {
							entity, _ := x.(map[string]any)
							appendNode(entity, "entityHID", "entityName", str2s(entity["entityType"]))
							snap.Traces = append(snap.Traces, snapTrace{EntityHID: str2s(entity["entityHID"]), StateHID: str2s(state["stateHID"])})
						}
					}
				}
			}
			for _, group := range []struct{ key, id, name, typ string }{{"attacks", "attackHID", "attackName", "Attack"}, {"countermeasures", "countermeasureHID", "countermeasureName", "Countermeasure"}} {
				if records, ok := value[group.key].([]any); ok {
					for _, x := range records {
						record, _ := x.(map[string]any)
						appendNode(record, group.id, group.name, group.typ)
					}
				}
			}
		}
	}
	return snap
}

// handleLossAutoBuild builds the Attack Tree from graph data per §6.5.10.7 and
// persists the [:AT_RELATES_TO] edges + Loss tree properties in one ACID
// transaction. Rebuild=true first deletes existing edges for this Loss.
func (s *Server) handleLossAutoBuild(w http.ResponseWriter, r *http.Request) {
	user, _ := CurrentUser(r.Context())
	if user.IsAdmin && !user.IsRootAdmin {
		writeError(w, http.StatusForbidden, "Admins cannot edit Loss trees", "")
		return
	}
	lossHid := chi.URLParam(r, "lossHid")
	rebuild := r.URL.Query().Get("rebuild") == "true"

	var expected *int64
	if raw := r.URL.Query().Get("expectedVersion"); raw != "" {
		version, err := strconv.ParseInt(raw, 10, 64)
		if err != nil || version < 0 {
			writeError(w, http.StatusBadRequest, "invalid expectedVersion", "")
			return
		}
		expected = &version
	}
	res, err := s.db.Write(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		if _, err := lockLossRevision(r.Context(), tx, lossHid, expected); err != nil {
			return nil, err
		}
		return s.autoBuildTree(r.Context(), tx, user, lossHid, rebuild)
	})
	if err != nil {
		status := http.StatusUnprocessableEntity
		if errors.Is(err, errLossConflict) {
			status = http.StatusConflict
		}
		writeError(w, status, "auto-build failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, res)
}

func (s *Server) autoBuildTree(ctx context.Context, tx neo4j.ManagedTransaction, user UserIdentity, lossHid string, rebuild bool) (map[string]any, error) {
	// Verify Loss has an Environment.
	rec, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})-[:HAS_ENVIRONMENT]->(env:Environment)
		MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		RETURN loss.uuid AS lossUuid, env.HID AS envHid, asset.HID AS assetHid`,
		map[string]any{"hid": lossHid})
	if err != nil {
		return nil, err
	}
	single, err := rec.Single(ctx)
	if err != nil {
		return nil, fmt.Errorf("loss %s has no Environment assignment; assign one in the Context Tool first (SRS §6.5.10.3)", lossHid)
	}
	sm := single.AsMap()
	lossUUID, _ := sm["lossUuid"].(string)
	envHid, _ := sm["envHid"].(string)

	if rebuild {
		if _, err := tx.Run(ctx,
			`MATCH ()-[rel:AT_RELATES_TO {LossHID: $hid}]->() DELETE rel`,
			map[string]any{"hid": lossHid}); err != nil {
			return nil, err
		}
	}

	// Single bounded traversal building the full tree (§6.5.10.7). Default
	// operators per the §6.5.10.7 table. Edges MERGE-created idempotently.
	build := `
		MATCH (loss:Loss {HID: $hid})-[:HAS_ENVIRONMENT]->(env:Environment)
		MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		// T1 Environment (AND)
		MERGE (loss)-[le:AT_RELATES_TO {LossHID: $hid, targetKind: 'env'}]->(env)
		ON CREATE SET le.Lossuuid = $lossUuid, le.LogicOperator = 'AND', le.TailoredOut = false
		WITH loss, env, asset
		// T1 States valid in env with CURRENT trace (OR)
		MATCH (st:State)-[:VALID_IN]->(env)
		WHERE EXISTS {
			MATCH (e)-[tr:HOLDS|TRANSPORTS|USES]->(asset)
			WHERE tr.TraceStatus = 'CURRENT' AND tr.TraceStateHID = st.HID
		}
		MERGE (loss)-[ls:AT_RELATES_TO {LossHID: $hid, targetKind: 'state'}]->(st)
		ON CREATE SET ls.Lossuuid = $lossUuid, ls.LogicOperator = 'OR', ls.TailoredOut = false
		WITH loss, asset, st
		// T2 entities traced to the asset in this state (OR)
		MATCH (e)-[tr:HOLDS|TRANSPORTS|USES]->(asset)
		WHERE tr.TraceStatus = 'CURRENT' AND tr.TraceStateHID = st.HID
		MERGE (st)-[se:AT_RELATES_TO {LossHID: $hid, entityKey: e.HID}]->(e)
		ON CREATE SET se.Lossuuid = $lossUuid, se.LogicOperator = 'OR', se.TailoredOut = false
		WITH loss, asset, e
		// T3 attacks exploiting the entity (OR)
		OPTIONAL MATCH (e)<-[:EXPLOITS]-(atk:Attack)
		FOREACH (a IN CASE WHEN atk IS NULL THEN [] ELSE [atk] END |
			MERGE (e)-[ae:AT_RELATES_TO {LossHID: $hid, attackKey: a.HID}]->(a)
			ON CREATE SET ae.Lossuuid = $lossUuid, ae.LogicOperator = 'OR', ae.TailoredOut = false
		)
		WITH DISTINCT loss, asset
		// T4 countermeasures blocking those attacks (AND)
		MATCH (e2)-[:AT_RELATES_TO {LossHID: $hid}]->(atk2:Attack)
		OPTIONAL MATCH (cm:Countermeasure)-[:BLOCKS]->(atk2)
		FOREACH (c IN CASE WHEN cm IS NULL THEN [] ELSE [cm] END |
			MERGE (atk2)-[ce:AT_RELATES_TO {LossHID: $hid, cmKey: c.HID}]->(c)
			ON CREATE SET ce.Lossuuid = $lossUuid, ce.LogicOperator = 'AND', ce.TailoredOut = false
		)
		RETURN count(*) AS built`
	if _, err := tx.Run(ctx, build, map[string]any{"hid": lossHid, "lossUuid": lossUUID, "envHid": envHid}); err != nil {
		return nil, fmt.Errorf("tree construction: %w", err)
	}

	// T5+ alternates canonical DEFEATS/BLOCKS relations. Bounded reachability
	// avoids exponential variable-length path enumeration on shared DAGs.
	if err := buildLossCounterTiers(ctx, tx, lossHid, lossUUID); err != nil {
		return nil, fmt.Errorf("counter-attack tier construction: %w", err)
	}

	// Post-build computation (§6.5.10.7): compute paths, RVs, validity.
	tree, err := s.assembleTree(ctx, tx, lossHid)
	if err != nil {
		return nil, err
	}
	nodesForValidation, _ := tree["nodes"].([]atNode)
	if err := validateLossGraph(lossHid, nodesForValidation, toEdges(tree["edges"])); err != nil {
		return nil, err
	}
	stats := computeTreeStats(tree, nil)

	// Validation snapshot (§6.5.10.12): fingerprint of the built tree plus
	// the CURRENT trace pairs it was derived from, for change detection.
	treeNodes, _ := tree["nodes"].([]atNode)
	snapshot := treeSnapshot{
		BuiltAt:     timeNow().UTC().Format(time.RFC3339),
		Environment: envHid,
	}
	for _, n := range treeNodes {
		snapshot.Nodes = append(snapshot.Nodes, snapNode{HID: n.HID, TypeName: n.TypeName, Name: n.Name})
	}
	if res, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})
		MATCH (asset:Asset)-[:HAS_LOSS]->(loss)
		MATCH (e)-[t:HOLDS|TRANSPORTS|USES]->(asset)
		WHERE t.TraceStatus = 'CURRENT'
		RETURN e.HID AS entityHid, t.TraceStateHID AS stateHid`,
		map[string]any{"hid": lossHid}); err == nil {
		for res.Next(ctx) {
			rm := res.Record().AsMap()
			snapshot.Traces = append(snapshot.Traces, snapTrace{
				EntityHID: str2s(rm["entityHid"]), StateHID: str2s(rm["stateHid"]),
			})
		}
	}
	document := map[string]any{}
	lossProps, _ := tree["loss"].(map[string]any)
	if raw := str2s(lossProps["AttackTreeJSON"]); raw != "" {
		if err := json.Unmarshal([]byte(raw), &document); err != nil || document == nil {
			return nil, fmt.Errorf("stored AttackTreeJSON is malformed")
		}
	}
	if err := checkLossDocumentVersion(document); err != nil {
		return nil, err
	}
	if document["schema"] == nil && document["schemaVersion"] == nil {
		document["schema"] = "SSTPA-ATF-2.0"
	}
	document["validationSnapshot"] = snapshot
	document["validationFindings"] = []any{}
	version, _ := normalizeInt(lossProps["AttackTreeVersion"])
	document["attackTreeVersion"] = version + 1
	exact, _ := countLossPaths(tree, lossHid)
	document["pathCountExact"] = exact.String()
	document["pathCountSaturated"] = !exact.IsInt64()
	snapJSON, _ := json.Marshal(document)
	if _, err := tx.Run(ctx, `
		MATCH (loss:Loss {HID: $hid})
		SET loss.AttackTreeStatus = 'AUTO_GENERATED',
		    loss.TreeIsValid = $valid,
		    loss.TreeHasRVs = $hasRVs,
		    loss.PathCount = $paths,
		    loss.AttackTreeVersion = coalesce(loss.AttackTreeVersion, 0) + 1,
		    loss.AttackTreeJSON = $json,
		    loss.LastTreeBuild = datetime(),
		    loss.AttackTreeLastModified = datetime(),
		    loss.LastTouch = datetime()`,
		map[string]any{
			"hid": lossHid, "valid": stats.valid, "hasRVs": stats.hasRVs,
			"paths": stats.pathCount, "json": string(snapJSON),
		}); err != nil {
		return nil, err
	}
	_ = user
	tree, err = s.assembleTree(ctx, tx, lossHid)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"lossHid": lossHid, "status": "AUTO_GENERATED",
		"pathCount": stats.pathCount, "treeIsValid": stats.valid, "treeHasRVs": stats.hasRVs,
		"tree": tree,
	}, nil
}

// handleLossPaths enumerates root-to-leaf paths with per-metric values and RV
// status (SRS §6.5.10.5c, §6.5.10.15 compute).
func (s *Server) handleLossPaths(w http.ResponseWriter, r *http.Request) {
	lossHid := chi.URLParam(r, "lossHid")
	tree, err := s.db.Read(r.Context(), func(tx neo4j.ManagedTransaction) (any, error) {
		return s.assembleTree(r.Context(), tx, lossHid)
	})
	if err != nil {
		writeError(w, http.StatusNotFound, "loss tree query failed", err.Error())
		return
	}
	m := tree.(map[string]any)

	// Metric definitions from the Loss node.
	var metricDefs []metricDef
	if lossProps, ok := m["loss"].(map[string]any); ok {
		if mdRaw, ok := lossProps["MetricDefinitionsJSON"].(string); ok && mdRaw != "" {
			_ = json.Unmarshal([]byte(mdRaw), &metricDefs)
		}
	}

	nodesForValidation, _ := m["nodes"].([]atNode)
	if err := validateLossGraph(lossHid, nodesForValidation, toEdges(m["edges"])); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid Loss tree", err.Error())
		return
	}
	paths := enumeratePaths(m, lossHid, metricDefs)
	exact, rvExact := countLossPaths(m, lossHid)
	limit, offset := paginate(r, 100, 500)
	total := len(paths)
	end := offset + limit
	if end > total {
		end = total
	}
	if offset > total {
		offset = total
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"lossHid": lossHid,
		"paths":   paths[offset:end],
		"total":   total, "totalExact": exact.String(), "rvCountExact": rvExact.String(), "truncated": exact.Cmp(big.NewInt(int64(total))) > 0, "materializationLimit": lossPathLimit, "metricMode": "leaf-inputs", "limit": limit, "offset": offset,
	})
}

// --- pure computation helpers (shared by build and path endpoints) ---

type treeStats struct {
	pathCount int
	valid     bool
	hasRVs    bool
}

type metricDef struct {
	MetricName          string  `json:"metricName"`
	MetricDirection     string  `json:"metricDirection"` // MINIMIZE|MAXIMIZE
	LeafDefault         float64 `json:"leafDefault"`
	DefaultUnknown      bool    `json:"-"`
	ANDFormula          string  `json:"andFormula"` // SUM|PRODUCT|MIN|MAX
	ORFormula           string  `json:"orFormula"`
	SANDFormula         string  `json:"sandFormula"`
	AcceptanceThreshold float64 `json:"acceptanceThreshold"`
	ThresholdDirection  string  `json:"thresholdDirection"` // ABOVE|BELOW
}

type pathResult struct {
	PathNumber int                `json:"pathNumber"`
	Sequence   []string           `json:"sequence"`
	NameSeq    []string           `json:"nameSequence"`
	LeafType   string             `json:"leafType"`
	RVStatus   string             `json:"rvStatus"` // RV | ALLOWED_RV | BLOCKED | DERIVED
	Metrics    map[string]float64 `json:"metrics"`
}

// buildAdjacency returns children[source] = []edge and node lookup, dropping
// TailoredOut edges (§6.5.10.5c path enumeration excludes tailored edges).
func buildAdjacency(m map[string]any) (map[string]atNode, map[string][]atEdge) {
	nodes := map[string]atNode{}
	if nl, ok := m["nodes"].([]atNode); ok {
		for _, n := range nl {
			nodes[n.HID] = n
		}
	} else if nlAny, ok := m["nodes"].([]any); ok {
		for _, x := range nlAny {
			b, _ := json.Marshal(x)
			var n atNode
			_ = json.Unmarshal(b, &n)
			nodes[n.HID] = n
		}
	}
	children := map[string][]atEdge{}
	edges := toEdges(m["edges"])
	for _, e := range edges {
		if e.TailoredOut {
			continue
		}
		children[e.SourceHID] = append(children[e.SourceHID], e)
	}
	return nodes, children
}

func toEdges(v any) []atEdge {
	if el, ok := v.([]atEdge); ok {
		return el
	}
	var out []atEdge
	if elAny, ok := v.([]any); ok {
		for _, x := range elAny {
			b, _ := json.Marshal(x)
			var e atEdge
			_ = json.Unmarshal(b, &e)
			out = append(out, e)
		}
	}
	return out
}

func countLossPaths(m map[string]any, root string) (*big.Int, *big.Int) {
	nodes, children := buildAdjacency(m)
	type counts struct{ total, rv *big.Int }
	memo := map[string]counts{}
	visiting := map[string]bool{}
	var visit func(string) counts
	visit = func(id string) counts {
		if c, ok := memo[id]; ok {
			return c
		}
		if visiting[id] {
			return counts{new(big.Int), new(big.Int)}
		}
		visiting[id] = true
		total, rv := new(big.Int), new(big.Int)
		for _, edge := range children[id] {
			target := edge.TargetHID
			if nodes[target].TypeName == "Environment" {
				continue
			}
			if blocked, _ := edge.Props["CompleteBlock"].(bool); blocked {
				total.Add(total, big.NewInt(1))
				continue
			}
			if len(children[target]) == 0 {
				typ := nodes[target].TypeName
				if typ == "Attack" || typ == "Asset" || typ == "DerivedAsset" {
					total.Add(total, big.NewInt(1))
					if typ == "Attack" {
						if allowed, _ := edge.Props["AllowedRV"].(bool); !allowed {
							rv.Add(rv, big.NewInt(1))
						}
					}
				}
			} else {
				c := visit(target)
				total.Add(total, c.total)
				rv.Add(rv, c.rv)
			}
		}
		visiting[id] = false
		c := counts{total, rv}
		memo[id] = c
		return c
	}
	c := visit(root)
	return c.total, c.rv
}
func computeTreeStats(m map[string]any, defs []metricDef) treeStats {
	total, rv := countLossPaths(m, str2s(nested(m, "loss", "HID")))
	// Neo4j Integer is signed 64-bit; the read endpoint also exposes the exact
	// decimal count, without pretending a capped materialization is the total.
	max := int64(^uint64(0) >> 1)
	value := max
	if total.IsInt64() {
		value = total.Int64()
	}
	return treeStats{pathCount: int(value), valid: total.Sign() > 0, hasRVs: rv.Sign() > 0}
}

// enumeratePaths performs bounded DFS over the DAG rooted at lossHid.
func enumeratePaths(m map[string]any, lossHid string, defs []metricDef) []pathResult {
	nodes, children := buildAdjacency(m)
	if lossHid == "" {
		if lp, ok := m["loss"].(map[string]any); ok {
			lossHid, _ = lp["HID"].(string)
		}
	}
	var results []pathResult
	const maxLen = 20

	var dfs func(cur string, seq []string, visited map[string]bool, incoming *atEdge)
	dfs = func(cur string, seq []string, visited map[string]bool, incoming *atEdge) {
		if len(seq)-1 > maxLen || len(results) >= lossPathLimit {
			return
		}
		kids := children[cur]
		curNode := nodes[cur]
		// Leaf classification (§6.5.10.5c terminal leaves).
		blocked := false
		if incoming != nil {
			blocked, _ = incoming.Props["CompleteBlock"].(bool)
		}
		if blocked || len(kids) == 0 {
			p := pathResult{Sequence: append([]string{}, seq...)}
			for _, h := range p.Sequence {
				p.NameSeq = append(p.NameSeq, nodes[h].Name)
			}
			p.LeafType = curNode.TypeName
			if blocked {
				p.RVStatus = "BLOCKED"
			} else {
				switch curNode.TypeName {
				case "Attack":
					allowed := false
					if incoming != nil {
						allowed, _ = incoming.Props["AllowedRV"].(bool)
					}
					if allowed {
						p.RVStatus = "ALLOWED_RV"
					} else {
						p.RVStatus = "RV"
					}
				case "Countermeasure":
					return
				case "Asset", "DerivedAsset":
					p.RVStatus = "DERIVED"
				default:
					return
				}
			}
			p.Metrics = computePathMetrics(p.Sequence, nodes, defs)
			results = append(results, p)
			return
		}
		for _, e := range kids {
			if visited[e.TargetHID] {
				continue // DAG safety
			}
			visited[e.TargetHID] = true
			dfs(e.TargetHID, append(seq, e.TargetHID), visited, &e)
			delete(visited, e.TargetHID)
		}
	}
	dfs(lossHid, []string{lossHid}, map[string]bool{lossHid: true}, nil)
	for i := range results {
		results[i].PathNumber = i + 1
	}
	// Default sort: ascending by first metric (§6.5.10.5c).
	if len(defs) > 0 {
		mn := defs[0].MetricName
		sort.SliceStable(results, func(i, j int) bool {
			a, knownA := results[i].Metrics[mn]
			b, knownB := results[j].Metrics[mn]
			if knownA != knownB {
				return knownA
			}
			return a < b
		})
		for i := range results {
			results[i].PathNumber = i + 1
		}
	}
	return results
}

// computePathMetrics reports terminal leaf inputs only. Parent aggregation and
// coherent scenarios are computed by the shared approved frontend metric engine;
// branch raw inputs never become extra contributions or double-count the leaf.
func computePathMetrics(seq []string, nodes map[string]atNode, defs []metricDef) map[string]float64 {
	out := map[string]float64{}
	if len(seq) == 0 {
		return out
	}
	leaf := nodes[seq[len(seq)-1]]
	var inputs map[string]any
	_ = json.Unmarshal([]byte(str2s(leaf.Props["MetricsJSON"])), &inputs)
	for _, d := range defs {
		value, known := d.LeafDefault, !d.DefaultUnknown
		if raw := inputs[d.MetricName]; raw != nil {
			if n, ok := number(raw); ok {
				value, known = n, true
			} else if b, ok := raw.(bool); ok {
				known = true
				value = 0
				if b {
					value = 1
				}
			}
		}
		if known {
			out[d.MetricName] = value
		}
	}
	return out
}

func (d *metricDef) UnmarshalJSON(raw []byte) error {
	type plain metricDef
	var old plain
	if err := json.Unmarshal(raw, &old); err != nil {
		return err
	}
	*d = metricDef(old)
	var fields map[string]any
	if err := json.Unmarshal(raw, &fields); err != nil {
		return err
	}
	d.MetricName = metricID(fields)
	d.ANDFormula = str2s(getMetricField(fields, "and", "andFormula", "ANDFormula"))
	d.ORFormula = str2s(getMetricField(fields, "or", "orFormula", "ORFormula"))
	d.SANDFormula = str2s(getMetricField(fields, "sand", "sandFormula", "SANDFormula"))
	d.LeafDefault = 0
	value := getMetricField(fields, "defaultValue", "leafDefault", "LeafDefault")
	d.DefaultUnknown = value == nil
	if n, ok := number(value); ok {
		d.LeafDefault = n
	}
	return nil
}

// edgeAllowedRV reports whether the terminal edge into attackHid has AllowedRV.
func edgeAllowedRV(m map[string]any, attackHid string) bool {
	for _, e := range toEdges(m["edges"]) {
		if e.TargetHID == attackHid {
			if e.Props == nil {
				continue
			}
			if av, ok := e.Props["AllowedRV"].(bool); ok && av {
				return true
			}
		}
	}
	return false
}

func str2s(v any) string {
	s, _ := v.(string)
	return s
}

func nested(m map[string]any, keys ...string) any {
	cur := any(m)
	for _, k := range keys {
		mm, ok := cur.(map[string]any)
		if !ok {
			return nil
		}
		cur = mm[k]
	}
	return cur
}

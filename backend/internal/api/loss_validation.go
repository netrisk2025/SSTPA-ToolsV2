// Loss integration invariants shared by Commit and automatic construction.
package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

const lossNodeLimit = 1000
const lossDepthLimit = 20
const lossWidthLimit = 50
const lossPathLimit = 10000
const lossDecompositionAdvice = "Decompose the system to create smaller trees."

var errLossConflict = errors.New("attack tree revision conflict")

type lossPrecondition struct {
	LossHID           string `json:"lossHid"`
	AttackTreeVersion int64  `json:"attackTreeVersion"`
}
type lossRevision struct {
	Version  int64
	Document string
}
type lossShape struct {
	Nodes  int            `json:"nodes"`
	Depth  int            `json:"depth"`
	Width  int            `json:"width"`
	Depths map[string]int `json:"depths"`
	Cyclic bool           `json:"cyclic"`
}

// Kahn traversal includes tailored and rolled-up branches. Shared nodes take
// their longest-path rank; presentation does not change semantic capacity.
func shapeOfLoss(root string, nodes []atNode, edges []atEdge) (lossShape, error) {
	shape := lossShape{Nodes: len(nodes), Depths: map[string]int{root: 0}}
	indegree := map[string]int{}
	children := map[string][]string{}
	for _, n := range nodes {
		if _, duplicate := indegree[n.HID]; duplicate {
			return shape, fmt.Errorf("duplicate tree node %s", n.HID)
		}
		indegree[n.HID] = 0
	}
	if _, ok := indegree[root]; !ok {
		return shape, fmt.Errorf("Loss root is missing")
	}
	pairs := map[string]bool{}
	for _, e := range edges {
		if _, ok := indegree[e.SourceHID]; !ok {
			return shape, fmt.Errorf("missing source %s", e.SourceHID)
		}
		if _, ok := indegree[e.TargetHID]; !ok {
			return shape, fmt.Errorf("missing target %s", e.TargetHID)
		}
		pair := e.SourceHID + "\x00" + e.TargetHID
		if pairs[pair] {
			return shape, fmt.Errorf("duplicate scoped relationship %s → %s", e.SourceHID, e.TargetHID)
		}
		pairs[pair] = true
		indegree[e.TargetHID]++
		children[e.SourceHID] = append(children[e.SourceHID], e.TargetHID)
	}
	if indegree[root] != 0 {
		return shape, fmt.Errorf("Loss root cannot have an incoming tree edge")
	}
	queue := []string{}
	for id, degree := range indegree {
		if degree == 0 {
			queue = append(queue, id)
		}
	}
	for i := 0; i < len(queue); i++ {
		id := queue[i]
		for _, child := range children[id] {
			if depth, reachable := shape.Depths[id]; reachable && depth+1 > shape.Depths[child] {
				shape.Depths[child] = depth + 1
			}
			indegree[child]--
			if indegree[child] == 0 {
				queue = append(queue, child)
			}
		}
	}
	shape.Cyclic = len(queue) != len(nodes)
	if shape.Cyclic {
		return shape, fmt.Errorf("Attack Tree contains a cycle")
	}
	if len(shape.Depths) != len(nodes) {
		return shape, fmt.Errorf("every tree node must be reachable from its Loss root")
	}
	ranks := map[int]int{}
	for _, depth := range shape.Depths {
		ranks[depth]++
		if depth > shape.Depth {
			shape.Depth = depth
		}
		if ranks[depth] > shape.Width {
			shape.Width = ranks[depth]
		}
	}
	for _, cap := range []struct {
		name          string
		actual, limit int
	}{{"nodes", shape.Nodes, lossNodeLimit}, {"depth", shape.Depth, lossDepthLimit}, {"width", shape.Width, lossWidthLimit}} {
		if cap.actual > cap.limit {
			return shape, fmt.Errorf("%s: %d exceeds limit %d. %s", cap.name, cap.actual, cap.limit, lossDecompositionAdvice)
		}
	}
	return shape, nil
}
func lossCapacityFindings(shape lossShape) []validationFinding {
	findings := []validationFinding{}
	for _, cap := range []struct {
		name          string
		actual, limit int
	}{{"nodes", shape.Nodes, lossNodeLimit}, {"depth", shape.Depth, lossDepthLimit}, {"width", shape.Width, lossWidthLimit}} {
		if cap.actual*5 >= cap.limit*4 {
			severity, kind := "WARNING", "NEAR_LIMIT"
			if cap.actual > cap.limit {
				severity, kind = "ERROR", "LIMIT"
			}
			findings = append(findings, validationFinding{Severity: severity, Type: kind, Message: fmt.Sprintf("%s: %d / %d (80%% or more). %s", cap.name, cap.actual, cap.limit, lossDecompositionAdvice)})
		}
	}
	return findings
}
func validateLossGraph(root string, nodes []atNode, edges []atEdge) error {
	if _, err := shapeOfLoss(root, nodes, edges); err != nil {
		return err
	}
	types := map[string]string{}
	outgoing := map[string][]atEdge{}
	allOut := map[string]int{}
	for _, n := range nodes {
		types[n.HID] = n.TypeName
	}
	for _, e := range edges {
		allOut[e.SourceHID]++
		if !e.TailoredOut && types[e.TargetHID] != "Environment" {
			outgoing[e.SourceHID] = append(outgoing[e.SourceHID], e)
		}
		if types[e.TargetHID] == "Environment" && e.LogicOperator != "AND" {
			return fmt.Errorf("Environment context uses AND")
		}
		if e.LogicOperator != "AND" && e.LogicOperator != "OR" && e.LogicOperator != "SAND" {
			return fmt.Errorf("invalid tree operator %q", e.LogicOperator)
		}
		if complete, _ := e.Props["CompleteBlock"].(bool); complete && (types[e.SourceHID] != "Attack" || types[e.TargetHID] != "Countermeasure") {
			return fmt.Errorf("CompleteBlock requires Attack → Countermeasure")
		}
	}
	for _, e := range edges {
		if allowed, _ := e.Props["AllowedRV"].(bool); allowed && (types[e.TargetHID] != "Attack" || allOut[e.TargetHID] != 0) {
			return fmt.Errorf("AllowedRV requires a leaf Attack")
		}
	}
	for id, es := range outgoing {
		gate := es[0].LogicOperator
		seq := []int64{}
		for _, e := range es {
			if e.LogicOperator != gate {
				return fmt.Errorf("active sibling relationships at %s must use one operator", id)
			}
			if gate == "SAND" {
				if e.SANDSequence == nil {
					return fmt.Errorf("SANDSequence missing at %s", id)
				}
				seq = append(seq, *e.SANDSequence)
			}
		}
		if id == root && gate == "AND" {
			return fmt.Errorf("root State group uses OR or SAND")
		}
		sort.Slice(seq, func(i, j int) bool { return seq[i] < seq[j] })
		for i, n := range seq {
			if n != int64(i) {
				return fmt.Errorf("SANDSequence must be contiguous from zero at %s", id)
			}
		}
	}
	return nil
}

// The self-dependent SET deliberately takes a Neo4j write lock before reading
// the current revision, so two concurrent drafts cannot both pass their guard.
func lockLossRevision(ctx context.Context, tx neo4j.ManagedTransaction, hid string, expected *int64) (lossRevision, error) {
	res, err := tx.Run(ctx, `MATCH (loss:SSTPA:Loss {HID:$hid})
 WHERE NOT loss:REF AND NOT coalesce(loss._ReadOnly,false)
 SET loss.AttackTreeVersion=coalesce(loss.AttackTreeVersion,0)
 RETURN loss.AttackTreeVersion AS version, loss.AttackTreeJSON AS document`, map[string]any{"hid": hid})
	if err != nil {
		return lossRevision{}, err
	}
	rec, err := res.Single(ctx)
	if err != nil {
		return lossRevision{}, fmt.Errorf("Loss %s not found", hid)
	}
	m := rec.AsMap()
	rev := lossRevision{Document: str2s(m["document"])}
	rev.Version, _ = m["version"].(int64)
	if expected != nil && *expected != rev.Version {
		return rev, fmt.Errorf("%w: %s is version %d; draft used %d. Reload and reconcile the draft", errLossConflict, hid, rev.Version, *expected)
	}
	return rev, nil
}

// Shared Core edits invalidate all dependent revisions. Only explicit edited
// Loss scopes require a client precondition; other production tools stay usable.
func (s *Server) prepareLossCommit(ctx context.Context, tx neo4j.ManagedTransaction, req commitRequest) (map[string]lossRevision, error) {
	hids, explicit := []string{}, map[string]bool{}
	for _, op := range req.Operations {
		if op.HID != "" {
			hids = append(hids, op.HID)
		}
		if op.SourceHID != "" && !strings.HasPrefix(op.SourceHID, "$") {
			hids = append(hids, op.SourceHID)
		}
		if op.TargetHID != "" && !strings.HasPrefix(op.TargetHID, "$") {
			hids = append(hids, op.TargetHID)
		}
		if op.Type == "AT_RELATES_TO" {
			if hid := str2s(op.Props["LossHID"]); hid != "" && !strings.HasPrefix(hid, "$") {
				explicit[hid] = true
			}
		}
	}
	expected := map[string]int64{}
	for _, p := range req.LossPreconditions {
		if p.LossHID == "" || p.AttackTreeVersion < 0 {
			return nil, fmt.Errorf("invalid Loss revision precondition")
		}
		if _, duplicate := expected[p.LossHID]; duplicate {
			return nil, fmt.Errorf("duplicate Loss revision precondition")
		}
		expected[p.LossHID] = p.AttackTreeVersion
		explicit[p.LossHID] = true
	}
	affected := map[string]bool{}
	for hid := range explicit {
		affected[hid] = true
	}
	if len(hids) > 0 {
		res, err := tx.Run(ctx, `MATCH (n:SSTPA) WHERE n.HID IN $hids
 OPTIONAL MATCH (n)-[edge:AT_RELATES_TO]-()
 RETURN DISTINCT CASE WHEN n:Loss THEN n.HID ELSE null END AS root,edge.LossHID AS dependent`, map[string]any{"hids": hids})
		if err != nil {
			return nil, err
		}
		for res.Next(ctx) {
			m := res.Record().AsMap()
			if hid := str2s(m["root"]); hid != "" {
				affected[hid] = true
				explicit[hid] = true
			}
			if hid := str2s(m["dependent"]); hid != "" {
				affected[hid] = true
			}
		}
		if err := res.Err(); err != nil {
			return nil, err
		}
	}
	keys := make([]string, 0, len(affected))
	for hid := range affected {
		keys = append(keys, hid)
	}
	sort.Strings(keys)
	states := map[string]lossRevision{}
	for _, hid := range keys {
		version, hasExpected := expected[hid]
		if req.ToolID == "sstpa.loss" && explicit[hid] && !hasExpected {
			return nil, fmt.Errorf("%w: lossPreconditions required for %s", errLossConflict, hid)
		}
		var guard *int64
		if hasExpected {
			guard = &version
		}
		rev, err := lockLossRevision(ctx, tx, hid, guard)
		if err != nil {
			return nil, err
		}
		states[hid] = rev
	}
	return states, nil
}

// Analyst view writes cannot forge a fresh validation snapshot or erase server
// reconciliation metadata. Unknown top-level and nested view fields survive.
func mergeLossDocument(existing, incoming string) (string, error) {
	base := map[string]any{}
	if existing != "" && existing != "null" {
		if err := json.Unmarshal([]byte(existing), &base); err != nil || base == nil {
			return "", fmt.Errorf("stored AttackTreeJSON is not a JSON object; repair it before saving")
		}
	}
	if err := checkLossDocumentVersion(base); err != nil {
		return "", err
	}
	next := map[string]any{}
	if incoming != "" && incoming != "null" {
		if err := json.Unmarshal([]byte(incoming), &next); err != nil || next == nil {
			return "", fmt.Errorf("AttackTreeJSON must be a JSON object")
		}
	}
	protected := map[string]bool{"schema": true, "schemaVersion": true, "lossHID": true, "lossuuid": true, "assetHID": true, "environmentHID": true, "builtAt": true, "attackTreeVersion": true, "validationSnapshot": true, "validationFindings": true, "pathCountExact": true, "pathCountSaturated": true}
	for k, v := range next {
		if protected[k] {
			continue
		}
		if old, ok := base[k].(map[string]any); ok {
			if fresh, ok := v.(map[string]any); ok {
				v = mergeLossObject(old, fresh)
			}
		}
		base[k] = v
	}
	if base["schema"] == nil && base["schemaVersion"] == nil {
		base["schema"] = "SSTPA-ATF-2.0"
	}
	if err := validateLossView(base["lossToolView"]); err != nil {
		return "", err
	}
	b, err := json.Marshal(base)
	return string(b), err
}
func mergeLossObject(old, next map[string]any) map[string]any {
	for k, v := range next {
		if child, ok := old[k].(map[string]any); ok {
			if fresh, ok := v.(map[string]any); ok {
				v = mergeLossObject(child, fresh)
			}
		}
		old[k] = v
	}
	return old
}
func resolveLossNodeIDs(raw string, created map[string]string) (string, error) {
	if raw == "" {
		return raw, nil
	}
	var doc map[string]any
	if err := json.Unmarshal([]byte(raw), &doc); err != nil {
		return "", err
	}
	if view, ok := doc["lossToolView"].(map[string]any); ok {
		if ids, ok := view["nodeIds"].(map[string]any); ok {
			for key, id := range ids {
				if strings.HasPrefix(key, "$") {
					hid, ok := created[strings.TrimPrefix(key, "$")]
					if !ok {
						return "", fmt.Errorf("unresolved tree identity %s", key)
					}
					if old, exists := ids[hid]; exists && old != id {
						return "", fmt.Errorf("conflicting tree identity for %s", hid)
					}
					delete(ids, key)
					ids[hid] = id
				}
			}
		}
	}
	if err := validateLossView(doc["lossToolView"]); err != nil {
		return "", err
	}
	b, err := json.Marshal(doc)
	return string(b), err
}
func (s *Server) finishLossCommit(ctx context.Context, tx neo4j.ManagedTransaction, states map[string]lossRevision, created map[string]string, enforceStructure bool) error {
	keys := make([]string, 0, len(states))
	for hid := range states {
		keys = append(keys, hid)
	}
	sort.Strings(keys)
	for _, hid := range keys {
		exists, err := tx.Run(ctx, `MATCH (loss:Loss {HID:$hid}) RETURN count(loss) AS n`, map[string]any{"hid": hid})
		if err != nil {
			return err
		}
		rec, err := exists.Single(ctx)
		if err != nil {
			return err
		}
		if rec.AsMap()["n"] == int64(0) {
			continue
		}
		tree, err := s.assembleTree(ctx, tx, hid)
		if err != nil {
			return err
		}
		nodes, _ := tree["nodes"].([]atNode)
		if err := validateLossGraph(hid, nodes, toEdges(tree["edges"])); err != nil && enforceStructure {
			return err
		}
		props, _ := tree["loss"].(map[string]any)
		if enforceStructure {
			if err := validateLossAnalysis(props, nodes, toEdges(tree["edges"])); err != nil {
				return err
			}
		}
		raw, err := resolveLossNodeIDs(str2s(props["AttackTreeJSON"]), created)
		if err != nil {
			return err
		}
		doc := map[string]any{}
		if raw != "" {
			if err := json.Unmarshal([]byte(raw), &doc); err != nil {
				return err
			}
		}
		doc["attackTreeVersion"] = states[hid].Version + 1
		doc["validationFindings"] = tree["validationFindings"]
		count, _ := countLossPaths(tree, hid)
		doc["pathCountExact"] = count.String()
		doc["pathCountSaturated"] = !count.IsInt64()
		if doc["schema"] == nil && doc["schemaVersion"] == nil {
			doc["schema"] = "SSTPA-ATF-2.0"
		}
		encoded, err := json.Marshal(doc)
		if err != nil {
			return err
		}
		stats := computeTreeStats(tree, nil)
		status := str2s(props["AttackTreeStatus"])
		if len(toEdges(tree["edges"])) > 0 && (status == "" || status == "NOT_BUILT" || status == "AUTO_GENERATED") {
			status = "ANALYST_REFINED"
		}
		if findings, ok := tree["validationFindings"].([]validationFinding); ok {
			for _, f := range findings {
				if f.Severity == "ERROR" {
					status = "INVALIDATED"
					stats.valid = false
				}
			}
		}
		if _, err := tx.Run(ctx, `MATCH (loss:Loss {HID:$hid})
 SET loss.AttackTreeVersion=$version,loss.AttackTreeLastModified=datetime(),loss.LastTouch=datetime(),
 loss.AttackTreeJSON=$json,loss.TreeIsValid=$valid,loss.TreeHasRVs=$rvs,loss.PathCount=$paths,loss.AttackTreeStatus=$status
 WITH loss OPTIONAL MATCH ()-[rel:AT_RELATES_TO {LossHID:$hid}]->() REMOVE rel.MetricCacheJSON`, map[string]any{"hid": hid, "version": states[hid].Version + 1, "json": string(encoded), "valid": stats.valid, "rvs": stats.hasRVs, "paths": stats.pathCount, "status": status}); err != nil {
			return err
		}
	}
	return nil
}

func checkLossDocumentVersion(doc map[string]any) error {
	if schema, ok := doc["schema"]; ok && schema != "SSTPA-ATF-2.0" {
		return fmt.Errorf("unsupported AttackTreeJSON schema; use a compatible Loss Tool")
	}
	if version, ok := doc["schemaVersion"]; ok && version != "1.0" {
		return fmt.Errorf("unsupported AttackTreeJSON schemaVersion; use a compatible Loss Tool")
	}
	return validateLossView(doc["lossToolView"])
}

// Reachability visits each node once. A variable-length Cypher pattern can
// enumerate exponentially many paths in a dense shared DAG even at depth 20.
func lossReaches(children map[string][]string, from, to string) bool {
	seen := map[string]bool{from: true}
	queue := []string{from}
	for i := 0; i < len(queue); i++ {
		if queue[i] == to {
			return true
		}
		for _, child := range children[queue[i]] {
			if !seen[child] {
				seen[child] = true
				queue = append(queue, child)
			}
		}
	}
	return false
}
func buildLossCounterTiers(ctx context.Context, tx neo4j.ManagedTransaction, lossHID, lossUUID string) error {
	res, err := tx.Run(ctx, `MATCH (a)-[:AT_RELATES_TO {LossHID:$hid}]->(b) RETURN a.HID AS source,b.HID AS target`, map[string]any{"hid": lossHID})
	if err != nil {
		return err
	}
	children := map[string][]string{}
	pairs := map[string]bool{}
	ids := map[string]bool{lossHID: true}
	edges := []atEdge{}
	for res.Next(ctx) {
		m := res.Record().AsMap()
		a, b := str2s(m["source"]), str2s(m["target"])
		children[a] = append(children[a], b)
		pairs[a+"\x00"+b] = true
		ids[a] = true
		ids[b] = true
		edges = append(edges, atEdge{SourceHID: a, TargetHID: b})
	}
	if err := res.Err(); err != nil {
		return err
	}
	phases := []struct{ query, key, gate string }{
		{`MATCH ()-[:AT_RELATES_TO {LossHID:$hid}]->(cm:Countermeasure) MATCH (attack:Attack)-[:DEFEATS]->(cm) RETURN DISTINCT cm.HID AS source,attack.HID AS target ORDER BY source,target`, "counterKey", "OR"},
		{`MATCH (:Countermeasure)-[:AT_RELATES_TO {LossHID:$hid}]->(attack:Attack) MATCH (cm:Countermeasure)-[:BLOCKS]->(attack) RETURN DISTINCT attack.HID AS source,cm.HID AS target ORDER BY source,target`, "cmKey", "AND"},
	}
	// One extra round detects overflow instead of silently truncating a valid
	// canonical chain whose analytical projection would exceed the tree limit.
	for round := 0; round < lossDepthLimit; round++ {
		created := 0
		for _, phase := range phases {
			candidates, err := tx.Run(ctx, phase.query, map[string]any{"hid": lossHID})
			if err != nil {
				return err
			}
			planned := []map[string]any{}
			for candidates.Next(ctx) {
				m := candidates.Record().AsMap()
				a, b := str2s(m["source"]), str2s(m["target"])
				pair := a + "\x00" + b
				if pairs[pair] || lossReaches(children, b, a) {
					continue
				}
				pairs[pair] = true
				children[a] = append(children[a], b)
				ids[a] = true
				ids[b] = true
				edges = append(edges, atEdge{SourceHID: a, TargetHID: b})
				if len(ids) > lossNodeLimit {
					return fmt.Errorf("nodes: %d exceeds limit %d. %s", len(ids), lossNodeLimit, lossDecompositionAdvice)
				}
				planned = append(planned, map[string]any{"source": a, "target": b})
			}
			if err := candidates.Err(); err != nil {
				return err
			}
			if len(planned) == 0 {
				continue
			}
			nodes := make([]atNode, 0, len(ids))
			for id := range ids {
				nodes = append(nodes, atNode{HID: id})
			}
			if _, err := shapeOfLoss(lossHID, nodes, edges); err != nil {
				return err
			}
			query := fmt.Sprintf(`UNWIND $pairs AS pair MATCH (a:SSTPA {HID:pair.source}),(b:SSTPA {HID:pair.target})
    MERGE (a)-[edge:AT_RELATES_TO {LossHID:$hid,%s:pair.target}]->(b)
    ON CREATE SET edge.Lossuuid=$uuid,edge.LogicOperator=$gate,edge.TailoredOut=false`, phase.key)
			if _, err := tx.Run(ctx, query, map[string]any{"pairs": planned, "hid": lossHID, "uuid": lossUUID, "gate": phase.gate}); err != nil {
				return err
			}
			created += len(planned)
		}
		if created == 0 {
			return nil
		}
	}
	return fmt.Errorf("counter-attack construction exceeded depth limit %d. %s", lossDepthLimit, lossDecompositionAdvice)
}

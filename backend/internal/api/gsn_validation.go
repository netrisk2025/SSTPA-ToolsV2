// GSN v3 core structural invariants for canonical Core commits.
// Layout is presentation state; neither GoalStructure nor imported display
// identities grant graph authority. Legacy violations remain readable/repairable.
package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/netrisk2025/SSTPA-ToolsV2/backend/internal/schema"
)

var gsnLabels = []string{"GsnGoal", "GsnStrategy", "GsnSolution", "GsnContext", "GsnAssumption", "GsnJustification"}
var gsnPrefixes = map[string]string{"GsnGoal": "G", "GsnStrategy": "S", "GsnSolution": "Sn", "GsnContext": "C", "GsnAssumption": "A", "GsnJustification": "J"}

type gsnNode struct {
	HID, Label, SoI, DisplayID string
	Root, Undeveloped          bool
}
type gsnEdge struct{ Source, Target, Type string }
type gsnGraph struct {
	Nodes map[string]gsnNode
	Edges []gsnEdge
}
type gsnViolation struct {
	Count   int
	Message string
}
type gsnCommitState struct {
	SoIs   []string
	Before map[string]gsnViolation
}

func isGsnLabel(label string) bool { return gsnPrefixes[label] != "" }
func isGsnStructureRel(typ string) bool {
	return typ == "SUPPORTED_BY" || typ == "IN_CONTEXT_OF" || typ == "HAS_GOAL"
}
func gsnIDProperty(label string) string { return strings.TrimPrefix(label, "Gsn") + "ID" }
func gsnDisplayID(label, hid string, props map[string]any) string {
	if n, ok := props[gsnIDProperty(label)]; ok && n != nil {
		text := strings.TrimSpace(fmt.Sprint(n))
		if text != "" {
			if _, err := strconv.ParseInt(text, 10, 64); err != nil {
				return text
			}
			return gsnPrefixes[label] + text
		}
	}
	return hid
}

// Every semantic writer takes the same existing System lock before inspecting
// GSN state. The temporary lock property is removed in the same transaction;
// no analytical data or ownership is changed by acquiring the lock.
func (s *Server) prepareGsnCommit(ctx context.Context, tx neo4j.ManagedTransaction, req commitRequest) (*gsnCommitState, error) {
	scopes := map[string]bool{}
	refs := map[string]bool{}
	for _, op := range req.Operations {
		if op.Op == "createNode" && isGsnLabel(op.Label) {
			h, err := schema.ParseHID(req.SoIHID)
			if err != nil || h.TypePrefix != "SYS" {
				return nil, fmt.Errorf("GSN creation requires a System SoI scope")
			}
			scopes[h.SoIKey()] = true
		}
		// Pure display updates do not require an otherwise-invalid legacy argument
		// to be rewritten. All semantic updates/deletions still enter this guard.
		if op.HID != "" && (op.Op == "deleteNode" || (op.Op == "updateNode" && !gsnLayoutOnly(op.Props))) {
			refs[op.HID] = true
		}
		if isGsnStructureRel(op.Type) {
			for _, hid := range []string{op.SourceHID, op.TargetHID} {
				if hid != "" && !strings.HasPrefix(hid, "$") {
					refs[hid] = true
				}
			}
		}
	}
	if len(refs) > 0 {
		hids := []string{}
		for hid := range refs {
			hids = append(hids, hid)
		}
		res, err := tx.Run(ctx, `MATCH (n:SSTPA) WHERE n.HID IN $hids AND n.TypeName IN $labels RETURN DISTINCT n.SoIIndex AS soi, n.HID AS hid`, map[string]any{"hids": hids, "labels": gsnLabels})
		if err != nil {
			return nil, err
		}
		for res.Next(ctx) {
			row := res.Record().AsMap()
			soi := str2s(row["soi"])
			if soi == "" {
				return nil, fmt.Errorf("GSN node %s has no canonical SoI scope; semantic edits require a valid scope", str2s(row["hid"]))
			}
			scopes[soi] = true
		}
		if err := res.Err(); err != nil {
			return nil, err
		}
	}
	if len(scopes) == 0 {
		return nil, nil
	}
	sois, err := expandGsnScopes(ctx, tx, scopes)
	if err != nil {
		return nil, err
	}

	for _, soi := range sois {
		res, err := tx.Run(ctx, `MATCH (n:SSTPA:System {SoIIndex:$soi}) SET n._GsnCommitLock = true REMOVE n._GsnCommitLock RETURN n.HID AS hid`, map[string]any{"soi": soi})
		if err != nil {
			return nil, err
		}
		if _, err := res.Single(ctx); err != nil {
			return nil, fmt.Errorf("GSN scope %s has no unique System", soi)
		}
	}
	graph, err := loadGsnGraph(ctx, tx, sois)
	if err != nil {
		return nil, err
	}
	return &gsnCommitState{SoIs: sois, Before: s.gsnViolations(graph)}, nil
}

// expandGsnScopes is shared by advisory validation and atomic Commit. Legacy
// cross-scope detours must not be invisible to either path.
func expandGsnScopes(ctx context.Context, tx neo4j.ManagedTransaction, scopes map[string]bool) ([]string, error) {
	if scopes[""] {
		return nil, fmt.Errorf("GSN relationship endpoints require a canonical SoI scope")
	}
	// Legacy cross-scope links are never rewritten. Include their connected
	// scopes so a new in-scope edge cannot close a cycle through old invalid
	// links outside the original scope. Each iteration adds finite graph scopes;
	// there is no recursive Cypher path enumeration or arbitrary depth cutoff.
	for {
		current := []string{}
		for soi := range scopes {
			current = append(current, soi)
		}
		res, err := tx.Run(ctx, `MATCH (a:SSTPA)-[:SUPPORTED_BY|IN_CONTEXT_OF]-(b:SSTPA)
   WHERE a.SoIIndex IN $sois RETURN DISTINCT b.SoIIndex AS soi, b.HID AS hid`, map[string]any{"sois": current})
		if err != nil {
			return nil, err
		}
		grew := false
		for res.Next(ctx) {
			row := res.Record().AsMap()
			soi := str2s(row["soi"])
			if soi == "" {
				return nil, fmt.Errorf("GSN-linked node %s has no canonical SoI scope; semantic edits require a valid scope", str2s(row["hid"]))
			}
			if !scopes[soi] {
				scopes[soi] = true
				grew = true
			}
		}
		if err := res.Err(); err != nil {
			return nil, err
		}
		if !grew {
			break
		}
	}

	sois := []string{}
	for soi := range scopes {
		sois = append(sois, soi)
	}
	sort.Strings(sois)
	return sois, nil
}

func gsnLayoutOnly(props map[string]any) bool {
	if len(props) == 0 {
		return true
	}
	for key := range props {
		if key != "GoalStructure" {
			return false
		}
	}
	return true
}

func loadGsnGraph(ctx context.Context, tx neo4j.ManagedTransaction, sois []string) (gsnGraph, error) {
	graph := gsnGraph{Nodes: map[string]gsnNode{}}
	res, err := tx.Run(ctx, `MATCH (n:SSTPA) WHERE n.SoIIndex IN $sois AND (n.TypeName IN $labels OR EXISTS { MATCH (n)-[:SUPPORTED_BY|IN_CONTEXT_OF]-() })
 RETURN properties(n) AS props, EXISTS { MATCH (:Asset)-[:HAS_GOAL]->(n) } AS root`, map[string]any{"sois": sois, "labels": gsnLabels})
	if err != nil {
		return graph, err
	}
	for res.Next(ctx) {
		m := res.Record().AsMap()
		p, _ := m["props"].(map[string]any)
		n := gsnNode{HID: str2s(p["HID"]), Label: str2s(p["TypeName"]), SoI: str2s(p["SoIIndex"])}
		n.DisplayID = gsnDisplayID(n.Label, n.HID, p)
		n.Root, _ = m["root"].(bool)
		n.Undeveloped, _ = p["Undeveloped"].(bool)
		graph.Nodes[n.HID] = n
	}
	if err := res.Err(); err != nil {
		return graph, err
	}
	res, err = tx.Run(ctx, `MATCH (a:SSTPA)-[r:SUPPORTED_BY|IN_CONTEXT_OF]->(b:SSTPA)
 WHERE a.SoIIndex IN $sois OR b.SoIIndex IN $sois
 RETURN a.HID AS source, b.HID AS target, type(r) AS type`, map[string]any{"sois": sois})
	if err != nil {
		return graph, err
	}
	for res.Next(ctx) {
		m := res.Record().AsMap()
		graph.Edges = append(graph.Edges, gsnEdge{Source: str2s(m["source"]), Target: str2s(m["target"]), Type: str2s(m["type"])})
	}
	return graph, res.Err()
}

// The comparison admits incremental repair of legacy data but never introduces
// or increases a structural violation. No migration, deletion or relabeling is
// performed. Completion gaps (unsupported Goals / missing evidence) remain
// review findings, so an analyst can commit an honest work-in-progress case.
func (s *Server) finishGsnCommit(ctx context.Context, tx neo4j.ManagedTransaction, state *gsnCommitState) error {
	if state == nil {
		return nil
	}
	graph, err := loadGsnGraph(ctx, tx, state.SoIs)
	if err != nil {
		return err
	}
	return rejectNewGsnViolations(state.Before, s.gsnViolations(graph))
}
func rejectNewGsnViolations(before, after map[string]gsnViolation) error {
	keys := []string{}
	for key := range after {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	for _, key := range keys {
		v := after[key]
		if v.Count > before[key].Count {
			return fmt.Errorf("GSN core commit rejected: %s", v.Message)
		}
	}
	return nil
}

func (s *Server) gsnViolations(graph gsnGraph) map[string]gsnViolation {
	violations := map[string]gsnViolation{}
	add := func(key, message string) { v := violations[key]; v.Count++; v.Message = message; violations[key] = v }
	children := map[string][]string{}
	indegree := map[string]int{}
	pairs := map[string]int{}
	for hid := range graph.Nodes {
		indegree[hid] = 0
	}
	for _, edge := range graph.Edges {
		source, srcOK := graph.Nodes[edge.Source]
		target, tgtOK := graph.Nodes[edge.Target]
		key := edge.Source + "|" + edge.Type + "|" + edge.Target
		pairs[key]++
		if pairs[key] > 1 {
			add("duplicate:"+key, "duplicate "+key)
		}
		if !srcOK || !tgtOK || !s.schema.RelationshipAllowed(edge.Type, source.Label, target.Label) {
			add("endpoint:"+key, "unauthorized GSN endpoints "+key)
			if !srcOK || !tgtOK {
				continue
			}
		}
		if source.SoI != target.SoI {
			add("scope:"+key, "relationship crosses SoI: "+key)
		}
		children[edge.Source] = append(children[edge.Source], edge.Target)
		if edge.Type == "SUPPORTED_BY" {
			indegree[edge.Target]++
			if target.Root {
				add("root:"+key, "Asset-associated root Goal "+edge.Target+" cannot have incoming support from "+edge.Source)
			}
		}
	}
	for hid, node := range graph.Nodes {
		if node.Undeveloped && node.Label != "GsnGoal" && node.Label != "GsnStrategy" {
			add("undeveloped-type:"+hid, "Undeveloped is restricted to Goals and Strategies")
		}
	}
	// Identify each cyclic edge, not an aggregate remainder. A new edge within
	// an already-invalid legacy component must still be rejected.
	component, sizes := gsnStrongComponents(graph.Nodes, children)
	for _, edge := range graph.Edges {
		source, target := edge.Source, edge.Target
		if _, ok := graph.Nodes[source]; !ok {
			continue
		}
		if _, ok := graph.Nodes[target]; !ok {
			continue
		}
		if component[source] == component[target] && (source == target || sizes[component[source]] > 1) {
			add("cycle:"+source+"|"+edge.Type+"|"+target, "argument cycle edge "+source+" → "+target)
		}
	}
	// Argument membership is the support/context reachability of one root. Shared
	// children/context are allowed; independent cases may reuse display numbers.
	for root, node := range graph.Nodes {
		if node.Label != "GsnGoal" || (!node.Root && indegree[root] != 0) {
			continue
		}
		seen := map[string]bool{root: true}
		work := []string{root}
		ids := map[string][]string{}
		for i := 0; i < len(work); i++ {
			hid := work[i]
			n := graph.Nodes[hid]
			ids[n.DisplayID] = append(ids[n.DisplayID], hid)
			for _, next := range children[hid] {
				if !seen[next] {
					seen[next] = true
					work = append(work, next)
				}
			}
		}
		for id, owners := range ids {
			sort.Strings(owners)
			for i := 0; i < len(owners); i++ {
				for j := i + 1; j < len(owners); j++ {
					key := "id:" + owners[i] + "|" + owners[j]
					// A shared subtree can be reachable from several roots; count one conflict.
					violations[key] = gsnViolation{Count: 1, Message: "duplicate display ID " + strconv.Quote(id) + " within a Goal Structure (" + owners[i] + ", " + owners[j] + ")"}
				}
			}
		}
	}
	return violations
}

var errGsnConflict = errors.New("GoalStructure revision conflict")

func checkGsnLayoutPrecondition(ctx context.Context, tx neo4j.ManagedTransaction, op commitOperation) error {
	if len(op.ExpectedGoalStructure) == 0 {
		return nil
	}
	if _, ok := op.Props["GoalStructure"]; !ok {
		return fmt.Errorf("expectedGoalStructure requires a GoalStructure update")
	}
	var expected any
	if err := json.Unmarshal(op.ExpectedGoalStructure, &expected); err != nil {
		return fmt.Errorf("invalid expectedGoalStructure")
	}
	if expected != nil {
		if _, ok := expected.(string); !ok {
			return fmt.Errorf("expectedGoalStructure must be a string or null")
		}
	}
	res, err := tx.Run(ctx, `MATCH (n:SSTPA:GsnGoal {HID:$hid})
 SET n._GsnLayoutLock = true REMOVE n._GsnLayoutLock RETURN n.GoalStructure AS layout`, map[string]any{"hid": op.HID})
	if err != nil {
		return err
	}
	row, err := res.Single(ctx)
	if err != nil {
		return fmt.Errorf("expectedGoalStructure requires an existing GsnGoal")
	}
	if row.AsMap()["layout"] != expected {
		return fmt.Errorf("%w: %s changed since this draft was loaded; reload before saving", errGsnConflict, op.HID)
	}
	return nil
}

// Iterative Kosaraju traversal labels true strongly connected components. It
// has no recursion or path-depth cutoff, and does not mistake an acyclic node
// downstream from a legacy cycle for a participant in that cycle.
func gsnStrongComponents(nodes map[string]gsnNode, support map[string][]string) (map[string]int, map[int]int) {
	type frame struct {
		hid  string
		next int
	}
	seen := map[string]bool{}
	order := []string{}
	reverse := map[string][]string{}
	for source, targets := range support {
		for _, target := range targets {
			reverse[target] = append(reverse[target], source)
		}
	}
	for root := range nodes {
		if seen[root] {
			continue
		}
		seen[root] = true
		stack := []frame{{hid: root}}
		for len(stack) > 0 {
			top := &stack[len(stack)-1]
			if top.next < len(support[top.hid]) {
				next := support[top.hid][top.next]
				top.next++
				if !seen[next] {
					seen[next] = true
					stack = append(stack, frame{hid: next})
				}
			} else {
				order = append(order, top.hid)
				stack = stack[:len(stack)-1]
			}
		}
	}
	component, sizes := map[string]int{}, map[int]int{}
	id := 0
	for i := len(order) - 1; i >= 0; i-- {
		root := order[i]
		if _, ok := component[root]; ok {
			continue
		}
		id++
		component[root] = id
		work := []string{root}
		for j := 0; j < len(work); j++ {
			sizes[id]++
			for _, next := range reverse[work[j]] {
				if _, ok := component[next]; !ok {
					component[next] = id
					work = append(work, next)
				}
			}
		}
	}
	return component, sizes
}

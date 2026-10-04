package api

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
	"testing"
)

func lossGrid(width, depth int) ([]atNode, []atEdge) {
	nodes := []atNode{{HID: "root", TypeName: "Loss"}}
	edges := []atEdge{}
	for rank := 1; rank <= depth; rank++ {
		for col := 0; col < width; col++ {
			id := fmt.Sprintf("n%d-%d", rank, col)
			nodes = append(nodes, atNode{HID: id, TypeName: "Attack"})
			parent := "root"
			if rank > 1 {
				parent = fmt.Sprintf("n%d-%d", rank-1, col)
			}
			edges = append(edges, atEdge{SourceHID: parent, TargetHID: id, LogicOperator: "OR"})
		}
	}
	return nodes, edges
}
func TestLossCapacityUsesCompleteDAGAndExactBoundary(t *testing.T) {
	nodes, edges := lossGrid(50, 20)
	nodes = nodes[:1000]
	edges = edges[:999]
	shape, err := shapeOfLoss("root", nodes, edges)
	if err != nil || shape.Nodes != 1000 || shape.Depth != 20 || shape.Width != 50 {
		t.Fatalf("boundary rejected: %+v %v", shape, err)
	}
	allNodes, allEdges := lossGrid(50, 20)
	if _, err := shapeOfLoss("root", allNodes, allEdges); err == nil || !strings.Contains(err.Error(), "nodes") {
		t.Fatalf("1001 nodes accepted: %v", err)
	}
	nodes, edges = lossGrid(51, 1)
	for i := range edges {
		edges[i].TailoredOut = true
	}
	if _, err := shapeOfLoss("root", nodes, edges); err == nil || !strings.Contains(err.Error(), "width") {
		t.Fatalf("tailoring bypassed width: %v", err)
	}
	nodes, edges = lossGrid(1, 21)
	edges = append(edges, atEdge{SourceHID: "root", TargetHID: nodes[len(nodes)-1].HID, LogicOperator: "OR"})
	if _, err := shapeOfLoss("root", nodes, edges); err == nil || !strings.Contains(err.Error(), "depth") {
		t.Fatalf("shared shortcut bypassed depth: %v", err)
	}
}
func TestLossCapacityWarningsAtEightyPercent(t *testing.T) {
	for _, test := range []struct {
		shape lossShape
		want  int
	}{{lossShape{Nodes: 799, Depth: 15, Width: 39}, 0}, {lossShape{Nodes: 800, Depth: 16, Width: 40}, 3}, {lossShape{Nodes: 1000, Depth: 20, Width: 50}, 3}} {
		findings := lossCapacityFindings(test.shape)
		if len(findings) != test.want {
			t.Errorf("%+v: got %d warnings", test.shape, len(findings))
		}
		for _, f := range findings {
			if f.Severity != "WARNING" || !strings.Contains(f.Message, lossDecompositionAdvice) {
				t.Errorf("bad warning: %+v", f)
			}
		}
	}
}
func TestLossShapeRejectsCyclesAndDisconnectedScopedEdges(t *testing.T) {
	nodes, edges := lossGrid(1, 3)
	edges = append(edges, atEdge{SourceHID: nodes[3].HID, TargetHID: nodes[1].HID})
	if _, err := shapeOfLoss("root", nodes, edges); err == nil {
		t.Fatal("cycle accepted")
	}
	nodes, edges = lossGrid(1, 3)
	edges = edges[1:]
	if _, err := shapeOfLoss("root", nodes, edges); err == nil {
		t.Fatal("disconnected branch accepted")
	}
}
func TestLossRootContextIsSeparateFromStateGate(t *testing.T) {
	nodes := []atNode{{HID: "root", TypeName: "Loss"}, {HID: "env", TypeName: "Environment"}, {HID: "state", TypeName: "State"}}
	edges := []atEdge{{SourceHID: "root", TargetHID: "env", LogicOperator: "AND"}, {SourceHID: "root", TargetHID: "state", LogicOperator: "OR"}}
	if err := validateLossGraph("root", nodes, edges); err != nil {
		t.Fatal(err)
	}
	edges[1].LogicOperator = "AND"
	if err := validateLossGraph("root", nodes, edges); err == nil {
		t.Fatal("AND State group accepted")
	}
}
func TestLossSANDRequiresContiguousZeroBasedSequence(t *testing.T) {
	nodes, edges := lossGrid(2, 1)
	a, b := int64(0), int64(1)
	edges[0].LogicOperator = "SAND"
	edges[0].SANDSequence = &a
	edges[1].LogicOperator = "SAND"
	edges[1].SANDSequence = &b
	if err := validateLossGraph("root", nodes, edges); err != nil {
		t.Fatal(err)
	}
	b = 2
	if err := validateLossGraph("root", nodes, edges); err == nil {
		t.Fatal("sequence gap accepted")
	}
}
func TestLossDocumentPreservesBothLegacyFormsAndServerFields(t *testing.T) {
	for _, schema := range []string{`"schemaVersion":"1.0"`, `"schema":"SSTPA-ATF-2.0"`} {
		original := `{` + schema + `,"extension":{"keep":true},"layout":{"legacy":42},"validationSnapshot":{"builtAt":"original"},"validationFindings":["keep"],"attackTreeVersion":7}`
		next, err := mergeLossDocument(original, `{"layout":{"positions":{}},"validationSnapshot":{},"validationFindings":[],"attackTreeVersion":999,"lossToolView":{"version":1,"nodeIds":{"LOS_1_1":"tree-root"}}}`)
		if err != nil {
			t.Fatal(err)
		}
		var doc map[string]any
		_ = json.Unmarshal([]byte(next), &doc)
		if doc["attackTreeVersion"] != float64(7) || doc["validationSnapshot"].(map[string]any)["builtAt"] != "original" || doc["layout"].(map[string]any)["legacy"] != float64(42) || doc["extension"] == nil {
			t.Fatalf("destructive merge: %s", next)
		}
	}
}
func TestLossDocumentRejectsUnknownWriterVersionsAndDuplicateIdentities(t *testing.T) {
	for _, existing := range []string{`{"schemaVersion":"2.5"}`, `{"schema":"SSTPA-ATF-3.0"}`, `{"lossToolView":{"version":2}}`} {
		if _, err := mergeLossDocument(existing, `{"lossToolView":{"version":1}}`); err == nil {
			t.Fatalf("downgrade accepted %s", existing)
		}
	}
	for _, view := range []string{`{"version":1,"nodeIds":{"one":"same","two":"same"}}`, `{"version":1,"nodeIds":{"one":"constructor"}}`, `{"version":1,"viewport":{"x":0,"y":0,"zoom":0}}`, `{"version":1,"nodeStyles":{"Attack":{"font":"url(javascript:bad)","box":"#ffffff","line":"#ffffff","border":"#ffffff"}}}`} {
		if _, err := mergeLossDocument("", `{"lossToolView":`+view+`}`); err == nil {
			t.Fatalf("invalid view accepted %s", view)
		}
	}
}
func TestLossNewNodeIDsResolveWithinTransaction(t *testing.T) {
	out, err := resolveLossNodeIDs(`{"lossToolView":{"version":1,"nodeIds":{"$new":"stable-local-id"},"positions":{"stable-local-id":{"x":0,"y":1}}}}`, map[string]string{"new": "ATK_1_3"})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out, `"ATK_1_3":"stable-local-id"`) || strings.Contains(out, "$new") {
		t.Fatalf("ID not resolved: %s", out)
	}
	if _, err := resolveLossNodeIDs(`{"lossToolView":{"version":1,"nodeIds":{"$missing":"id"}}}`, nil); err == nil {
		t.Fatal("unresolved temp ID accepted")
	}
}
func TestLossATF2SnapshotRetainsReconciliationData(t *testing.T) {
	snap := parseTreeSnapshot(`{"schema":"SSTPA-ATF-2.0","validationSnapshot":{"snapshotAt":"2026-10-04","environmentHID":"ENV_1_1","states":[{"stateHID":"ST_1_1","stateName":"Orbit","traceEntities":[{"entityHID":"INT_1_1","entityType":"Interface","entityName":"Radio"}]}],"attacks":[{"attackHID":"ATK_1_1","attackName":"Jam"}],"countermeasures":[{"countermeasureHID":"CM_1_1","countermeasureName":"Guard"}]}}`)
	if snap == nil || snap.Environment != "ENV_1_1" || len(snap.Nodes) != 4 || len(snap.Traces) != 1 || snap.Traces[0].EntityHID != "INT_1_1" {
		t.Fatalf("lost ATF2 snapshot: %+v", snap)
	}
}
func TestLossPathClassificationIsRouteScopedAndCompleteBlockStopsTraversal(t *testing.T) {
	nodes := []atNode{{HID: "root", TypeName: "Loss"}, {HID: "a", TypeName: "Attack"}, {HID: "b", TypeName: "Attack"}, {HID: "shared", TypeName: "Attack"}, {HID: "cm", TypeName: "Countermeasure"}, {HID: "deeper", TypeName: "Attack"}}
	edges := []atEdge{{SourceHID: "root", TargetHID: "a"}, {SourceHID: "root", TargetHID: "b"}, {SourceHID: "a", TargetHID: "shared", Props: map[string]any{"AllowedRV": true}}, {SourceHID: "b", TargetHID: "shared"}, {SourceHID: "root", TargetHID: "cm", Props: map[string]any{"CompleteBlock": true}}, {SourceHID: "cm", TargetHID: "deeper"}}
	tree := map[string]any{"loss": map[string]any{"HID": "root"}, "nodes": nodes, "edges": edges}
	total, rv := countLossPaths(tree, "root")
	if total.String() != "3" || rv.String() != "1" {
		t.Fatalf("counts total=%s rv=%s", total, rv)
	}
	counts := map[string]int{}
	for _, p := range enumeratePaths(tree, "root", nil) {
		counts[p.RVStatus]++
	}
	if counts["RV"] != 1 || counts["ALLOWED_RV"] != 1 || counts["BLOCKED"] != 1 {
		t.Fatalf("route classifications: %v", counts)
	}
}
func TestLossPathMetricsIgnoreBranchInputs(t *testing.T) {
	nodes := map[string]atNode{"root": {TypeName: "Loss"}, "cm": {TypeName: "Countermeasure", Props: map[string]any{"MetricsJSON": `{"Cost":100}`}}, "leaf": {TypeName: "Attack", Props: map[string]any{"MetricsJSON": `{"Cost":7}`}}}
	defs := []metricDef{{MetricName: "Cost", LeafDefault: 3, ANDFormula: "SUM"}}
	if got := computePathMetrics([]string{"root", "cm", "leaf"}, nodes, defs)["Cost"]; got != 7 {
		t.Fatalf("branch value contaminated leaf: %v", got)
	}
	if got := computePathMetrics([]string{"root", "cm"}, nodes, defs)["Cost"]; got != 100 {
		t.Fatalf("terminal counted twice: %v", got)
	}
}
func TestLossPathMaterializationBoundAndExactLargeDAGCount(t *testing.T) {
	nodes, edges := lossGrid(8, 7)
	edges = nil
	for depth := 1; depth <= 7; depth++ {
		for col := 0; col < 8; col++ {
			target := fmt.Sprintf("n%d-%d", depth, col)
			if depth == 1 {
				edges = append(edges, atEdge{SourceHID: "root", TargetHID: target})
			} else {
				for prev := 0; prev < 8; prev++ {
					edges = append(edges, atEdge{SourceHID: fmt.Sprintf("n%d-%d", depth-1, prev), TargetHID: target})
				}
			}
		}
	}
	tree := map[string]any{"loss": map[string]any{"HID": "root"}, "nodes": nodes, "edges": edges}
	total, rv := countLossPaths(tree, "root")
	want := new(big.Int).Exp(big.NewInt(8), big.NewInt(7), nil)
	if total.Cmp(want) != 0 || rv.Cmp(want) != 0 {
		t.Fatalf("count %s/%s want %s", total, rv, want)
	}
	if got := len(enumeratePaths(tree, "root", nil)); got != lossPathLimit {
		t.Fatalf("materialized %d, want bound %d", got, lossPathLimit)
	}
}
func TestLossMetricJSONAndSchemaValidation(t *testing.T) {
	s := newValidationServer(t)
	valid := `[{"id":"AttackCost","label":"Cost","unit":"USD","and":"SUM","or":"MIN","sand":"SUM","defaultValue":null}]`
	if _, err := s.castProperty("Loss", "MetricDefinitionsJSON", valid); err != nil {
		t.Fatal(err)
	}
	legacy := `[{"MetricName":"AttackCost","ANDFormula":"SUM","ORFormula":"MIN","SANDFormula":"SUM","LeafDefault":0}]`
	if _, err := s.castProperty("Loss", "MetricDefinitionsJSON", legacy); err != nil {
		t.Fatal(err)
	}
	for _, bad := range []string{`[{"id":"ALE","label":"Loss","unit":"USD","and":"SUM","or":"MAX","sand":"SUM"}]`, `[{"MetricName":"bad","ANDFormula":"EVAL","ORFormula":"MIN","SANDFormula":"SUM"}]`, `{"x":1}`, `invalid`} {
		if _, err := s.castProperty("Loss", "MetricDefinitionsJSON", bad); err == nil {
			t.Fatalf("invalid definitions accepted %s", bad)
		}
	}
	for _, typ := range []string{"Attack", "Countermeasure", "Asset", "DerivedAsset"} {
		if _, err := s.castProperty(typ, "MetricsJSON", `{"AttackCost":null,"BooleanCapability":true}`); err != nil {
			t.Errorf("%s leaf metrics rejected: %v", typ, err)
		}
	}
	if _, err := s.castProperty("Attack", "MetricsJSON", `{"RandomEventProbability":2}`); err == nil {
		t.Fatal("invalid probability accepted")
	}
	if _, err := s.castProperty("Attack", "AttackEventKind", "stochastic"); err != nil {
		t.Fatal(err)
	}
}

func TestLossExactPathCountExceedsCompatibilityInteger(t *testing.T) {
	nodes, edges := lossGrid(10, 20)
	edges = nil
	for depth := 1; depth <= 20; depth++ {
		for col := 0; col < 10; col++ {
			target := fmt.Sprintf("n%d-%d", depth, col)
			if depth == 1 {
				edges = append(edges, atEdge{SourceHID: "root", TargetHID: target})
			} else {
				for prev := 0; prev < 10; prev++ {
					edges = append(edges, atEdge{SourceHID: fmt.Sprintf("n%d-%d", depth-1, prev), TargetHID: target})
				}
			}
		}
	}
	tree := map[string]any{"loss": map[string]any{"HID": "root"}, "nodes": nodes, "edges": edges}
	exact, _ := countLossPaths(tree, "root")
	if exact.String() != "100000000000000000000" {
		t.Fatalf("exact count: %s", exact)
	}
	if got := computeTreeStats(tree, nil).pathCount; int64(got) != int64(^uint64(0)>>1) {
		t.Fatalf("compatibility count overflowed: %d", got)
	}
}
func TestLossPathMetricsKeepUnknownDefaultsAndBooleanInputs(t *testing.T) {
	var defs []metricDef
	if err := json.Unmarshal([]byte(`[{"id":"Unknown","defaultValue":null},{"MetricName":"Known","LeafDefault":3},{"id":"Capability","defaultValue":0}]`), &defs); err != nil {
		t.Fatal(err)
	}
	values := computePathMetrics([]string{"leaf"}, map[string]atNode{"leaf": {TypeName: "Attack", Props: map[string]any{"MetricsJSON": `{"Capability":true}`}}}, defs)
	if _, exists := values["Unknown"]; exists {
		t.Fatal("unknown default was misrepresented as zero")
	}
	if values["Known"] != 3 || values["Capability"] != 1 {
		t.Fatalf("input mapping: %v", values)
	}
}

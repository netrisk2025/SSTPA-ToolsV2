package api

import (
	"fmt"
	"strings"
	"testing"
)

func gsnTestGraph() gsnGraph {
	return gsnGraph{Nodes: map[string]gsnNode{
		"root":     {HID: "root", Label: "GsnGoal", SoI: "1", DisplayID: "G1", Root: true},
		"strategy": {HID: "strategy", Label: "GsnStrategy", SoI: "1", DisplayID: "S1"},
		"goal":     {HID: "goal", Label: "GsnGoal", SoI: "1", DisplayID: "G2"},
		"solution": {HID: "solution", Label: "GsnSolution", SoI: "1", DisplayID: "Sn1"},
		"context":  {HID: "context", Label: "GsnContext", SoI: "1", DisplayID: "C1"},
	}, Edges: []gsnEdge{{"root", "strategy", "SUPPORTED_BY"}, {"strategy", "goal", "SUPPORTED_BY"}, {"goal", "solution", "SUPPORTED_BY"}, {"root", "context", "IN_CONTEXT_OF"}}}
}
func TestGsnV3CoreMatrixAllSeventyTwoPairs(t *testing.T) {
	s := newValidationServer(t)
	for _, source := range gsnLabels {
		for _, target := range gsnLabels {
			for _, typ := range []string{"SUPPORTED_BY", "IN_CONTEXT_OF"} {
				want := false
				if typ == "SUPPORTED_BY" {
					want = (source == "GsnGoal" && (target == "GsnGoal" || target == "GsnStrategy" || target == "GsnSolution")) || (source == "GsnStrategy" && target == "GsnGoal")
				} else {
					want = (source == "GsnGoal" || source == "GsnStrategy") && (target == "GsnContext" || target == "GsnAssumption" || target == "GsnJustification")
				}
				if got := s.schema.RelationshipAllowed(typ, source, target); got != want {
					t.Errorf("%s %s %s allowed=%t want=%t", source, typ, target, got, want)
				}
			}
		}
	}
}
func TestGsnFinalCandidateRejectsStructuralViolations(t *testing.T) {
	s := newValidationServer(t)
	if got := s.gsnViolations(gsnTestGraph()); len(got) != 0 {
		t.Fatalf("valid graph: %v", got)
	}
	cases := map[string]func(*gsnGraph){
		"endpoint":   func(g *gsnGraph) { g.Edges = append(g.Edges, gsnEdge{"strategy", "solution", "SUPPORTED_BY"}) },
		"duplicate":  func(g *gsnGraph) { g.Edges = append(g.Edges, g.Edges[0]) },
		"self cycle": func(g *gsnGraph) { g.Edges = append(g.Edges, gsnEdge{"goal", "goal", "SUPPORTED_BY"}) },
		"root":       func(g *gsnGraph) { g.Edges = append(g.Edges, gsnEdge{"goal", "root", "SUPPORTED_BY"}) },
		"display ID": func(g *gsnGraph) { n := g.Nodes["goal"]; n.DisplayID = "G1"; g.Nodes["goal"] = n },
		"scope":      func(g *gsnGraph) { n := g.Nodes["goal"]; n.SoI = "2"; g.Nodes["goal"] = n },
	}
	for name, mutate := range cases {
		t.Run(name, func(t *testing.T) {
			g := gsnTestGraph()
			mutate(&g)
			if err := rejectNewGsnViolations(nil, s.gsnViolations(g)); err == nil {
				t.Fatal("invalid final candidate accepted")
			}
		})
	}
}
func TestGsnDeepCycleHasNoFiftyHopEscape(t *testing.T) {
	s := newValidationServer(t)
	g := gsnGraph{Nodes: map[string]gsnNode{}}
	for i := 0; i < 130; i++ {
		hid := fmt.Sprint(i)
		g.Nodes[hid] = gsnNode{HID: hid, Label: "GsnGoal", DisplayID: "G" + hid, SoI: "1"}
		if i > 0 {
			g.Edges = append(g.Edges, gsnEdge{fmt.Sprint(i - 1), hid, "SUPPORTED_BY"})
		}
	}
	if got := s.gsnViolations(g); len(got) != 0 {
		t.Fatal(got)
	}
	g.Edges = append(g.Edges, gsnEdge{"129", "0", "SUPPORTED_BY"})
	if got := s.gsnViolations(g); len(got) != 130 {
		t.Fatalf("cycle remainder=%d want130", len(got))
	}
}
func TestGsnLegacyViolationsPermitRepairButNotRegression(t *testing.T) {
	s := newValidationServer(t)
	g := gsnTestGraph()
	bad := gsnEdge{"strategy", "solution", "SUPPORTED_BY"}
	g.Edges = append(g.Edges, bad)
	before := s.gsnViolations(g)
	if err := rejectNewGsnViolations(before, s.gsnViolations(g)); err != nil {
		t.Fatal("unchanged legacy rejected", err)
	}
	if err := rejectNewGsnViolations(before, s.gsnViolations(gsnTestGraph())); err != nil {
		t.Fatal("repair rejected", err)
	}
	g.Edges = append(g.Edges, bad)
	if err := rejectNewGsnViolations(before, s.gsnViolations(g)); err == nil {
		t.Fatal("worsened legacy accepted")
	}
}
func TestGsnSharedSubtreesAndIndependentCaseNumbers(t *testing.T) {
	s := newValidationServer(t)
	g := gsnTestGraph()
	g.Nodes["other"] = gsnNode{HID: "other", Label: "GsnGoal", DisplayID: "G1", Root: true, SoI: "1"}
	g.Edges = append(g.Edges, gsnEdge{"other", "goal", "SUPPORTED_BY"}, gsnEdge{"other", "context", "IN_CONTEXT_OF"})
	if got := s.gsnViolations(g); len(got) != 0 {
		t.Fatal("shared DAG/independent numbering rejected", got)
	}
}
func TestGsnDisplayIdentityAndUndevelopedSchema(t *testing.T) {
	s := newValidationServer(t)
	for _, label := range gsnLabels {
		_, ok := s.schema.PropertyDef(label, "Undeveloped")
		if ok != (label == "GsnGoal" || label == "GsnStrategy") {
			t.Fatalf("wrong decorator scope %s", label)
		}
	}
	for _, bad := range []any{1.2, float64(-1), "G1", float64(1e30)} {
		if _, err := s.castProperty("GsnGoal", "GoalID", bad); err == nil {
			t.Fatalf("invalid ID accepted %v", bad)
		}
	}
	for _, id := range []any{float64(1), int64(4), nil} {
		if _, err := s.castProperty("GsnGoal", "GoalID", id); err != nil {
			t.Fatal(err)
		}
	}
	if got := gsnDisplayID("GsnGoal", "G_1_1", map[string]any{"GoalID": "G1"}); got != "G1" {
		t.Fatal(got)
	}
	if got := gsnDisplayID("GsnGoal", "G_1_1", nil); got != "G_1_1" {
		t.Fatal(got)
	}
	if !gsnLayoutOnly(map[string]any{"GoalStructure": "{}"}) || gsnLayoutOnly(map[string]any{"GoalID": 1}) {
		t.Fatal("semantic update bypass")
	}
	if err := rejectNewGsnViolations(nil, map[string]gsnViolation{"root": {Count: 1, Message: "root error"}}); err == nil || !strings.Contains(err.Error(), "root error") {
		t.Fatal(err)
	}
}

func TestGsnLegacyCannotGainInvalidEdgesOrNewCycleWithinRemainder(t *testing.T) {
	s := newValidationServer(t)
	node := func(hid string) gsnNode { return gsnNode{HID: hid, Label: "GsnGoal", DisplayID: hid, SoI: "1"} }
	for _, kind := range []string{"root", "cycle", "mixed", "illegal"} {
		t.Run(kind, func(t *testing.T) {
			g := gsnGraph{Nodes: map[string]gsnNode{"a": node("a"), "b": node("b"), "c": node("c")}}
			var addition gsnEdge
			switch kind {
			case "root":
				n := g.Nodes["a"]
				n.Root = true
				g.Nodes["a"] = n
				g.Edges = []gsnEdge{{"b", "a", "SUPPORTED_BY"}}
				addition = gsnEdge{"c", "a", "SUPPORTED_BY"}
			case "mixed":
				n := g.Nodes["c"]
				n.Label = "GsnContext"
				g.Nodes["c"] = n
				g.Edges = []gsnEdge{{"c", "a", "SUPPORTED_BY"}}
				addition = gsnEdge{"a", "c", "IN_CONTEXT_OF"}
			case "illegal":
				n := g.Nodes["c"]
				n.Label = "GsnSolution"
				g.Nodes["c"] = n
				g.Edges = []gsnEdge{{"c", "a", "SUPPORTED_BY"}}
				addition = gsnEdge{"a", "c", "SUPPORTED_BY"}
			case "cycle":
				g.Edges = []gsnEdge{{"a", "b", "SUPPORTED_BY"}, {"b", "a", "SUPPORTED_BY"}, {"a", "c", "SUPPORTED_BY"}}
				addition = gsnEdge{"c", "b", "SUPPORTED_BY"}
			}
			before := s.gsnViolations(g)
			if kind == "cycle" {
				for key := range before {
					if strings.Contains(key, "c") && strings.HasPrefix(key, "cycle:") && key != "cycle:a|SUPPORTED_BY|b" && key != "cycle:b|SUPPORTED_BY|a" {
						t.Fatalf("acyclic descendant mislabeled: %s", key)
					}
				}
			}
			g.Edges = append(g.Edges, addition)
			if err := rejectNewGsnViolations(before, s.gsnViolations(g)); err == nil {
				t.Fatal("new violation masked by legacy aggregate")
			}
		})
	}
}

func TestGsnPartiallyDevelopedGoalMayRetainUndevelopedMarker(t *testing.T) {
	s := newValidationServer(t)
	g := gsnTestGraph()
	n := g.Nodes["strategy"]
	n.Undeveloped = true
	g.Nodes["strategy"] = n
	if got := s.gsnViolations(g); len(got) != 0 {
		t.Fatalf("extra unsupported child-count restriction: %v", got)
	}
}

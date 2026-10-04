//go:build integration

package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"testing"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type gsnITFixture struct {
	h                                                   *itHarness
	soi, root, strategy, goal, solution, context, asset string
}

func newGsnITFixture(t *testing.T) gsnITFixture {
	h := newHarness(t)
	h.bootstrapOnce()
	code, res := h.commit("it-root", "", []map[string]any{{"op": "createNode", "label": "System", "tempId": "sys", "properties": map[string]any{"Name": "GSN v3 integration verification"}}})
	if code != 200 {
		t.Fatalf("System: %d %v", code, res)
	}
	f := gsnITFixture{h: h, soi: res["createdNodes"].(map[string]any)["sys"].(string)}
	ops := []map[string]any{}
	for _, n := range []struct {
		temp, label, prop string
		id                int
	}{{"root", "GsnGoal", "GoalID", 1}, {"strategy", "GsnStrategy", "StrategyID", 1}, {"goal", "GsnGoal", "GoalID", 2}, {"solution", "GsnSolution", "SolutionID", 1}, {"context", "GsnContext", "ContextID", 1}} {
		ops = append(ops, map[string]any{"op": "createNode", "label": n.label, "tempId": n.temp, "properties": map[string]any{"Name": n.temp, n.prop: n.id}})
	}
	ops = append(ops, map[string]any{"op": "createNode", "label": "Asset", "tempId": "asset", "properties": map[string]any{"Name": "GSN source Asset"}}, gsnITLink("HAS_GOAL", "$asset", "$root"), gsnITLink("SUPPORTED_BY", "$root", "$strategy"), gsnITLink("SUPPORTED_BY", "$strategy", "$goal"), gsnITLink("SUPPORTED_BY", "$goal", "$solution"), gsnITLink("IN_CONTEXT_OF", "$root", "$context"))
	code, res = f.commit(ops...)
	if code != 200 {
		t.Fatalf("GSN fixture: %d %v", code, res)
	}
	made := res["createdNodes"].(map[string]any)
	f.root = made["root"].(string)
	f.strategy = made["strategy"].(string)
	f.goal = made["goal"].(string)
	f.solution = made["solution"].(string)
	f.context = made["context"].(string)
	f.asset = made["asset"].(string)
	return f
}
func gsnITLink(typ, source, target string) map[string]any {
	return map[string]any{"op": "createRelationship", "type": typ, "sourceHid": source, "targetHid": target}
}
func (f gsnITFixture) commit(ops ...map[string]any) (int, map[string]any) {
	return f.h.call("POST", "/api/commit", "it-root", map[string]any{"soiHid": f.soi, "toolId": "sstpa.goalkeeper", "operations": ops})
}
func gsnITUpdate(hid string, props map[string]any) map[string]any {
	return map[string]any{"op": "updateNode", "hid": hid, "properties": props}
}
func (f gsnITFixture) properties(hid string) map[string]any {
	code, res := f.h.call("GET", "/api/nodes/hid/"+hid, "it-root", nil)
	if code != 200 {
		f.h.t.Fatalf("node read %d %v", code, res)
	}
	return res["properties"].(map[string]any)
}
func TestIntegrationGsnCoreAndAtomicRollback(t *testing.T) {
	f := newGsnITFixture(t)
	for name, op := range map[string]map[string]any{
		"strategy to solution": gsnITLink("SUPPORTED_BY", f.strategy, f.solution),
		"context support":      gsnITLink("SUPPORTED_BY", f.context, f.goal),
		"duplicate":            gsnITLink("SUPPORTED_BY", f.root, f.strategy),
		"self cycle":           gsnITLink("SUPPORTED_BY", f.goal, f.goal),
		"root cycle":           gsnITLink("SUPPORTED_BY", f.goal, f.root),
		"duplicate display ID": gsnITUpdate(f.goal, map[string]any{"GoalID": 1}),
		"immutable identity":   gsnITUpdate(f.goal, map[string]any{"uuid": "forged"}),
	} {
		t.Run(name, func(t *testing.T) {
			code, res := f.commit(gsnITUpdate(f.root, map[string]any{"Name": "must roll back"}), op)
			if code != 422 {
				t.Fatalf("accepted invalid change %d %v", code, res)
			}
			if f.properties(f.root)["Name"] != "root" {
				t.Fatal("partial update survived rollback")
			}
		})
	}
	code, res := f.commit(gsnITUpdate(f.strategy, map[string]any{"Undeveloped": true}))
	if code != 200 {
		t.Fatalf("partial support marker rejected %d %v", code, res)
	}
	other := newGsnITFixture(t)
	code, res = f.commit(gsnITLink("SUPPORTED_BY", f.goal, other.goal))
	if code != 422 || !strings.Contains(fmt.Sprint(res), "SoI") {
		t.Fatalf("cross-SoI accepted %d %v", code, res)
	}
	// Incoming support to an anchored root is invalid even without a cycle.
	code, res = f.commit(map[string]any{"op": "createNode", "label": "GsnGoal", "tempId": "new", "properties": map[string]any{"Name": "Temporary superior"}}, gsnITLink("SUPPORTED_BY", "$new", f.root))
	if code != 422 || !strings.Contains(fmt.Sprint(res), "root") {
		t.Fatalf("anchored root demoted %d %v", code, res)
	}
	// Replacing topology is judged on the final candidate, not operation order.
	duplicate := gsnITLink("IN_CONTEXT_OF", f.root, f.context)
	remove := map[string]any{"op": "deleteRelationship", "type": "IN_CONTEXT_OF", "sourceHid": f.root, "targetHid": f.context}
	code, res = f.commit(duplicate, remove, duplicate)
	if code != 200 {
		t.Fatalf("atomic replacement rejected %d %v", code, res)
	}
	code, _ = f.h.call("POST", "/api/commit", "", map[string]any{"soiHid": f.soi, "operations": []any{gsnITUpdate(f.goal, map[string]any{"Name": "unauthenticated"})}})
	if code != http.StatusUnauthorized {
		t.Fatalf("auth bypass %d", code)
	}
}
func TestIntegrationGsnLayoutOptimisticGuard(t *testing.T) {
	f := newGsnITFixture(t)
	save := gsnITUpdate(f.root, map[string]any{"GoalStructure": `{"version":1,"positions":{}}`})
	save["expectedGoalStructure"] = nil
	code, res := f.commit(save)
	if code != 200 {
		t.Fatalf("first layout %d %v", code, res)
	}
	save["properties"] = map[string]any{"GoalStructure": `{"version":1,"positions":{"changed":true}}`}
	code, res = f.commit(gsnITUpdate(f.goal, map[string]any{"Name": "must roll back"}), save)
	if code != 409 || !strings.Contains(fmt.Sprint(res), "revision conflict") {
		t.Fatalf("lost layout update not rejected %d %v", code, res)
	}
	if f.properties(f.goal)["Name"] != "goal" {
		t.Fatal("layout conflict partially committed")
	}
	save["expectedGoalStructure"] = `{"version":1,"positions":{}}`
	code, res = f.commit(save)
	if code != 200 {
		t.Fatalf("fresh layout guard %d %v", code, res)
	}
	save["expectedGoalStructure"] = 42
	code, _ = f.commit(save)
	if code != 422 {
		t.Fatalf("invalid precondition %d", code)
	}
}
func TestIntegrationGsnConcurrentDuplicateWriters(t *testing.T) {
	f := newGsnITFixture(t)
	codes := make(chan int, 2)
	var wg sync.WaitGroup
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			code, _ := f.commit(gsnITLink("IN_CONTEXT_OF", f.goal, f.context))
			codes <- code
		}()
	}
	wg.Wait()
	close(codes)
	counts := map[int]int{}
	for code := range codes {
		counts[code]++
	}
	if counts[200] != 1 || counts[422] != 1 {
		t.Fatalf("concurrent invalid final graph accepted: %v", counts)
	}
}
func TestIntegrationGsnDeepCycleAndPreview(t *testing.T) {
	f := newGsnITFixture(t)
	ops := []map[string]any{}
	prev := f.goal
	for i := 0; i < 60; i++ {
		id := fmt.Sprintf("chain%d", i)
		ops = append(ops, map[string]any{"op": "createNode", "label": "GsnGoal", "tempId": id, "properties": map[string]any{"Name": id}}, gsnITLink("SUPPORTED_BY", prev, "$"+id))
		prev = "$" + id
	}
	code, res := f.commit(ops...)
	if code != 200 {
		t.Fatalf("deep legal DAG %d %v", code, res)
	}
	last := res["createdNodes"].(map[string]any)["chain59"].(string)
	code, res = f.h.call("POST", "/api/relationships/validate", "it-root", map[string]any{"type": "SUPPORTED_BY", "sourceHid": last, "targetHid": f.goal})
	if code != 200 || res["valid"] != false {
		t.Fatalf("deep cyclic preview %d %v", code, res)
	}
	code, res = f.commit(gsnITLink("SUPPORTED_BY", last, f.goal))
	if code != 422 || !strings.Contains(fmt.Sprint(res), "cycle") {
		t.Fatalf("deep cycle accepted %d %v", code, res)
	}
}
func TestIntegrationGsnLegacyInvalidDataStaysReadableAndRepairable(t *testing.T) {
	f := newGsnITFixture(t)
	// Seed one legacy edge only in this harness's explicit disposable database.
	driver, err := neo4j.NewDriverWithContext(os.Getenv("SSTPA_TEST_BOLT"), neo4j.BasicAuth("neo4j", os.Getenv("SSTPA_TEST_NEO4J_PASSWORD"), ""))
	if err != nil {
		t.Fatal(err)
	}
	defer driver.Close(context.Background())
	session := driver.NewSession(context.Background(), neo4j.SessionConfig{})
	defer session.Close(context.Background())
	_, err = session.ExecuteWrite(context.Background(), func(tx neo4j.ManagedTransaction) (any, error) {
		res, err := tx.Run(context.Background(), `MATCH (a {HID:$source}),(b {HID:$target}) CREATE (a)-[:SUPPORTED_BY]->(b)`, map[string]any{"source": f.strategy, "target": f.solution})
		if err != nil {
			return nil, err
		}
		return res.Consume(context.Background())
	})
	if err != nil {
		t.Fatal(err)
	}
	if f.properties(f.root)["Name"] != "root" {
		t.Fatal("legacy read failed")
	}
	code, res := f.commit(gsnITUpdate(f.root, map[string]any{"GoalStructure": `{"legacyReview":true}`}), gsnITUpdate(f.goal, map[string]any{"GoalStatement": "Review in progress"}))
	if code != 200 {
		t.Fatalf("legacy read/presentation/statement update blocked %d %v", code, res)
	}
	code, res = f.commit(map[string]any{"op": "deleteRelationship", "type": "SUPPORTED_BY", "sourceHid": f.strategy, "targetHid": f.solution})
	if code != 200 {
		t.Fatalf("legacy repair blocked %d %v", code, res)
	}
	code, res = f.commit(gsnITLink("SUPPORTED_BY", f.strategy, f.solution))
	if code != 422 {
		t.Fatalf("legacy illegality recreated %d %v", code, res)
	}
	// A legacy detour through another SoI must not hide a new local cycle.
	other := newGsnITFixture(t)
	code, res = f.commit(map[string]any{"op": "createNode", "label": "GsnGoal", "tempId": "local", "properties": map[string]any{"Name": "Local return point"}})
	if code != 200 {
		t.Fatalf("local draft %d %v", code, res)
	}
	local := res["createdNodes"].(map[string]any)["local"].(string)
	_, err = session.ExecuteWrite(context.Background(), func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(context.Background(), `MATCH (a {HID:$a}), (b {HID:$b}), (c {HID:$c}) CREATE (a)-[:SUPPORTED_BY]->(b), (b)-[:SUPPORTED_BY]->(c)`, map[string]any{"a": f.goal, "b": other.goal, "c": local})
		if err != nil {
			return nil, err
		}
		return result.Consume(context.Background())
	})
	if err != nil {
		t.Fatal(err)
	}
	code, res = f.h.call("POST", "/api/relationships/validate", "it-root", map[string]any{"type": "SUPPORTED_BY", "sourceHid": local, "targetHid": f.goal})
	if code != 200 || res["valid"] != false || !strings.Contains(fmt.Sprint(res), "cycle") {
		t.Fatalf("preview missed legacy cross-scope cycle %d %v", code, res)
	}
	code, res = f.commit(gsnITLink("SUPPORTED_BY", local, f.goal))
	if code != 422 || !strings.Contains(fmt.Sprint(res), "cycle") {
		t.Fatalf("legacy cross-scope detour hid cycle %d %v", code, res)
	}
	_, err = session.ExecuteWrite(context.Background(), func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(context.Background(), `MATCH (n {HID:$hid}) REMOVE n.SoIIndex`, map[string]any{"hid": f.goal})
		if err != nil {
			return nil, err
		}
		return result.Consume(context.Background())
	})
	if err != nil {
		t.Fatal(err)
	}
	code, res = f.commit(gsnITUpdate(f.goal, map[string]any{"GoalStatement": "No scope bypass"}))
	if code != 422 || !strings.Contains(fmt.Sprint(res), "SoI scope") {
		t.Fatalf("malformed legacy scope bypass %d %v", code, res)
	}
}

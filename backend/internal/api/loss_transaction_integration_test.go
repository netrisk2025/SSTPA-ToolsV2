//go:build integration

package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
)

type lossITFixture struct {
	h                                            *itHarness
	soi, loss, state, env, entity, attack, asset string
}

func newLossITFixture(t *testing.T) lossITFixture {
	h := newHarness(t)
	h.bootstrapOnce()
	code, res := h.commit("it-root", "", []map[string]any{{"op": "createNode", "tempId": "sys", "label": "System", "properties": map[string]any{"Name": "Loss transaction verification"}}})
	if code != 200 {
		t.Fatalf("system: %d %v", code, res)
	}
	f := lossITFixture{h: h, soi: res["createdNodes"].(map[string]any)["sys"].(string)}
	_, soi := h.call("GET", "/api/soi/"+f.soi, "it-root", nil)
	for _, x := range soi["nodes"].([]any) {
		n := x.(map[string]any)
		if n["typeName"] == "State" {
			f.state = n["hid"].(string)
		}
		if n["typeName"] == "Environment" {
			f.env = n["hid"].(string)
		}
	}
	code, res = h.commit("it-root", f.soi, []map[string]any{
		{"op": "createNode", "tempId": "loss", "label": "Loss", "properties": map[string]any{"Name": "Loss verification"}},
		{"op": "createNode", "tempId": "asset", "label": "Asset", "properties": map[string]any{"Name": "Verified data"}},
		{"op": "createNode", "tempId": "entity", "label": "Interface", "properties": map[string]any{"Name": "Radio"}},
		{"op": "createNode", "tempId": "attack", "label": "Attack", "properties": map[string]any{"Name": "Spoofing", "MetricsJSON": `{"AttackCost":7}`}},
	})
	if code != 200 {
		t.Fatalf("fixture nodes: %d %v", code, res)
	}
	created := res["createdNodes"].(map[string]any)
	f.loss = created["loss"].(string)
	f.asset = created["asset"].(string)
	f.entity = created["entity"].(string)
	f.attack = created["attack"].(string)
	relationship := func(typ, source, target string, props map[string]any) map[string]any {
		return map[string]any{"op": "createRelationship", "type": typ, "sourceHid": source, "targetHid": target, "properties": props}
	}
	code, res = h.commit("it-root", f.soi, []map[string]any{
		relationship("HAS_LOSS", f.asset, f.loss, nil), relationship("HAS_ENVIRONMENT", f.loss, f.env, nil), relationship("VALID_IN", f.state, f.env, nil),
		relationship("TRANSPORTS", f.entity, f.asset, map[string]any{"TraceStateHID": f.state}), relationship("EXPLOITS", f.attack, f.entity, nil),
	})
	if code != 200 {
		t.Fatalf("fixture semantic links: %d %v", code, res)
	}
	code, res = h.call("POST", fmt.Sprintf("/api/loss/%s/auto-build?expectedVersion=%d", f.loss, f.version()), "it-root", nil)
	if code != 200 {
		t.Fatalf("fixture auto-build: %d %v", code, res)
	}
	return f
}
func (f lossITFixture) tree() map[string]any {
	code, res := f.h.call("GET", "/api/loss/"+f.loss+"/tree", "it-root", nil)
	if code != 200 {
		f.h.t.Fatalf("read tree: %d %v", code, res)
	}
	return res
}
func (f lossITFixture) version() int64 {
	return int64(f.tree()["loss"].(map[string]any)["AttackTreeVersion"].(float64))
}
func (f lossITFixture) commit(version int64, ops ...map[string]any) (int, map[string]any) {
	return f.h.call("POST", "/api/commit", "it-root", map[string]any{"toolId": "sstpa.loss", "soiHid": f.soi, "lossPreconditions": []map[string]any{{"lossHid": f.loss, "attackTreeVersion": version}}, "operations": ops})
}
func (f lossITFixture) update(props map[string]any) map[string]any {
	return map[string]any{"op": "updateNode", "hid": f.loss, "properties": props}
}

func TestIntegrationLossCommitIdentitySnapshotsAndConflict(t *testing.T) {
	f := newLossITFixture(t)
	tree := f.tree()
	root := tree["loss"].(map[string]any)
	original := root["AttackTreeJSON"].(string)
	version := f.version()
	var before map[string]any
	_ = json.Unmarshal([]byte(original), &before)
	document := map[string]any{"extension": map[string]any{"retained": "future field"}, "lossToolView": map[string]any{"version": 1, "nodeIds": map[string]any{f.loss: "root-local", "$new-attack": "attack-local"}, "collapsed": []string{"root-local"}}, "validationSnapshot": map[string]any{"forged": true}, "attackTreeVersion": 999}
	encoded, _ := json.Marshal(document)
	code, res := f.commit(version,
		map[string]any{"op": "createNode", "tempId": "new-attack", "label": "Attack", "properties": map[string]any{"Name": "Second attack", "AttackEventKind": "stochastic", "MetricsJSON": `{"RandomEventProbability":0.2}`}},
		map[string]any{"op": "createRelationship", "type": "EXPLOITS", "sourceHid": "$new-attack", "targetHid": f.entity},
		map[string]any{"op": "createRelationship", "type": "AT_RELATES_TO", "sourceHid": f.entity, "targetHid": "$new-attack", "properties": map[string]any{"LossHID": f.loss, "LogicOperator": "OR"}},
		f.update(map[string]any{"AttackTreeJSON": string(encoded)}))
	if code != 200 {
		t.Fatalf("new node transaction: %d %v", code, res)
	}
	actual := res["createdNodes"].(map[string]any)["new-attack"].(string)
	after := f.tree()
	root = after["loss"].(map[string]any)
	var saved map[string]any
	_ = json.Unmarshal([]byte(root["AttackTreeJSON"].(string)), &saved)
	if saved["lossToolView"].(map[string]any)["nodeIds"].(map[string]any)[actual] != "attack-local" {
		t.Fatalf("local identity lost: %v", saved)
	}
	if saved["validationSnapshot"].(map[string]any)["forged"] != nil || saved["validationSnapshot"].(map[string]any)["builtAt"] != before["validationSnapshot"].(map[string]any)["builtAt"] {
		t.Fatal("client replaced the snapshot")
	}
	if int64(root["AttackTreeVersion"].(float64)) != version+1 {
		t.Fatalf("revision did not increment once: %v", root["AttackTreeVersion"])
	}
	_, node := f.h.call("GET", "/api/nodes/hid/"+actual, "it-root", nil)
	if node["uuid"] == "" || node["uuid"] == nil {
		t.Fatalf("authority UUID missing: %v", node)
	}
	code, _ = f.commit(version, f.update(map[string]any{"Name": "stale overwrite"}))
	if code != http.StatusConflict {
		t.Fatalf("stale revision: %d", code)
	}
	if f.tree()["loss"].(map[string]any)["Name"] == "stale overwrite" {
		t.Fatal("stale draft leaked through rollback")
	}
	code, _ = f.h.call("POST", "/api/commit", "it-root", map[string]any{"toolId": "sstpa.loss", "soiHid": f.soi, "operations": []map[string]any{f.update(map[string]any{"Name": "unguarded"})}})
	if code != 409 {
		t.Fatalf("missing revision guard: %d", code)
	}
	// A canonical edit in the Attack Tool changes every dependent Loss revision.
	v := f.version()
	code, res = f.h.commit("it-root", f.soi, []map[string]any{{"op": "updateNode", "hid": f.attack, "properties": map[string]any{"Name": "Renamed in Attack Tool"}}})
	if code != 200 || f.version() != v+1 {
		t.Fatalf("shared edit did not invalidate Loss draft: %d %v", code, res)
	}
	code, _ = f.commit(v, f.update(map[string]any{"Name": "outdated after Attack Tool"}))
	if code != 409 {
		t.Fatalf("shared edit conflict: %d", code)
	}
	// Rebuild retains the upgraded view and unrecognized application fields.
	v = f.version()
	code, res = f.h.call("POST", fmt.Sprintf("/api/loss/%s/auto-build?rebuild=true&expectedVersion=%d", f.loss, v), "it-root", nil)
	if code != 200 {
		t.Fatalf("rebuild: %d %v", code, res)
	}
	raw := f.tree()["loss"].(map[string]any)["AttackTreeJSON"].(string)
	if !strings.Contains(raw, "root-local") || !strings.Contains(raw, "future field") {
		t.Fatalf("rebuild discarded view: %s", raw)
	}
	code, _ = f.h.call("POST", fmt.Sprintf("/api/loss/%s/auto-build?rebuild=true&expectedVersion=%d", f.loss, v), "it-root", nil)
	if code != 409 {
		t.Fatalf("stale rebuild: %d", code)
	}
}

func TestIntegrationLossLimitsRejectAtomicallyAndWarningsSurvive(t *testing.T) {
	f := newLossITFixture(t)
	v := f.version()
	originalCount := len(f.tree()["nodes"].([]any))
	ops := []map[string]any{}
	// 49 new root States + Environment + original State would exceed width 50.
	for i := 0; i < 49; i++ {
		temp := fmt.Sprintf("extra%d", i)
		ops = append(ops, map[string]any{"op": "createNode", "label": "State", "tempId": temp, "properties": map[string]any{"Name": temp}}, map[string]any{"op": "createRelationship", "type": "AT_RELATES_TO", "sourceHid": f.loss, "targetHid": "$" + temp, "properties": map[string]any{"LossHID": f.loss, "LogicOperator": "OR", "TailoredOut": true, "TailorReason": "Capacity verification"}})
	}
	code, res := f.commit(v, ops...)
	if code != 422 || !strings.Contains(fmt.Sprint(res), "width") || !strings.Contains(fmt.Sprint(res), lossDecompositionAdvice) {
		t.Fatalf("overflow not rejected clearly: %d %v", code, res)
	}
	if f.version() != v || len(f.tree()["nodes"].([]any)) != originalCount {
		t.Fatal("overflow partially committed")
	}
	// Below the hard maximum but at the warning threshold is accepted.
	ops = ops[:38*2]
	code, res = f.commit(v, ops...)
	if code != 200 {
		t.Fatalf("80%% warning boundary rejected: %d %v", code, res)
	}
	warning := false
	for _, x := range f.tree()["validationFindings"].([]any) {
		m := x.(map[string]any)
		if m["type"] == "NEAR_LIMIT" {
			warning = true
		}
	}
	if !warning {
		t.Fatal("80% width warning missing")
	}
	v = f.version()
	code, _ = f.commit(v, f.update(map[string]any{"AttackTreeVersion": 500}))
	if code != 422 {
		t.Fatalf("client set managed revision: %d", code)
	}
	code, _ = f.commit(v, f.update(map[string]any{"MetricDefinitionsJSON": "{invalid"}))
	if code != 422 {
		t.Fatalf("malformed rules: %d", code)
	}
	if f.version() != v {
		t.Fatal("rejected properties changed revision")
	}
}

func TestIntegrationLossConcurrentWritersAndCanonicalRemoval(t *testing.T) {
	f := newLossITFixture(t)
	version := f.version()
	codes := make(chan int, 2)
	for _, name := range []string{"Writer A", "Writer B"} {
		go func(name string) { code, _ := f.commit(version, f.update(map[string]any{"Name": name})); codes <- code }(name)
	}
	seen := map[int]int{}
	seen[<-codes]++
	seen[<-codes]++
	if seen[200] != 1 || seen[409] != 1 || f.version() != version+1 {
		t.Fatalf("concurrent guard failed: %v version=%d", seen, f.version())
	}
	code, res := f.commit(f.version(),
		map[string]any{"op": "createNode", "label": "Countermeasure", "tempId": "cm", "properties": map[string]any{"Name": "Guard"}},
		map[string]any{"op": "createNode", "label": "Attack", "tempId": "counter", "properties": map[string]any{"Name": "Bypass"}},
		map[string]any{"op": "createRelationship", "type": "AT_RELATES_TO", "sourceHid": f.attack, "targetHid": "$cm", "properties": map[string]any{"LossHID": f.loss, "LogicOperator": "AND"}},
		map[string]any{"op": "createRelationship", "type": "AT_RELATES_TO", "sourceHid": "$cm", "targetHid": "$counter", "properties": map[string]any{"LossHID": f.loss, "LogicOperator": "OR"}})
	if code != 200 {
		t.Fatalf("branch setup: %d %v", code, res)
	}
	v := f.version()
	code, res = f.h.commit("it-root", f.soi, []map[string]any{{"op": "deleteNode", "hid": f.attack}})
	if code != 200 || f.version() != v+1 {
		t.Fatalf("canonical removal should invalidate, not silently preserve stale data: %d %v", code, res)
	}
	found := false
	for _, x := range f.tree()["validationFindings"].([]any) {
		finding := x.(map[string]any)
		if finding["type"] == "TREE_STRUCTURE" && finding["severity"] == "ERROR" {
			found = true
		}
	}
	if !found {
		t.Fatal("disconnected Core branch was not surfaced for reconciliation")
	}
}

func TestIntegrationLossAutoBuildDepthOverflowRollsBack(t *testing.T) {
	f := newLossITFixture(t)
	ops := []map[string]any{}
	attack := f.attack
	// Canonical countermeasure/attack data can be larger than one analytical tree.
	// An attempted rebuild must reject the oversized projection atomically.
	for i := 0; i < 9; i++ {
		cm, at := fmt.Sprintf("guard%d", i), fmt.Sprintf("bypass%d", i)
		ops = append(ops,
			map[string]any{"op": "createNode", "label": "Countermeasure", "tempId": cm, "properties": map[string]any{"Name": cm}},
			map[string]any{"op": "createNode", "label": "Attack", "tempId": at, "properties": map[string]any{"Name": at}},
			map[string]any{"op": "createRelationship", "type": "BLOCKS", "sourceHid": "$" + cm, "targetHid": attack},
			map[string]any{"op": "createRelationship", "type": "DEFEATS", "sourceHid": "$" + at, "targetHid": "$" + cm})
		attack = "$" + at
	}
	code, res := f.h.commit("it-root", f.soi, ops)
	if code != 200 {
		t.Fatalf("canonical chain: %d %v", code, res)
	}
	version := f.version()
	count := len(f.tree()["nodes"].([]any))
	code, res = f.h.call("POST", fmt.Sprintf("/api/loss/%s/auto-build?rebuild=true&expectedVersion=%d", f.loss, version), "it-root", nil)
	if code != 422 || !strings.Contains(fmt.Sprint(res), "depth") || !strings.Contains(fmt.Sprint(res), lossDecompositionAdvice) {
		t.Fatalf("oversize rebuild: %d %v", code, res)
	}
	if f.version() != version || len(f.tree()["nodes"].([]any)) != count {
		t.Fatal("failed rebuild destroyed previous tree")
	}
}

func TestIntegrationAssetLossGoalCreationKeepsPendingTree(t *testing.T) {
	f := newLossITFixture(t)
	ops := []map[string]any{
		{"op": "createNode", "label": "Asset", "tempId": "primary", "properties": map[string]any{"Name": "Telemetry", "AssetType": "Organic", "MissionCritical": true, "Authenticity": true}},
		{"op": "createNode", "label": "Loss", "tempId": "pending", "properties": map[string]any{"Name": "Telemetry authenticity compromise", "MissionCritical": true, "Authenticity": true, "AttackTreeStatus": "NOT_BUILT"}},
		{"op": "createNode", "label": "GsnGoal", "tempId": "goal", "properties": map[string]any{"Name": "Telemetry authenticity acceptable", "GoalStatement": "Mission authenticity of telemetry is acceptable."}},
		{"op": "createRelationship", "type": "HAS_ASSET", "sourceHid": f.soi, "targetHid": "$primary"},
		{"op": "createRelationship", "type": "HAS_LOSS", "sourceHid": "$primary", "targetHid": "$pending"},
		{"op": "createRelationship", "type": "HAS_GOAL", "sourceHid": "$primary", "targetHid": "$goal"},
	}
	code, res := f.h.call("POST", "/api/commit", "it-root", map[string]any{"toolId": "sstpa.assets", "soiHid": f.soi, "operations": ops})
	if code != 200 {
		t.Fatalf("Asset Manager generation: %d %v", code, res)
	}
	created := res["createdNodes"].(map[string]any)
	pending := created["pending"].(string)
	code, tree := f.h.call("GET", "/api/loss/"+pending+"/tree", "it-root", nil)
	if code != 200 {
		t.Fatalf("pending Loss read: %d %v", code, tree)
	}
	root := tree["loss"].(map[string]any)
	edges, _ := tree["edges"].([]any)
	if root["AttackTreeStatus"] != "NOT_BUILT" || root["AttackTreeVersion"] != float64(0) || len(edges) != 0 {
		t.Fatalf("creating a pending Loss must not refine or build its tree: %v", root)
	}
	_, soi := f.h.call("GET", "/api/soi/"+f.soi, "it-root", nil)
	seen := map[string]bool{}
	for _, item := range soi["nodes"].([]any) {
		n := item.(map[string]any)
		if n["hid"] == created["primary"] {
			for _, edge := range n["relationships"].([]any) {
				r := edge.(map[string]any)
				seen[r["type"].(string)] = true
			}
		}
	}
	if !seen["HAS_LOSS"] || !seen["HAS_GOAL"] {
		t.Fatalf("Asset's generated Loss/GSN links missing: %v", seen)
	}
	// The entire normal generation rolls back if one canonical operation fails.
	before := len(soi["nodes"].([]any))
	bad := append(append([]map[string]any{}, ops...), map[string]any{"op": "createRelationship", "type": "HAS_LOSS", "sourceHid": "$goal", "targetHid": "$pending"})
	code, _ = f.h.commit("it-root", f.soi, bad)
	if code != 422 {
		t.Fatalf("invalid generated transaction accepted: %d", code)
	}
	_, soi = f.h.call("GET", "/api/soi/"+f.soi, "it-root", nil)
	if len(soi["nodes"].([]any)) != before {
		t.Fatal("failed Asset/Loss/GSN creation partially persisted")
	}
	// Creating a Loss and its actual tree in one Loss Tool transaction still
	// enrolls the new root in final validation and advances its tree version.
	code, res = f.h.call("POST", "/api/commit", "it-root", map[string]any{"toolId": "sstpa.loss", "soiHid": f.soi, "operations": []map[string]any{
		{"op": "createNode", "label": "Loss", "tempId": "built", "properties": map[string]any{"Name": "First draft"}},
		{"op": "createRelationship", "type": "HAS_LOSS", "sourceHid": f.asset, "targetHid": "$built"},
		{"op": "createRelationship", "type": "HAS_ENVIRONMENT", "sourceHid": "$built", "targetHid": f.env},
		{"op": "createRelationship", "type": "AT_RELATES_TO", "sourceHid": "$built", "targetHid": f.env, "properties": map[string]any{"LossHID": "$built", "LogicOperator": "AND"}},
	}})
	if code != 200 {
		t.Fatalf("new Loss with first tree edge: %d %v", code, res)
	}
	_, tree = f.h.call("GET", "/api/loss/"+res["createdNodes"].(map[string]any)["built"].(string)+"/tree", "it-root", nil)
	if tree["loss"].(map[string]any)["AttackTreeVersion"] != float64(1) {
		t.Fatal("new Loss tree bypassed final validation")
	}
}

func TestIntegrationLossCoverageReconciliationAndScopedLinks(t *testing.T) {
	f := newLossITFixture(t)
	tree := f.tree()
	if tree["statesTotal"] != float64(1) || tree["statesCovered"] != float64(1) || tree["traceCoverage"].([]any)[0].(map[string]any)["tracedEntities"] != float64(1) {
		t.Fatalf("CURRENT State trace coverage: %v", tree["traceCoverage"])
	}
	// A second Loss can project the same authoritative nodes independently.
	code, res := f.h.commit("it-root", f.soi, []map[string]any{
		{"op": "createNode", "label": "Loss", "tempId": "other", "properties": map[string]any{"Name": "Availability compromise"}},
		{"op": "createRelationship", "type": "HAS_LOSS", "sourceHid": f.asset, "targetHid": "$other"},
		{"op": "createRelationship", "type": "HAS_ENVIRONMENT", "sourceHid": "$other", "targetHid": f.env},
	})
	if code != 200 {
		t.Fatalf("shared tree setup: %d %v", code, res)
	}
	other := res["createdNodes"].(map[string]any)["other"].(string)
	code, res = f.h.call("POST", "/api/loss/"+other+"/auto-build?expectedVersion=0", "it-root", nil)
	if code != 200 {
		t.Fatalf("second tree build: %d %v", code, res)
	}
	remove := map[string]any{"op": "deleteRelationship", "type": "AT_RELATES_TO", "sourceHid": f.entity, "targetHid": f.attack, "properties": map[string]any{"LossHID": f.loss}}
	code, _ = f.h.commit("it-root", f.soi, []map[string]any{remove})
	if code != 403 {
		t.Fatalf("non-Loss tool modified tree links: %d", code)
	}
	code, res = f.commit(f.version(), remove)
	if code != 200 {
		t.Fatalf("scoped unlink: %d %v", code, res)
	}
	_, otherTree := f.h.call("GET", "/api/loss/"+other+"/tree", "it-root", nil)
	hasEdge := func(tree map[string]any) bool {
		for _, item := range tree["edges"].([]any) {
			e := item.(map[string]any)
			if e["sourceHid"] == f.entity && e["targetHid"] == f.attack {
				return true
			}
		}
		return false
	}
	if hasEdge(f.tree()) || !hasEdge(otherTree) {
		t.Fatal("unlink crossed the LossHID scope")
	}
	code, res = f.h.commit("it-root", f.soi, []map[string]any{{"op": "deleteRelationship", "type": "TRANSPORTS", "sourceHid": f.entity, "targetHid": f.asset, "properties": map[string]any{"TraceStateHID": f.state}}})
	if code != 200 {
		t.Fatalf("supersede trace: %d %v", code, res)
	}
	tree = f.tree()
	if tree["statesCovered"] != float64(0) || tree["loss"].(map[string]any)["AttackTreeStatus"] != "INVALIDATED" {
		t.Fatalf("trace change did not invalidate coverage/tree: %v", tree)
	}
	found := false
	for _, item := range tree["validationFindings"].([]any) {
		finding := item.(map[string]any)
		if finding["type"] == "TRACE_INVALIDATED" && finding["severity"] == "ERROR" {
			found = true
		}
	}
	if !found {
		t.Fatal("snapshot reconciliation omitted the superseded trace")
	}
	code, res = f.h.call("POST", fmt.Sprintf("/api/loss/%s/auto-build?rebuild=true&expectedVersion=%d", f.loss, f.version()), "it-root", nil)
	if code != 200 {
		t.Fatalf("reconcile by rebuild: %d %v", code, res)
	}
	tree = f.tree()
	if len(tree["nodes"].([]any)) != 2 || tree["loss"].(map[string]any)["AttackTreeStatus"] != "AUTO_GENERATED" || tree["loss"].(map[string]any)["TreeIsValid"] != false {
		t.Fatalf("rebuild retained stale trace branch or falsely claimed complete tree: %v", tree)
	}
	for _, item := range tree["validationFindings"].([]any) {
		if item.(map[string]any)["type"] == "TRACE_INVALIDATED" {
			t.Fatal("fresh rebuild retained the stale snapshot")
		}
	}
}

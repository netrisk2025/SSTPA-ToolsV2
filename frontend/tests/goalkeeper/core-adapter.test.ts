import { describe, expect, it } from "vitest";
import type { SoINode, SoIRelationship } from "../../src/api/types";
import { displayIdFor, fromCore, readCoreView, serializeCoreView } from "../../src/tools/goalkeeper/core-adapter";
import { validateStructure } from "../../src/tools/goalkeeper/domain/rules/validate";
import { exportJson, exportMarkdown } from "../../src/tools/goalkeeper/domain/export/report";
import { glyphFor } from "../../src/tools/goalkeeper/domain/presentation/geometry";
import { renderDiagram } from "../../src/tools/goalkeeper/domain/presentation/svg";

function rel(type: string, targetHID: string): SoIRelationship { return { type, targetHID, targetUUID: `uuid-${targetHID}`, props: {} }; }
function node(hid: string, typeName: string, properties: Record<string, unknown> = {}, relationships: SoIRelationship[] = []): SoINode {
  return { hid, uuid: `uuid-${hid}`, typeName, soi: "SYS_1", labels: [typeName], properties: { Name: hid, [`${typeName.slice(3)}Statement`]: `${hid} full statement`, ...properties }, relationships };
}
function fixture(): SoINode[] {
  return [
    node("GOL_1_1", "GsnGoal", { GoalID: 1 }, [rel("SUPPORTED_BY", "STR_1_1"), rel("IN_CONTEXT_OF", "CTX_1_1")]),
    node("STR_1_1", "GsnStrategy", { StrategyID: 1 }, [rel("SUPPORTED_BY", "GOL_1_2"), rel("SUPPORTED_BY", "GOL_1_3")]),
    node("GOL_1_2", "GsnGoal", { GoalID: 2 }, [rel("SUPPORTED_BY", "SOL_1_1")]),
    node("GOL_1_3", "GsnGoal", { GoalID: 3, Undeveloped: true }),
    node("SOL_1_1", "GsnSolution", { SolutionID: 1 }, [rel("HAS_VALIDATION", "VAL_1_1"), rel("HAS_VERIFICATION", "VER_1_1"), rel("HAS_LOSS", "LOS_1_1")]),
    node("CTX_1_1", "GsnContext", { ContextID: 1 }),
    node("VAL_1_1", "Validation", { Name: "Provenance validation", ShortDescription: "Source review", VMethod: "Inspection", Status: "In Progress" }),
    node("VER_1_1", "Verification", { Name: "Verification plan", ShortDescription: "Not executed", Procedure: "Run the planned scenario", ArtifactPath: "evidence/report.txt" }),
    node("LOS_1_1", "Loss", { Name: "Failure to report wildfire", MissionCritical: true, Availability: true }),
    node("GOL_2_1", "GsnGoal", { GoalID: 1 }, [rel("SUPPORTED_BY", "SOL_2_1")]),
    node("SOL_2_1", "GsnSolution", { SolutionID: 1 }, [rel("HAS_LOSS", "LOS_2_1")]),
    node("LOS_2_1", "Loss", { Name: "Other case" }),
  ];
}
function codes(nodes: SoINode[]) { return validateStructure(fromCore("GOL_1_1", nodes)).map(f => f.code); }
const customStyle = { font: "#112233", box: "#abcdef", line: "#445566", border: "#778899" };

describe("SSTPA Core identity and case isolation", () => {
  it("keys every semantic object and relationship by HID and keeps other cases out", () => {
    const nodes = fixture(), before = JSON.stringify(nodes), structure = fromCore("GOL_1_1", nodes);
    expect([...structure.elements.keys()]).toEqual(["GOL_1_1", "STR_1_1", "GOL_1_2", "SOL_1_1", "GOL_1_3", "CTX_1_1"]);
    expect([...structure.evidence.keys()]).toEqual(["VAL_1_1", "VER_1_1", "LOS_1_1"]);
    expect(structure.elements.get("STR_1_1")).toMatchObject({ gsnId: "STR_1_1", displayId: "S1", supportedBy: ["GOL_1_2", "GOL_1_3"] });
    expect(validateStructure(structure).filter(f => f.severity === "ERROR")).toEqual([]);
    expect(JSON.stringify(nodes)).toBe(before);
  });
  it("reports repeated display IDs without collapsing identities or confusing type prefixes", () => {
    const nodes = fixture(); nodes[3].properties.GoalID = 2;
    const structure = fromCore("GOL_1_1", nodes);
    expect(structure.elements.size).toBe(6);
    expect(structure.elements.get("GOL_1_2")?.displayId).toBe("G2");
    expect(structure.elements.get("GOL_1_3")?.displayId).toBe("G2");
    expect(validateStructure(structure).filter(f => f.code === "DUP_DISPLAY_ID").map(f => f.nodeId)).toEqual(["GOL_1_2", "GOL_1_3"]);
    expect(displayIdFor(node("root", "GsnGoal", { GoalID: "G7" }))).toBe("G7");
    expect(displayIdFor(node("root", "GsnGoal", { GoalID: null }))).toBe("root");
  });
  it("rejects ambiguous canonical identities and diagnoses malformed fields", () => {
    const nodes = fixture();
    expect(() => fromCore(nodes[0].hid, [...nodes, { ...nodes[0] }])).toThrow("duplicate canonical HID");
    nodes[3].properties.GoalStatement = { unexpected: true };
    nodes[3].properties.Undeveloped = "true";
    nodes[3].relationships = [null] as unknown as SoIRelationship[];
    expect(codes(nodes)).toEqual(expect.arrayContaining(["MALFORMED_STATEMENT", "MALFORMED_UNDEVELOPED", "MALFORMED_RELATIONSHIP"]));
    expect(fromCore(nodes[0].hid, nodes).elements.get(nodes[3].hid)?.statement).toBe("");
  });
  it("accepts authentic Core leaf payloads with null or omitted outgoing relationships", () => {
    const nodes = fixture();
    // GET /api/soi emits null for leaves; legacy API payloads may omit this field.
    const wireNodes = JSON.parse(JSON.stringify(nodes.map(n => n.relationships.length ? n : { ...n, relationships: n.hid === "CTX_1_1" ? undefined : null }))) as SoINode[];
    const structure = fromCore("GOL_1_1", wireNodes);
    expect(structure.elements.size).toBe(6);
    expect(structure.elements.get("GOL_1_3")?.supportedBy).toEqual([]);
    expect(structure.elements.get("CTX_1_1")?.inContextOf).toEqual([]);
    expect(validateStructure(structure).filter(f => f.severity === "ERROR")).toEqual([]);
    expect(validateStructure(structure).filter(f => f.code === "NO_SUPPORT")).toHaveLength(1);
  });
  it("retains invalid imported links for validation instead of repairing their meaning", () => {
    const nodes = fixture();
    nodes[1].relationships.push(rel("SUPPORTED_BY", "SOL_1_1"), rel("IN_CONTEXT_OF", "GOL_1_1"));
    nodes[0].relationships.push(rel("SUPPORTED_BY", "MISSING"), rel("SUPPORTED_BY", "STR_1_1"));
    expect(codes(nodes)).toEqual(expect.arrayContaining(["ILLEGAL_REL", "CYCLE", "DUP_EDGE", "MISSING_TARGET"]));
  });
  it("diagnoses selecting a nested goal without pulling its external parent into the case", () => {
    const structure = fromCore("GOL_1_2", fixture());
    expect([...structure.elements.keys()]).toEqual(["GOL_1_2", "SOL_1_1"]);
    expect(validateStructure(structure).some(f => f.code === "ROOT_INCOMING")).toBe(true);
  });
  it("never imports another System of Interest through a corrupt argument or evidence edge", () => {
    const nodes = fixture(); nodes[2].soi = "SYS_2"; nodes[6].soi = "SYS_2";
    nodes[0].relationships.push(rel("SUPPORTED_BY", "SOL_1_1"));
    const structure = fromCore("GOL_1_1", nodes);
    expect(structure.elements.has("GOL_1_2")).toBe(false);
    expect(structure.evidence.has("VAL_1_1")).toBe(false);
    expect(validateStructure(structure).filter(f => f.code === "CROSS_SOI")).toHaveLength(2);
  });
  it("preserves evidence provenance and pending status without treating Loss as proof of acceptance", () => {
    const nodes = fixture(), structure = fromCore("GOL_1_1", nodes);
    expect(structure.evidence.get("VAL_1_1")).toMatchObject({ kind: "Other", statement: "Source review\n\nInspection", metadata: { core_hid: "VAL_1_1", core_uuid: "uuid-VAL_1_1", source_properties: { Status: "In Progress" } } });
    expect(structure.evidence.get("VER_1_1")).toMatchObject({ artifactPath: "evidence/report.txt", statement: "Not executed\n\nRun the planned scenario" });
    expect(structure.evidence.get("LOS_1_1")?.metadata).toMatchObject({ source_properties: { MissionCritical: true, Availability: true } });
    nodes[6].properties.Status = "changed outside projection";
    expect(structure.evidence.get("VAL_1_1")?.metadata).toMatchObject({ source_properties: { Status: "In Progress" } });
    const exported = JSON.parse(exportJson(structure));
    expect(exported.relationships).toContainEqual({ type: "HAS_EVIDENCE", source: "SOL_1_1", target: "VAL_1_1" });
    expect(exported.reviewLimit).toContain("does not establish evidence sufficiency");
    expect(exported.evidence[0].metadata.core_uuid).toBe("uuid-VAL_1_1");
  });
  it("keeps the customer Markdown report concise while retaining complete source properties in JSON", () => {
    const nodes = fixture();
    const viewBlob = JSON.stringify({ schemaVersion: "1.0", internalPresentation: "saved-view-blob".repeat(2000) });
    const metricsBlob = JSON.stringify({ internalMetrics: "metric-detail-blob".repeat(2000) });
    const treeBlob = JSON.stringify({ internalTree: "attack-tree-blob".repeat(2000) });
    nodes[0].properties.GoalStructure = viewBlob;
    nodes[0].properties.ShortDescription = "Argument derived from the selected loss record.";
    nodes[6].properties.VStatement = "Source review remains pending independent validation.";
    nodes[7].properties.VStatus = "NOT_RUN";
    nodes[8].properties.AttackTreeJSON = treeBlob;
    nodes[8].properties.MetricsJSON = metricsBlob;
    nodes[8].properties.MetricDefinitionsJSON = metricsBlob;
    const structure = fromCore("GOL_1_1", nodes), before = exportJson(structure);
    const markdown = exportMarkdown(structure);
    for (const hidden of ["source_properties", "GoalStructure", "AttackTreeJSON", "MetricDefinitionsJSON", "MetricsJSON", "saved-view-blob", "metric-detail-blob", "attack-tree-blob"]) expect(markdown).not.toContain(hidden);
    for (const retained of ["core_hid: VAL_1_1", "core_uuid: uuid-VAL_1_1", "core_type: Validation", "Source review remains pending independent validation.", "Verification status: NOT_RUN", "Status: In Progress", "Run the planned scenario", "Argument derived from the selected loss record.", "MissionCritical, Availability", "evidence/report.txt"]) expect(markdown).toContain(retained);
    expect(markdown.length).toBeLessThan(6000);
    const json = JSON.parse(before);
    expect(json.elements[0].metadata.source_properties.GoalStructure).toBe(viewBlob);
    expect(json.evidence.find((e: { filePath: string }) => e.filePath === "LOS_1_1").metadata.source_properties).toMatchObject({ AttackTreeJSON: treeBlob, MetricsJSON: metricsBlob, MetricDefinitionsJSON: metricsBlob });
    expect(JSON.parse(exportJson(structure)).elements).toEqual(json.elements);
    expect(JSON.parse(exportJson(structure)).evidence).toEqual(json.evidence);
  });
  it("diagnoses missing, duplicate and wrong-category evidence associations", () => {
    const nodes = fixture(); nodes[4].relationships = [rel("HAS_LOSS", "VAL_1_1"), rel("HAS_VERIFICATION", "missing"), rel("HAS_VERIFICATION", "missing")];
    expect(codes(nodes)).toEqual(expect.arrayContaining(["INVALID_EVIDENCE_REL", "MISSING_EVIDENCE", "DUP_EVIDENCE_EDGE"]));
    expect(fromCore("GOL_1_1", nodes).evidence.size).toBe(0);
  });
  it("renders short labels while SVG interactions and model connections retain canonical HIDs", () => {
    const nodes = fixture(), structure = fromCore("GOL_1_1", nodes), view = readCoreView(nodes[0], structure);
    const root = structure.elements.get("GOL_1_1")!;
    expect(glyphFor(root).idLines).toEqual(["G1"]);
    const svg = renderDiagram(structure, view.positions, { interactive: true });
    expect(svg).toContain('data-node-id="GOL_1_1"');
    expect(svg).toContain('data-edge="GOL_1_1|support|STR_1_1"');
    expect(svg).toContain("G1 · Goal:");
    expect(svg).not.toContain('data-node-id="G1"');
  });
});

describe("GoalStructure presentation migration and safe persistence", () => {
  it("loads legacy positions and viewport by HID and never imports a stored graph snapshot", () => {
    const nodes = fixture(), root = nodes[0];
    root.properties.GoalStructure = JSON.stringify({ schemaVersion: "1.0", rootGoalHid: root.hid, rootGoalUuid: root.uuid, nodes: [{ hid: root.hid, x: -30, y: 44 }, { hid: "GOL_1_2", x: 900, y: 800 }, { hid: "GOL_2_1", x: 4000, y: 4000 }], viewport: { x: -10, y: 20 }, zoom: 0.7, gsnNodes: [{ hid: "INVENTED", typeName: "GsnGoal" }], gsnRelationships: [{ source: root.hid, target: "INVENTED", type: "SUPPORTED_BY" }] });
    const structure = fromCore(root.hid, nodes), view = readCoreView(root, structure);
    expect(view.positions[root.hid]).toEqual({ x: -30, y: 44 });
    expect(view.positions.GOL_1_2).toEqual({ x: 900, y: 800 });
    expect(view.viewport).toEqual({ x: -10, y: 20, zoom: 0.7 });
    expect(view.hasSavedLayout).toBe(true);
    expect(view.newlyPlaced).toHaveLength(4);
    expect(view.positions.GOL_2_1).toBeUndefined();
    expect(structure.elements.has("INVENTED")).toBe(false);
    expect(structure.elements.get(root.hid)?.supportedBy).toEqual(["STR_1_1"]);
  });
  it("round-trips new coordinates, focused viewport and four safe style channels while retaining the old envelope", () => {
    const nodes = fixture(), root = nodes[0];
    root.properties.GoalStructure = JSON.stringify({ schemaVersion: "1.0", rootGoalHid: root.hid, unknown: { keep: "yes" }, validationFindings: [{ message: "historic only" }], nodes: [{ hid: root.hid, x: 0, y: 0, collapsed: true, note: "retain" }], goalKeeperView: { version: 1, extension: "future additive field" } });
    const before = JSON.stringify(nodes), structure = fromCore(root.hid, nodes);
    const serialized = serializeCoreView(root, structure, { positions: { [root.hid]: { x: 113, y: -47 }, GOL_1_2: { x: 720, y: 880 }, foreign: { x: 1, y: 2 } }, viewport: { x: 123, y: 456, zoom: 1.25, focusId: "GOL_1_2" }, nodeStyles: { GsnGoal: customStyle } });
    expect(JSON.stringify(nodes)).toBe(before);
    const saved = JSON.parse(serialized);
    expect(saved).toMatchObject({ schemaVersion: "1.0", rootGoalHid: root.hid, rootGoalUuid: root.uuid, unknown: { keep: "yes" }, validationFindings: [{ message: "historic only" }], goalKeeperView: { version: 1, extension: "future additive field" } });
    expect(saved.nodes[0]).toEqual({ hid: root.hid, x: 113, y: -47, collapsed: true, note: "retain" });
    expect(saved.nodes).toHaveLength(2);
    root.properties.GoalStructure = serialized;
    const view = readCoreView(root, structure);
    expect(view.positions[root.hid]).toEqual({ x: 113, y: -47 });
    expect(view.viewport).toEqual({ x: 123, y: 456, zoom: 1.25, focusId: "GOL_1_2" });
    expect(view.nodeStyles).toEqual({ GsnGoal: customStyle });
    expect(view.warnings).toEqual([]);
    expect(view.savedAt).toMatch(/^\d{4}-/);
  });
  it.each(["broken JSON", "[]", JSON.stringify({ schemaVersion: "9.0" }), JSON.stringify({ rootGoalHid: "foreign" }), JSON.stringify({ rootGoalUuid: "foreign-uuid" }), JSON.stringify({ goalKeeperView: { version: 7 } })])("reports and refuses to rewrite unrecognized saved data: %s", saved => {
    const nodes = fixture(), root = nodes[0]; root.properties.GoalStructure = saved;
    const structure = fromCore(root.hid, nodes), view = readCoreView(root, structure);
    expect(view.warnings).toHaveLength(1);
    expect(view.hasSavedLayout).toBe(false);
    expect(() => serializeCoreView(root, structure, view)).toThrow();
    expect(root.properties.GoalStructure).toBe(saved);
  });
  it("drops malformed coordinates, impossible viewports and injected colors before rendering or saving", () => {
    const nodes = fixture(), root = nodes[0];
    root.properties.GoalStructure = { schemaVersion: "1.0", goalKeeperView: { version: 1, positions: { [root.hid]: { x: Infinity, y: 20 }, STR_1_1: { x: "10", y: 20 }, GOL_1_2: { x: 0, y: 0 }, stale: { x: 1, y: 1 } }, viewport: { x: NaN, y: "20", zoom: -1, focusId: "stale" }, nodeStyles: { GsnGoal: { ...customStyle, box: "url(javascript:alert(1))" }, GsnStrategy: customStyle, GsnSolution: { font: "#000000" }, Unknown: customStyle } } };
    const structure = fromCore(root.hid, nodes), view = readCoreView(root, structure);
    expect(view.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(view.positions.GOL_1_2).toEqual({ x: 0, y: 0 });
    expect(view.newlyPlaced).toHaveLength(5);
    expect(view.nodeStyles).toEqual({ GsnStrategy: customStyle });
    const saved = JSON.parse(serializeCoreView(root, structure, { ...view, positions: { [root.hid]: { x: NaN, y: 0 } }, nodeStyles: { GsnGoal: { ...customStyle, line: '#000000" onload="bad' } } }));
    expect(saved.goalKeeperView.positions).toEqual({});
    expect(saved.goalKeeperView.nodeStyles).toEqual({});
  });
  it("does not apply or save a view under another canonical root", () => {
    const nodes = fixture(), structure = fromCore(nodes[0].hid, nodes);
    expect(readCoreView(nodes[9], structure).warnings).toHaveLength(1);
    expect(() => serializeCoreView(nodes[9], structure, readCoreView(nodes[0], structure))).toThrow("canonical Root Goal");
  });
  it("treats empty or schema-default Null layout values as unsaved", () => {
    for (const value of [undefined, null, "", "Null", "null"]) {
      const nodes = fixture(); nodes[0].properties.GoalStructure = value;
      const structure = fromCore(nodes[0].hid, nodes), view = readCoreView(nodes[0], structure);
      expect(view.hasSavedLayout).toBe(false);
      expect(view.warnings).toEqual([]);
      expect(Object.keys(view.positions)).toHaveLength(6);
      expect(() => serializeCoreView(nodes[0], structure, view)).not.toThrow();
    }
  });
});

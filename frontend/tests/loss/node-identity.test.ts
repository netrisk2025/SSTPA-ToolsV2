import { SIMULATED_FIRESAT_UUIDS, simulatedAuthoritativeUuid } from "./fixtures/identity";
import { describe, expect, it } from "vitest";
import {
  createOverview,
  createShared,
  createWide,
  defaultView,
  EXAMPLES,
} from "./examples";
import {
  AUTHORITATIVE_UUID_PATTERN,
  NODE_PROPERTY_OPTIONS,
  nodePropertyValue,
  selectedMetricPropertyKeys,
  selectedNodePropertyKeys,
} from "../../src/tools/loss/domain/identity";
import { evaluateMetrics } from "../../src/tools/loss/domain/metrics";
import { commitTree, MemoryRepository, parseTree } from "../../src/tools/loss/domain/storage";

describe("tree node identity and simulated authoritative UUIDs", () => {
  it("distinguishes the tree node ID from its source HID and simulated UUID", () => {
    const processor = createOverview().nodes.find((n) => n.id === "processor")!;
    expect(nodePropertyValue(processor, "nodeId")).toBe("processor");
    expect(processor.hid).toBe("EL_1.1.2_3");
    expect(nodePropertyValue(processor, "authoritativeUuid")).toBe(
      SIMULATED_FIRESAT_UUIDS["Component:EL_1.1.2_3"],
    );
    expect(nodePropertyValue(processor, "provenance")).toBe("Reference");
  });

  it("uses the same simulated authority across trees and two shared relationships", () => {
    const overview = createOverview();
    const shared = createShared();
    const wide = createWide();
    const source = overview.nodes.find((n) => n.id === "processor")!;
    expect(
      wide.nodes.find((n) => n.id === "wide-processor")!.authoritativeUuid,
    ).toBe(source.authoritativeUuid);
    expect(
      shared.nodes.find((n) => n.id === "processor")!.authoritativeUuid,
    ).toBe(source.authoritativeUuid);
    expect(shared.edges.filter((e) => e.target === "processor")).toHaveLength(
      2,
    );
    expect(shared.nodes.filter((n) => n.id === "processor")).toHaveLength(1);
  });

  it("assigns only known reference elements UUIDs in every example", () => {
    for (const example of EXAMPLES) {
      for (const n of example.create().nodes) {
        if (n.provenance === "FireSat reference") {
          expect(n.authoritativeUuid, `${example.id}: ${n.id}`).toBe(
            SIMULATED_FIRESAT_UUIDS[`${n.type}:${n.hid}`],
          );
          expect(n.authoritativeUuid).toMatch(AUTHORITATIVE_UUID_PATTERN);
        } else {
          expect(n.authoritativeUuid).toBeNull();
          expect(nodePropertyValue(n, "authoritativeUuid")).toBe(
            "not yet committed",
          );
        }
      }
    }
  });

  it("does not synthesize authority when importing missing legacy identity fields", () => {
    const legacy = createOverview();
    for (const n of legacy.nodes) delete n.authoritativeUuid;
    legacy.nodes.find((n) => n.id === "video")!.hid = "INT_UNKNOWN";
    legacy.nodes.find((n) => n.id === "classify")!.type = "Component";
    expect(
      simulatedAuthoritativeUuid({
        type: "Component",
        hid: "EL_1.1.2_3",
        provenance: "Prototype illustration",
      }),
    ).toBeNull();
    const imported = parseTree(JSON.stringify(legacy));
    expect(
      imported.nodes.find((n) => n.id === "processor")!.authoritativeUuid,
    ).toBeNull();
    for (const id of ["video", "classify", "diagnostic", "loss"])
      expect(
        imported.nodes.find((n) => n.id === id)!.authoritativeUuid,
      ).toBeNull();
    expect(
      legacy.nodes.find((n) => n.id === "processor")!.authoritativeUuid,
    ).toBeUndefined();
  });

  it("preserves explicit null and externally supplied UUIDs without assigning on Commit", () => {
    const t = createOverview();
    const uuid = "d2508782-49d3-4c63-8e89-64c6dd4123d2";
    t.nodes.find((n) => n.id === "processor")!.authoritativeUuid = null;
    t.nodes.find((n) => n.id === "video")!.authoritativeUuid = uuid;
    const draftOnly = t.nodes.find((n) => n.id === "diagnostic")!;
    delete draftOnly.authoritativeUuid;
    const repo = new MemoryRepository();
    const committed = commitTree(t, repo);
    const restored = parseTree(JSON.stringify(repo.load()));
    expect(restored).toEqual(committed);
    expect(
      restored.nodes.find((n) => n.id === "processor")!.authoritativeUuid,
    ).toBeNull();
    expect(
      restored.nodes.find((n) => n.id === "video")!.authoritativeUuid,
    ).toBe(uuid);
    expect(
      nodePropertyValue(
        restored.nodes.find((n) => n.id === "diagnostic")!,
        "authoritativeUuid",
      ),
    ).toBe("not yet committed");
    expect(
      committed.nodes.find((n) => n.id === "diagnostic")!.authoritativeUuid,
    ).toBeNull();
  });

  it("does not impose cross-node UUID uniqueness on imports", () => {
    const t = createOverview();
    const uuid = t.nodes.find((n) => n.id === "processor")!.authoritativeUuid;
    t.nodes.find((n) => n.id === "video")!.authoritativeUuid = uuid;
    expect(() => parseTree(JSON.stringify(t))).not.toThrow();
  });

  it.each(
    ["", "processor", "c49d6656-580d-5adf-92ff", 42, {}, []].map((value) => [
      value,
    ]),
  )(
    "rejects malformed authoritative UUID %j without replacing the committed snapshot",
    (uuid) => {
      const repo = new MemoryRepository();
      const baseline = createOverview();
      repo.save(baseline);
      const invalid = structuredClone(baseline);
      Object.assign(invalid.nodes[0]!, { authoritativeUuid: uuid });
      expect(() => commitTree(invalid, repo)).toThrow("Invalid node record");
      expect(repo.load()).toEqual(baseline);
    },
  );
});

describe("root-owned node presentation namespace", () => {
  it("offers node metadata separately and preserves default metric visibility", () => {
    const view = defaultView();
    expect(NODE_PROPERTY_OPTIONS).toEqual([
      { key: "nodeId", label: "Node ID" },
      { key: "authoritativeUuid", label: "Authoritative UUID" },
      { key: "provenance", label: "Provenance" },
    ]);
    expect(selectedNodePropertyKeys(view)).toEqual([]);
    expect(selectedMetricPropertyKeys(view)).toEqual([
      "AttackCost",
      "TechnicalAbility",
      "AttackTime",
    ]);
  });

  it("migrates the legacy provenance toggle without turning it into a metric", () => {
    const t = createOverview();
    const view = t.root.AttackTreeJSON;
    delete view.selectedNodeProperties;
    view.selectedProperties = ["provenance", "AttackCost"];
    expect(selectedNodePropertyKeys(view)).toEqual(["provenance"]);
    expect(selectedMetricPropertyKeys(view)).toEqual(["AttackCost"]);
    const restored = parseTree(JSON.stringify(t)).root.AttackTreeJSON;
    expect(restored.selectedProperties).toEqual(["AttackCost"]);
    expect(restored.selectedNodeProperties).toEqual(["provenance"]);
  });

  it("keeps a custom metric named provenance independent once metadata has its own field", () => {
    const t = createOverview();
    const view = t.root.AttackTreeJSON;
    view.selectedNodeProperties = ["nodeId"];
    view.selectedProperties = ["provenance"];
    t.root.MetricDefinitionsJSON.push({
      ...t.root.MetricDefinitionsJSON[0]!,
      id: "provenance",
      label: "Provenance score",
      unit: "points",
    });
    const restored = parseTree(JSON.stringify(t)).root.AttackTreeJSON;
    expect(selectedNodePropertyKeys(restored)).toEqual(["nodeId"]);
    expect(selectedMetricPropertyKeys(restored)).toEqual(["provenance"]);
  });

  it("persists choices without altering analytical inputs or results", () => {
    const t = createOverview();
    const before = evaluateMetrics(t);
    const metricInputs = structuredClone(t.nodes.map((n) => n.metrics));
    t.root.AttackTreeJSON.selectedNodeProperties = [
      "nodeId",
      "authoritativeUuid",
      "provenance",
    ];
    const committed = commitTree(t, new MemoryRepository());
    expect(committed.root.AttackTreeJSON.selectedNodeProperties).toEqual([
      "nodeId",
      "authoritativeUuid",
      "provenance",
    ]);
    expect(committed.nodes.map((n) => n.metrics)).toEqual(metricInputs);
    expect(evaluateMetrics(committed)).toEqual(before);
  });

  it.each(
    [null, "nodeId", ["AttackCost"], ["nodeId", 1]].map((value) => [value]),
  )("rejects invalid node-property selection %j", (selection) => {
    const t = createOverview();
    Object.assign(t.root.AttackTreeJSON, { selectedNodeProperties: selection });
    expect(() => parseTree(JSON.stringify(t))).toThrow(
      "presentation properties",
    );
  });
});

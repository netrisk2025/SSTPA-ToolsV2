import { describe, it, expect } from "vitest";
import {
  EXAMPLES,
  createOverview,
  createWide,
  createDeep,
  createSequence,
  createEnvelope,
  defaultView,
} from "./examples";
import { graphStats, validateGraph } from "../../src/tools/loss/domain/graph";

describe("FireSat fixture provenance and review scenes [7–7.3]", () => {
  it("keeps every example structurally valid and within the envelope", () => {
    for (const example of EXAMPLES) {
      const t = example.create();
      expect(
        validateGraph(t).filter((f) => f.severity === "error"),
        example.id,
      ).toEqual([]);
      expect(t.nodes.length).toBeLessThanOrEqual(1000);
    }
  });
  it("preserves actual source identities and marks every analytical extension", () => {
    const t = createOverview();
    expect(t.nodes.find((n) => n.id === "processor")).toMatchObject({
      hid: "EL_1.1.2_3",
      label: "Payload Processor",
      provenance: "FireSat reference",
    });
    expect(t.nodes.find((n) => n.id === "video")).toMatchObject({
      hid: "INT_1.1.2_1",
      label: "Sensor Video Input Interface",
    });
    for (const n of t.nodes.filter((n) =>
      ["Loss", "Attack", "Countermeasure", "Asset"].includes(n.type),
    )) {
      expect(n.provenance).toBe("Prototype illustration");
      expect(n.hid).toMatch(/^DEMO_/);
    }
    expect(t.nodes.length).toBeGreaterThanOrEqual(25);
    expect(t.nodes.length).toBeLessThan(100);
  });
  it("uses one shared entity identity under two States", () => {
    const t = createOverview();
    expect(t.nodes.filter((n) => n.hid === "EL_1.1.2_3")).toHaveLength(1);
    expect(t.edges.filter((e) => e.target === "processor")).toHaveLength(2);
  });
  it("makes width through States/entities and depth through countermeasure recurrence", () => {
    const wide = createWide(),
      deep = createDeep();
    expect(graphStats(wide).width).toBe(40);
    expect(wide.nodes.filter((n) => n.type === "State")).toHaveLength(4);
    expect(graphStats(deep).depth).toBe(20);
    expect(
      deep.nodes.filter((n) => n.type === "Countermeasure").length,
    ).toBeGreaterThanOrEqual(7);
    expect(
      deep.edges.some(
        (e) =>
          deep.nodes.find((n) => n.id === e.source)?.type === "Attack" &&
          deep.nodes.find((n) => n.id === e.target)?.type === "Attack",
      ),
    ).toBe(true);
  });
  it("uses zero-based SAND order while keeping Environment a separate context", () => {
    const t = createSequence();
    expect(
      t.edges
        .filter((e) => e.source === "loss" && e.target !== "env")
        .map((e) => e.sequence),
    ).toEqual([0, 1]);
    expect(t.edges.find((e) => e.target === "env")).toMatchObject({
      gate: "AND",
      sequence: null,
    });
  });
  it("generates an exact finite maximum and independent one-over test fixture", () => {
    expect(graphStats(createEnvelope())).toMatchObject({
      nodes: 1000,
      depth: 20,
      width: 50,
    });
    expect(createEnvelope(1001).nodes).toHaveLength(1001);
    expect(
      validateGraph(createEnvelope(1001)).some((f) => f.code === "LIMIT"),
    ).toBe(true);
  });
  it("does not reuse mutable source/default state across examples", () => {
    const a = createOverview(),
      b = createOverview();
    a.root.AttackTreeJSON.nodeStyles.Attack.box = "#000000";
    a.nodes[0]!.label = "changed";
    expect(b.nodes[0]!.label).not.toBe("changed");
    expect(b.root.AttackTreeJSON.nodeStyles.Attack.box).not.toBe("#000000");
    expect(defaultView().positions).toEqual({});
  });
});

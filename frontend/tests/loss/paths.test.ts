import { describe, it, expect } from "vitest";
import { createOverview, illustrativeLeafMetrics } from "./examples";
import { analyzePaths } from "../../src/tools/loss/domain/paths";
import type { AttackTree, TreeEdge, TreeNode } from "../../src/tools/loss/domain/types";
function reconvergent(): AttackTree {
  const t = createOverview();
  t.nodes = t.nodes.filter((n) =>
    ["loss", "env", "imaging", "processor"].includes(n.id),
  );
  t.edges = t.edges.filter(
    (e) =>
      t.nodes.some((n) => n.id === e.source) &&
      t.nodes.some((n) => n.id === e.target),
  );
  let prior = ["processor"];
  const proto: TreeEdge = {
    id: "",
    source: "",
    target: "",
    lossId: t.rootId,
    gate: "OR",
    sequence: null,
    tailoredOut: false,
    tailoredReason: "",
    completeBlock: false,
    blockReason: "",
    allowedRV: null,
    allowedReason: "",
  };
  for (let depth = 3; depth <= 19; depth++) {
    const next: string[] = [];
    for (let j = 0; j < 2; j++) {
      const id = `layer-${depth}-${j}`;
      next.push(id);
      const n: TreeNode = {
        id,
        hid: `DEMO_${id}`,
        label: `Attack ${depth}.${j}`,
        type: "Attack",
        description: "Analytical cap fixture",
        provenance: "Prototype illustration",
        metrics: depth === 19 ? illustrativeLeafMetrics(j) : {},
      };
      t.nodes.push(n);
      for (const source of prior)
        t.edges.push({ ...proto, id: `${source}:${id}`, source, target: id });
    }
    prior = next;
  }
  return t;
}
describe("path analysis and bounded enumeration [6,6.1]", () => {
  it("classifies real terminal traversals, excluding Environment and tailored routes", () => {
    const result = analyzePaths(createOverview());
    expect(new Set(result.paths.map((p) => p.status))).toEqual(
      new Set(["RV", "ALLOWED", "BLOCKED", "DERIVED"]),
    );
    expect(result.paths.some((p) => p.nodeIds.includes("env"))).toBe(false);
    expect(result.paths.some((p) => p.nodeIds.includes("obsolete"))).toBe(
      false,
    );
    expect(Number(result.total)).toBe(result.paths.length);
    expect(result.truncated).toBe(false);
    for (const p of result.paths.filter(
      (p) => p.status === "ALLOWED" || p.status === "BLOCKED",
    ))
      expect(p.reason.length).toBeGreaterThan(20);
  });
  it("retains exact totals and RV counts above the enumeration cap", () => {
    const t = reconvergent(),
      r = analyzePaths(t, 10000);
    expect(r.total).toBe("131072");
    expect(r.rvCount).toBe("131072");
    expect(r.paths).toHaveLength(10000);
    expect(r.truncated).toBe(true);
  });
  it("uses the terminal owning edge for shared-node Allowed RV classification", () => {
    const t = createOverview(),
      leaf = t.nodes.find((n) => n.id === "keytheft")!;
    const template = t.edges.find((e) => e.target === leaf.id)!;
    t.edges.push({
      ...template,
      id: "calibration-key",
      source: "calibration",
      target: leaf.id,
      gate: "AND",
      allowedRV: null,
      allowedReason: "",
    });
    const rows = analyzePaths(t).paths.filter((p) => p.terminalId === leaf.id);
    expect(rows.some((p) => p.status === "ALLOWED")).toBe(true);
    expect(rows.some((p) => p.status === "RV")).toBe(true);
  });
  it("stops CompleteBlock traversal even if that Countermeasure has descendants", () => {
    const t = createOverview(),
      block = t.edges.find((e) => e.completeBlock)!;
    const template = t.edges.find((e) => e.target === "keytheft")!;
    t.edges.push({
      ...template,
      id: "hypothetical-counterattack",
      source: block.target,
      target: "keytheft",
      allowedRV: null,
      allowedReason: "",
    });
    const blocked = analyzePaths(t).paths.filter((p) =>
      p.nodeIds.includes(block.target),
    );
    expect(
      blocked.every(
        (p) => p.status === "BLOCKED" && p.terminalId === block.target,
      ),
    ).toBe(true);
  });
  it("leaves path results unchanged under view collapse", () => {
    const t = createOverview(),
      before = analyzePaths(t);
    t.root.AttackTreeJSON.collapsed = ["loss", "processor"];
    expect(analyzePaths(t)).toEqual(before);
  });
  it("counts only terminal analytical paths in an unfinished tree", () => {
    const t = createOverview();
    t.nodes = t.nodes.filter((n) =>
      ["loss", "env", "imaging", "processor"].includes(n.id),
    );
    t.edges = t.edges.filter(
      (e) =>
        t.nodes.some((n) => n.id === e.source) &&
        t.nodes.some((n) => n.id === e.target),
    );
    const r = analyzePaths(t);
    expect(r.total).toBe("0");
    expect(r.rvCount).toBe("0");
  });
  it("rejects cyclic enumeration explicitly", () => {
    const t = createOverview();
    t.edges.push({
      ...t.edges[2]!,
      id: "cycle",
      source: "keytheft",
      target: "processor",
    });
    expect(() => analyzePaths(t)).toThrow(/cyclic/i);
  });
});

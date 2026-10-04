import { describe, expect, it } from "vitest";
import { createOverview } from "./examples";
import { makeEdge, validateGraph } from "../../src/tools/loss/domain/graph";
import { MemoryRepository, commitTree, parseTree } from "../../src/tools/loss/domain/storage";
import {
  defaultAnalysisProfile,
  defaultMetricRules,
  validateMetricConfiguration,
} from "../../src/tools/loss/domain/metrics";

describe("safe identifier handling on imports and commits", () => {
  for (const reserved of [
    "__proto__",
    "constructor",
    "toString",
    "hasOwnProperty",
    "prototype",
  ]) {
    it(`rejects node identity ${reserved} before object-backed graph traversal`, () => {
      const t = createOverview(),
        old = t.nodes.find((n) => n.id === "diagnostic")!.id;
      t.nodes.find((n) => n.id === old)!.id = reserved;
      t.edges
        .filter((e) => e.target === old)
        .forEach((e) => (e.target = reserved));
      expect(validateGraph(t).some((f) => f.code === "IDENTITY")).toBe(true);
      expect(() => parseTree(JSON.stringify(t))).toThrow(/Reserved/);
      const repo = new MemoryRepository(),
        saved = createOverview();
      repo.save(saved);
      expect(() => commitTree(t, repo)).toThrow(/Reserved/);
      expect(repo.load()).toEqual(saved);
    });
  }
  it("rejects reserved edge and saved-position keys without prototype mutation", () => {
    const t = createOverview();
    t.edges[0].id = "__proto__";
    expect(() => parseTree(JSON.stringify(t))).toThrow(/Reserved/);
    const t2 = createOverview();
    t2.root.AttackTreeJSON.positions = JSON.parse(
      '{"__proto__":{"x":1,"y":2}}',
    );
    expect(() => parseTree(JSON.stringify(t2))).toThrow(/Reserved/);
    expect(Object.prototype).not.toHaveProperty("x");
  });
  it("rejects metric identifiers that could resolve to inherited utility methods", () => {
    const rules = defaultMetricRules();
    rules.push({
      id: "toString",
      label: "Dangerous identity",
      unit: "rating",
      and: "SUM",
      or: "MIN",
      sand: "SUM",
      defaultValue: 0,
    });
    const p = defaultAnalysisProfile();
    p.resourceMetrics.push("toString");
    expect(validateMetricConfiguration(rules, p).join(" ")).toMatch(
      /safe alphanumeric/,
    );
  });
});

describe("typed relationship defaults [2.3]", () => {
  const cases: [string, string, string, string][] = [
    ["State", "Component", "OR", "state entity"],
    ["Component", "Attack", "OR", "entity attack"],
    ["Attack", "Attack", "OR", "attack refinement"],
    ["Attack", "Countermeasure", "AND", "protective dependency"],
    ["Countermeasure", "Asset", "AND", "derived scope"],
    ["Countermeasure", "Attack", "OR", "control defeat"],
    ["Loss", "State", "OR", "root state"],
    ["Loss", "Environment", "AND", "root context"],
  ];
  for (const [sourceType, targetType, expected, name] of cases)
    it(`defaults ${name} to ${expected}`, () => {
      const t = createOverview();
      t.nodes[0].type = sourceType as (typeof t.nodes)[number]["type"];
      t.nodes[1].type = targetType as (typeof t.nodes)[number]["type"];
      t.edges = [];
      expect(makeEdge(t, t.nodes[0].id, t.nodes[1].id).gate).toBe(expected);
    });
  it("preserves an existing sibling gate over the typed default", () => {
    const t = createOverview(),
      parent = t.nodes.find((n) => n.id === "processor")!,
      target = t.nodes.find((n) => n.id === "diagnostic")!;
    const existing = t.edges.find((e) => e.source === parent.id)!;
    existing.gate = "SAND";
    t.edges = [existing];
    expect(makeEdge(t, parent.id, target.id).gate).toBe("SAND");
  });
});

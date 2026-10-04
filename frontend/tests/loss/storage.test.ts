import { afterEach, describe, it, expect, vi } from "vitest";
import { createOverview, createEnvelope } from "./examples";
import {
  BrowserRepository,
  MemoryRepository,
  commitTree,
  parseTree,
} from "../../src/tools/loss/domain/storage";
import type { AttackTree, Repository } from "../../src/tools/loss/domain/types";
afterEach(() => vi.unstubAllGlobals());
describe("root-owned settings and adapter persistence [1.1,2.4,2.5,3.2,4.4–4.6]", () => {
  it.each([0, 2, 100])(
    "rejects non-Boolean AllowedRV sentinel %s on import",
    (value) => {
      const t = createOverview();
      t.edges.find((edge) => edge.allowedRV === 1)!.allowedRV = value;
      expect(() => parseTree(JSON.stringify(t))).toThrow("Boolean sentinel 1");
    },
  );
  it("round-trips semantic data, root rules, colors, card positions, collapse and camera", () => {
    const t = createOverview();
    t.root.AttackTreeJSON.positions.processor = { x: 42, y: 84 };
    t.root.AttackTreeJSON.viewport = { x: 20, y: -500, zoom: 0.5 };
    t.root.AttackTreeJSON.collapsed = ["processor"];
    t.root.AttackTreeJSON.selectedProperties = ["AttackTime"];
    t.root.AttackTreeJSON.nodeStyles.Attack.font = "#112233";
    t.root.AttackTreeJSON.nodeStyles.Attack.box = "#223344";
    t.root.AttackTreeJSON.nodeStyles.Attack.line = "#334455";
    t.root.AttackTreeJSON.nodeStyles.Attack.border = "#445566";
    t.root.MetricDefinitionsJSON[0]!.threshold = 12345;
    t.root.MetricDefinitionsJSON[0]!.thresholdDirection = "ABOVE";
    expect(parseTree(JSON.stringify(t))).toEqual(t);
  });
  it("keeps memory-adapter copies isolated from draft mutation", () => {
    const repo = new MemoryRepository(),
      t = createOverview();
    repo.save(t);
    t.nodes[0]!.label = "draft";
    expect(repo.load()!.nodes[0]!.label).not.toBe("draft");
    const loaded = repo.load()!;
    loaded.nodes[0]!.label = "modified-loaded";
    expect(repo.load()!.nodes[0]!.label).not.toBe("modified-loaded");
  });
  it("increments the version exactly once per successful atomic Commit", () => {
    const repo = new MemoryRepository(),
      draft = createOverview();
    repo.save(draft);
    draft.nodes[0]!.label = "Reviewed Loss";
    const result = commitTree(draft, repo);
    expect(result.revision).toBe(draft.revision + 1);
    expect(repo.load()).toEqual(result);
    expect(draft.revision).toBe(1);
  });
  it("retains committed state and draft after validation or storage failure", () => {
    const repo = new MemoryRepository(),
      original = createOverview();
    repo.save(original);
    const bad = structuredClone(original);
    bad.edges[0]!.target = "missing";
    expect(() => commitTree(bad, repo)).toThrow();
    expect(repo.load()).toEqual(original);
    const unavailable: Repository = {
      load: () => structuredClone(original),
      save: () => {
        throw new Error("quota exceeded");
      },
    };
    const draft = structuredClone(original);
    draft.nodes[0]!.label = "Unsaved review";
    expect(() => commitTree(draft, unavailable)).toThrow("quota exceeded");
    expect(unavailable.load()).toEqual(original);
    expect(draft.nodes[0]!.label).toBe("Unsaved review");
    expect(draft.revision).toBe(original.revision);
  });
  it("writes browser data only under the prototype namespace", () => {
    const entries = new Map<string, string>([
      ["sstpa.production", "untouched"],
    ]);
    const storage = {
      getItem: vi.fn((k: string) => entries.get(k) ?? null),
      setItem: vi.fn((k: string, v: string) => entries.set(k, v)),
    };
    vi.stubGlobal("localStorage", storage);
    const repo = new BrowserRepository();
    expect(repo.load()).toBeNull();
    repo.save(createOverview());
    expect(repo.load()!.name).toContain("FireSat");
    expect(entries.get("sstpa.production")).toBe("untouched");
    expect([...entries.keys()].filter((k) => k !== "sstpa.production")).toEqual(
      ["sstpa.attack-tree.standalone.v1"],
    );
  });
});
describe("defensive imports [2.1,3.5,5.2]", () => {
  const variants: [string, (t: AttackTree) => void][] = [
    [
      "wrong schema",
      (t) => {
        (t as unknown as { schemaVersion: number }).schemaVersion = 2;
      },
    ],
    [
      "invalid color",
      (t) => {
        t.root.AttackTreeJSON.nodeStyles.Attack.box = "red";
      },
    ],
    [
      "camera bounds",
      (t) => {
        t.root.AttackTreeJSON.viewport.zoom = 0;
      },
    ],
    [
      "duplicate metric",
      (t) => {
        t.root.MetricDefinitionsJSON.push({
          ...t.root.MetricDefinitionsJSON[0]!,
        });
      },
    ],
    [
      "negative leaf cost",
      (t) => {
        t.nodes.find((n) => n.id === "diagnostic")!.metrics.AttackCost = -1;
      },
    ],
    [
      "invalid probability",
      (t) => {
        t.nodes.find((n) => n.id === "diagnostic")!.metrics.AttackProbability =
          1.1;
      },
    ],
    [
      "invalid utility",
      (t) => {
        t.root.AnalysisProfileJSON.utilities.AttackCost = [
          { value: 2, utility: 1 },
          { value: 1, utility: 0 },
        ];
      },
    ],
    [
      "invalid actor weights",
      (t) => {
        t.root.AnalysisProfileJSON.benefitWeights.AttackerMoneyGain = -1;
      },
    ],
    [
      "invalid opportunity",
      (t) => {
        t.root.AnalysisProfileJSON.targets = 0;
      },
    ],
  ];
  for (const [name, mutate] of variants)
    it(`rejects ${name}`, () => {
      const t = createOverview();
      mutate(t);
      expect(() => parseTree(JSON.stringify(t))).toThrow();
    });
  it("rejects one-over node import before replacing the current tree", () => {
    expect(() => parseTree(JSON.stringify(createEnvelope(1001)))).toThrow(
      /1000.*Decompose/,
    );
  });
  it("preserves unavailable leaf values as null instead of fabricating zero", () => {
    const t = createOverview();
    t.nodes.find((n) => n.id === "diagnostic")!.metrics.AttackCost = null;
    expect(
      parseTree(JSON.stringify(t)).nodes.find((n) => n.id === "diagnostic")!
        .metrics.AttackCost,
    ).toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import {
  createOverview,
  createDeep,
  createEnvelope,
  createSequence,
} from "./examples";
import {
  capacityFindings,
  descendants,
  graphStats,
  indexGraph,
  normalizeSequences,
  pruneBranch,
  validateGraph,
  visibleNodes,
} from "../../src/tools/loss/domain/graph";
import type { AttackTree } from "../../src/tools/loss/domain/types";
const errors = (t: AttackTree) =>
  validateGraph(t).filter((f) => f.severity === "error");
const clone = <T>(x: T): T => structuredClone(x);

describe("typed rooted DAG validity [2–2.3,2.7]", () => {
  const mutations: [string, (t: AttackTree) => void, string][] = [
    [
      "duplicate identity",
      (t) => {
        t.nodes.push(clone(t.nodes[2]!));
      },
      "IDENTITY",
    ],
    [
      "duplicate HID",
      (t) => {
        t.nodes[3]!.hid = t.nodes[2]!.hid;
      },
      "IDENTITY",
    ],
    [
      "blank name",
      (t) => {
        t.nodes[2]!.label = " ";
      },
      "IDENTITY",
    ],
    [
      "duplicate edge",
      (t) => {
        t.edges.push({ ...t.edges[1]!, id: "different-id" });
      },
      "IDENTITY",
    ],
    [
      "dangling endpoint",
      (t) => {
        t.edges[2]!.target = "missing";
      },
      "DANGLING",
    ],
    [
      "second root",
      (t) => {
        t.nodes.push({ ...t.nodes[0]!, id: "another", hid: "DEMO_ANOTHER" });
      },
      "ROOT",
    ],
    [
      "incoming root",
      (t) => {
        t.edges.push({
          ...t.edges[0]!,
          id: "root-target",
          source: "processor",
          target: "loss",
        });
      },
      "ROOT",
    ],
    [
      "cross-Loss edge",
      (t) => {
        t.edges[2]!.lossId = "wrong-loss";
      },
      "SCOPE",
    ],
    [
      "cycle",
      (t) => {
        t.edges.push({
          ...t.edges[0]!,
          id: "cycle",
          source: "keytheft",
          target: "firmware",
        });
      },
      "CYCLE",
    ],
    [
      "unreachable node",
      (t) => {
        t.nodes.push({ ...t.nodes[2]!, id: "orphan", hid: "DEMO_ORPHAN" });
      },
      "REACHABILITY",
    ],
    [
      "illegal transition",
      (t) => {
        t.edges.push({
          ...t.edges[0]!,
          id: "illegal",
          source: "imaging",
          target: "keytheft",
        });
      },
      "TYPE",
    ],
  ];
  for (const [name, mutate, code] of mutations)
    it(`rejects ${name}`, () => {
      const t = createOverview();
      mutate(t);
      expect(errors(t).map((f) => f.code)).toContain(code);
    });
  it("checks the owning sibling gate and does not mix root Environment into it", () => {
    const t = createOverview();
    expect(errors(t)).toEqual([]);
    t.edges.find((e) => e.source === "processor")!.gate = "AND";
    expect(errors(t).map((f) => f.code)).toContain("GATE");
  });
  it("accepts contiguous zero-based SAND and rejects duplicates, gaps and non-SAND sequences", () => {
    const t = createSequence();
    expect(errors(t)).toEqual([]);
    const siblings = t.edges.filter(
      (e) => e.source === "loss" && e.target !== "env",
    );
    siblings[1]!.sequence = 0;
    expect(errors(t).map((f) => f.code)).toContain("SEQUENCE");
    siblings[1]!.sequence = 2;
    expect(errors(t).map((f) => f.code)).toContain("SEQUENCE");
    normalizeSequences(t);
    expect(errors(t)).toEqual([]);
    siblings[0]!.gate = "OR";
    siblings[1]!.gate = "OR";
    expect(errors(t).map((f) => f.code)).toContain("SEQUENCE");
  });
  it("uses longest root path for shared nodes rather than first/shallowest occurrence", () => {
    const t = createDeep();
    const d8 = t.nodes.find((n) => n.id === "deep-8")!;
    const before = graphStats(t).depths[d8.id];
    t.edges.push({
      ...t.edges[1]!,
      id: "shortcut",
      source: "deep-3",
      target: d8.id,
    });
    expect(graphStats(t).depths[d8.id]).toBe(before);
    expect(graphStats(t).depth).toBe(20);
  });
  it("prunes unreachable branches while preserving shared nodes reached elsewhere", () => {
    const t = createOverview();
    pruneBranch(t, "standby");
    expect(t.nodes.some((n) => n.id === "processor")).toBe(true);
    expect(t.nodes.some((n) => n.id === "downlink")).toBe(false);
    expect(errors(t)).toEqual([]);
    expect(() => pruneBranch(t, "loss")).toThrow();
  });
});

describe("edge decisions and folded projection [2.6,4.7]", () => {
  it("requires reasons and valid terminal targets for each decision", () => {
    const t = createOverview();
    const tailor = t.edges.find((e) => e.tailoredOut)!;
    tailor.tailoredReason = " ";
    expect(errors(t).map((f) => f.code)).toContain("REASON");
    tailor.tailoredReason = "A valid local scope reason";
    const block = t.edges.find((e) => e.completeBlock)!;
    block.blockReason = "";
    expect(errors(t).map((f) => f.code)).toContain("BLOCK");
    block.blockReason = "A reviewed absolute barrier";
    const allowed = t.edges.find((e) => e.allowedRV !== null)!;
    allowed.allowedReason = "x".repeat(19);
    expect(errors(t).map((f) => f.code)).toContain("RV");
    allowed.allowedReason = "x".repeat(20);
    expect(errors(t)).toEqual([]);
    allowed.target = "processor";
    expect(errors(t).map((f) => f.code)).toContain("RV");
  });
  it("requires clearing stale decision reasons on revocation", () => {
    const t = createOverview();
    t.edges.find((e) => e.tailoredOut)!.tailoredOut = false;
    expect(errors(t).map((f) => f.code)).toContain("REASON");
  });
  it("hides only descendants lacking an expanded alternative parent", () => {
    const t = createOverview();
    const before = JSON.stringify({ nodes: t.nodes, edges: t.edges });
    t.root.AttackTreeJSON.collapsed = ["standby"];
    const visible = visibleNodes(t);
    expect(visible.has("processor")).toBe(true);
    expect(visible.has("downlink")).toBe(false);
    expect(visible.has("standby")).toBe(true);
    expect(JSON.stringify({ nodes: t.nodes, edges: t.edges })).toBe(before);
    t.root.AttackTreeJSON.collapsed = [];
    expect(visibleNodes(t).size).toBe(t.nodes.length);
  });
  it("expands a highlighted route independently of saved folded state", () => {
    const t = createOverview();
    t.root.AttackTreeJSON.collapsed = ["imaging", "standby"];
    expect(visibleNodes(t).has("keytheft")).toBe(false);
    expect(
      visibleNodes(t, [
        "loss",
        "imaging",
        "processor",
        "firmware",
        "signed",
        "keytheft",
      ]).has("keytheft"),
    ).toBe(true);
    expect(t.root.AttackTreeJSON.collapsed).toEqual(["imaging", "standby"]);
  });
  it("derives descendants safely and indexes each canonical node once", () => {
    const t = createOverview();
    expect(indexGraph(t).incoming.get("processor")).toHaveLength(2);
    expect(descendants(t, "processor").has("keytheft")).toBe(true);
    expect(indexGraph(t).nodes.size).toBe(t.nodes.length);
  });
});

describe("finite graph budgets [5–5.2]", () => {
  it("starts node warnings at exactly 800, including collapsed and tailored data", () => {
    const a = createEnvelope(799),
      b = createEnvelope(800);
    const nodeWarnings = (t: AttackTree) =>
      capacityFindings(t).filter((f) => f.message.startsWith("nodes:"));
    expect(nodeWarnings(a)).toEqual([]);
    expect(nodeWarnings(b)).toHaveLength(1);
    b.root.AttackTreeJSON.collapsed = ["loss"];
    b.edges.forEach((e) => {
      e.tailoredOut = true;
      e.tailoredReason = "Stress fixture hidden for review";
    });
    expect(graphStats(b).nodes).toBe(800);
    expect(nodeWarnings(b)).toHaveLength(1);
  });
  it("starts depth warning at 16 and width warning at 40", () => {
    const d15 = createEnvelope(31, 15, 2),
      d16 = createEnvelope(33, 16, 2);
    expect(graphStats(d15).depth).toBe(15);
    expect(graphStats(d16).depth).toBe(16);
    expect(
      capacityFindings(d15).some((f) => f.message.startsWith("depth:")),
    ).toBe(false);
    expect(
      capacityFindings(d16).some((f) => f.message.startsWith("depth:")),
    ).toBe(true);
    const w39 = createEnvelope(118, 3, 39),
      w40 = createEnvelope(121, 3, 40);
    expect(
      capacityFindings(w39).some((f) => f.message.startsWith("width:")),
    ).toBe(false);
    expect(
      capacityFindings(w40).some((f) => f.message.startsWith("width:")),
    ).toBe(true);
  });
  it("allows each hard boundary and rejects one-over with decomposition recommendation", () => {
    expect(errors(createEnvelope())).toEqual([]);
    for (const t of [
      createEnvelope(1001),
      createEnvelope(43, 21, 2),
      createEnvelope(154, 3, 51),
    ]) {
      const f = capacityFindings(t).filter((f) => f.code === "LIMIT");
      expect(f.length).toBeGreaterThan(0);
      expect(
        f.every((x) =>
          x.message.includes("Decompose the system to create smaller trees."),
        ),
      ).toBe(true);
    }
  });
});

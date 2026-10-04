import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { layoutScene, layoutTree, nodeSize } from "../../src/tools/loss/domain/layout";
import {
  NODE_TYPES,
  type AttackTree,
  type Point,
  type TreeEdge,
  type TreeNode,
} from "../../src/tools/loss/domain/types";

function fixture(widths: number[]): AttackTree {
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  let previous = ["n0"];
  const addNode = (id: string) =>
    nodes.push({
      id,
      hid: id,
      label: `FireSat ${id}`,
      type: id === "n0" ? "Loss" : "Attack",
      description: "Synthetic qualification fixture",
      provenance: "Prototype illustration",
      metrics: {},
    });
  addNode("n0");
  for (const width of widths) {
    const current: string[] = [];
    for (let j = 0; j < width; j++) {
      const id = `n${nodes.length}`;
      addNode(id);
      current.push(id);
      edges.push({
        id: `e${edges.length}`,
        source: previous[j % previous.length],
        target: id,
        lossId: "n0",
        gate: "AND",
        sequence: null,
        tailoredOut: false,
        tailoredReason: "",
        completeBlock: false,
        blockReason: "",
        allowedRV: null,
        allowedReason: "",
      });
    }
    previous = current;
  }
  return {
    schemaVersion: 1,
    id: "layout-fixture",
    revision: 1,
    createdAt: "2026-10-04",
    updatedAt: "2026-10-04",
    name: "FireSat layout qualification",
    rootId: "n0",
    nodes,
    edges,
    root: {
      MetricDefinitionsJSON: [],
      asset: "Payload",
      environment: "Orbit",
      soi: "FireSat",
      criticality: "High",
      assurance: "Availability",
      AttackTreeJSON: {
        positions: {},
        collapsed: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        direction: "DOWN",
        theme: "parchment",
        selectedProperties: ["Cost", "Probability"],
        nodeStyles: Object.fromEntries(
          NODE_TYPES.map((type) => [
            type,
            {
              font: "#000000",
              box: "#ffffff",
              line: "#333333",
              border: "#333333",
            },
          ]),
        ) as AttackTree["root"]["AttackTreeJSON"]["nodeStyles"],
      },
      AnalysisProfileJSON: {
        mode: "scenario",
        scenarioCap: 10000,
        utilities: {},
        benefitWeights: {},
        painWeights: {},
        detrimentWeights: {},
        resourceMetrics: [],
        booleanCapabilities: {},
        encountersPerYear: 1,
        years: 1,
        riskThreshold: 0.1,
        targets: 1,
        adversaryPopulation: 1,
        recoveryHours: 1,
        attackThreads: 1,
        dutyCycle: 1,
        encounterMode: "fixed",
        independentRandomEvents: true,
        actorName: "Test",
        victimName: "FireSat",
      },
    },
  };
}

function assertGeometry(tree: AttackTree, positions: Record<string, Point>) {
  const points = Object.values(positions);
  expect(points).toHaveLength(tree.nodes.length);
  const size = nodeSize(tree);
  for (let i = 0; i < points.length; i++) {
    expect(Number.isFinite(points[i].x) && Number.isFinite(points[i].y)).toBe(
      true,
    );
    for (let j = i + 1; j < points.length; j++) {
      const dx = Math.abs(points[i].x - points[j].x);
      const dy = Math.abs(points[i].y - points[j].y);
      // Strict interior overlap; touching would be acceptable but ELK provides spacing.
      if (dx < size.width - 0.01 && dy < size.height - 0.01)
        throw new Error(`Overlapping cards ${i} and ${j}`);
    }
  }
  for (const edge of tree.edges) {
    expect(
      positions[edge.target][
        tree.root.AttackTreeJSON.direction === "DOWN" ? "y" : "x"
      ],
    ).toBeGreaterThan(
      positions[edge.source][
        tree.root.AttackTreeJSON.direction === "DOWN" ? "y" : "x"
      ],
    );
  }
}

describe("ELK layout projection", () => {
  it("uses the selected-property card height and changes direction without model mutations", async () => {
    const tree = fixture([3, 6]);
    expect(nodeSize(tree)).toEqual({ width: 260, height: 162 });
    const before = JSON.stringify(tree);
    const down = await layoutTree(tree);
    assertGeometry(tree, down);
    expect(JSON.stringify(tree)).toBe(before);
    tree.root.AttackTreeJSON.direction = "RIGHT";
    assertGeometry(tree, await layoutTree(tree));
  });

  it("allows full identity rows alongside metrics without overlapping cards", async () => {
    const tree = fixture([3, 6]);
    tree.root.AttackTreeJSON.selectedNodeProperties = [
      "nodeId",
      "authoritativeUuid",
      "provenance",
    ];
    expect(nodeSize(tree)).toEqual({ width: 260, height: 272 });
    const before = JSON.stringify(tree);
    assertGeometry(tree, await layoutTree(tree));
    expect(JSON.stringify(tree)).toBe(before);
  });

  it("routes orthogonal connectors and orders SAND siblings by zero-based sequence", async () => {
    const tree = fixture([3]);
    tree.edges.forEach((edge, index) => {
      edge.gate = "SAND";
      edge.sequence = 2 - index;
    });
    const scene = await layoutScene(tree);
    const ordered = [...tree.edges].sort((a, b) => a.sequence! - b.sequence!);
    expect(scene.positions[ordered[0].target].x).toBeLessThan(
      scene.positions[ordered[1].target].x,
    );
    expect(scene.positions[ordered[1].target].x).toBeLessThan(
      scene.positions[ordered[2].target].x,
    );
    for (const route of Object.values(scene.routes)) {
      for (let i = 1; i < route.length; i++)
        expect(
          route[i].x === route[i - 1].x || route[i].y === route[i - 1].y,
        ).toBe(true);
    }
  });

  it("projects only visible nodes, accepts an empty view, and preserves repeatability", async () => {
    const tree = fixture([3, 6]);
    const visible = new Set(["n0", "n1"]);
    const positions = await layoutTree(tree, visible);
    expect(Object.keys(positions)).toEqual(["n0", "n1"]);
    expect(await layoutTree(tree, visible)).toEqual(positions);
    expect(await layoutTree(tree, new Set())).toEqual({});
  });

  it("lays out one shared semantic node beneath both parents without duplication or overlap", async () => {
    const tree = fixture([2, 2]);
    tree.edges.push({
      ...tree.edges[2],
      id: "shared-edge",
      source: "n2",
      target: "n3",
    });
    const scene = await layoutScene(tree);
    assertGeometry(tree, scene.positions);
    expect(Object.keys(scene.positions)).toHaveLength(5);
    expect(scene.routes["shared-edge"]).toBeDefined();
  });

  it("qualifies 25, 100, 1000 nodes and depth 20/width 50 with finite nonoverlapping cards", async () => {
    const cases = [
      { name: "Typical 25 nodes", widths: [6, 18] },
      { name: "Typical 100 nodes", widths: [9, 45, 45] },
      { name: "Depth 20", widths: Array(20).fill(1) as number[] },
      { name: "Width 50", widths: [50] },
      {
        name: "1000 nodes / depth 20 / width 50",
        widths: [...Array(19).fill(50), 49] as number[],
      },
    ];
    const results = [];
    for (const example of cases) {
      const tree = fixture(example.widths);
      const start = performance.now();
      const positions = await layoutTree(tree);
      const elapsedMs = performance.now() - start;
      assertGeometry(tree, positions);
      expect(elapsedMs).toBeLessThan(30_000);
      results.push({
        name: example.name,
        nodes: tree.nodes.length,
        depth: example.widths.length,
        width: Math.max(...example.widths),
        elapsedMs: Math.round(elapsedMs),
        nonoverlapping: true,
      });
    }
    mkdirSync("work", { recursive: true });
    writeFileSync(
      "work/layout-performance.json",
      JSON.stringify(
        {
          engine: "elkjs 0.12.0",
          adapter:
            "Node bundled engine (browser worker separately exercised by UI verification)",
          node: process.version,
          checkedAt: new Date().toISOString(),
          results,
        },
        null,
        2,
      ) + "\n",
    );
  }, 60_000);
});

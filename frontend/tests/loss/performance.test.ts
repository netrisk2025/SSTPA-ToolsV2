import { expect, it } from "vitest";
import { cpus, platform, release, arch, totalmem } from "node:os";
import { performance } from "node:perf_hooks";
import { mkdirSync, writeFileSync } from "node:fs";
import { EXAMPLES, createEnvelope } from "./examples";
import { graphStats, validateGraph } from "../../src/tools/loss/domain/graph";
import { evaluateMetrics } from "../../src/tools/loss/domain/metrics";
import { analyzePaths } from "../../src/tools/loss/domain/paths";
import { layoutTree, nodeSize } from "../../src/tools/loss/domain/layout";
import type { AttackTree, Point } from "../../src/tools/loss/domain/types";

function geometry(tree: AttackTree, positions: Record<string, Point>) {
  let overlaps = 0;
  let upwardEdges = 0;
  const { width, height } = nodeSize(tree);
  const values = Object.values(positions);
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (
        Math.abs(values[i].x - values[j].x) < width - 0.01 &&
        Math.abs(values[i].y - values[j].y) < height - 0.01
      )
        overlaps++;
    }
  }
  const axis = tree.root.AttackTreeJSON.direction === "DOWN" ? "y" : "x";
  for (const edge of tree.edges)
    if (positions[edge.target][axis] <= positions[edge.source][axis])
      upwardEdges++;
  return {
    overlaps,
    upwardEdges,
    finite: values.every(
      ({ x, y }) => Number.isFinite(x) && Number.isFinite(y),
    ),
    positionedNodes: values.length,
  };
}
const elapsed = (since: number) =>
  Math.round((performance.now() - since) * 1000) / 1000;

it("records complete cold/warm example and maximum-envelope measurements without overstating analytical completeness", async () => {
  const cases = [
    ...EXAMPLES,
    {
      id: "qualification-100",
      title: "100-node qualification",
      create: () => createEnvelope(100, 3, 50),
    },
  ];
  const results = [];
  for (const entry of cases) {
    const tree = entry.create();
    const stats = graphStats(tree);
    const before = JSON.stringify(tree);
    const samples = [];
    for (const phase of ["cold", "warm"]) {
      let start = performance.now();
      const positions = await layoutTree(tree);
      const layoutMs = elapsed(start);
      const shape = geometry(tree, positions);
      start = performance.now();
      const paths = analyzePaths(tree);
      const pathsMs = elapsed(start);
      start = performance.now();
      const metrics = evaluateMetrics(tree);
      const metricsMs = elapsed(start);
      samples.push({
        phase,
        layoutMs,
        pathsMs,
        metricsMs,
        ...shape,
        exactPaths: paths.total,
        materializedPaths: paths.paths.length,
        truncatedPaths: paths.truncated,
        unaddressedRVs: paths.rvCount,
        metricComplete: metrics.complete,
        rootStatus: metrics.root.status,
        scenarioCount: metrics.scenarioCount,
        metricWarnings: metrics.warnings,
      });
      expect(shape).toEqual({
        overlaps: 0,
        upwardEdges: 0,
        finite: true,
        positionedNodes: tree.nodes.length,
      });
      expect(layoutMs).toBeLessThan(30_000);
      expect(
        Object.values(metrics.root.values).every(
          (v) => v === null || Number.isFinite(v),
        ),
      ).toBe(true);
    }
    expect(JSON.stringify(tree)).toBe(before);
    results.push({
      id: entry.id,
      title: entry.title,
      nodes: stats.nodes,
      edges: tree.edges.length,
      depth: stats.depth,
      width: stats.width,
      graphFindings: validateGraph(tree),
      samples,
    });
  }
  const report = {
    schema: "attack-tree-performance/1.0",
    measuredAt: new Date().toISOString(),
    environment: {
      runtime: process.version,
      platform: platform(),
      release: release(),
      architecture: arch(),
      cpu: cpus()[0]?.model,
      logicalCpus: cpus().length,
      memoryBytes: totalmem(),
    },
    engine: "elkjs 0.12.0",
    adapter:
      "Node bundled adapter; browser worker responsiveness is verified separately",
    sampling:
      "One first (cold) and one repeated (warm) invocation per fixture in the same process. Engine construction occurs on each call; cold is not an OS-cache-cleared or fresh-browser measurement. Timings exclude geometry assertions and UI rendering. These observations are not percentile/frame-rate/production guarantees.",
    result:
      "Completed all samples; geometry assertions passed. metricComplete and rootStatus are reported per sample and are not replaced by a blanket analytical pass.",
    results,
  };
  mkdirSync("docs", { recursive: true });
  writeFileSync(
    "docs/Performance-Results.json",
    JSON.stringify(report, null, 2) + "\n",
  );
}, 120_000);

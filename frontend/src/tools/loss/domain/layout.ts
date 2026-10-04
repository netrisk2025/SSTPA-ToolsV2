import type { ElkNode } from "elkjs/lib/elk-api.js";
import { createLayoutEngine as createEngine } from "../../layoutEngine";
import type { AttackTree, Point, TreeEdge } from "./types";
import {
  selectedNodePropertyKeys,
  selectedMetricPropertyKeys,
} from "./identity";

/** ELK is unmodified; its corresponding sources and EPL notices ship in /licenses/. */
export const LAYOUT_TIMEOUT_MS = 30_000;

export function nodeSize(tree: AttackTree): { width: number; height: number } {
  return {
    width: 260,
    height:
      118 +
      selectedMetricPropertyKeys(tree.root.AttackTreeJSON).length * 22 +
      selectedNodePropertyKeys(tree.root.AttackTreeJSON).reduce(
        (height, key) => height + (key === "provenance" ? 22 : 44),
        0,
      ),
  };
}

function stableChildren(
  tree: AttackTree,
  nodes: Set<string>,
  edges: TreeEdge[],
): string[] {
  const outgoing = new Map<string, TreeEdge[]>();
  for (const edge of edges) {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge);
    outgoing.set(edge.source, list);
  }
  for (const list of outgoing.values()) {
    list.sort((a, b) =>
      a.gate === "SAND" && b.gate === "SAND"
        ? (a.sequence ?? 0) - (b.sequence ?? 0)
        : 0,
    );
  }
  const result: string[] = [];
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (!nodes.has(id) || visited.has(id)) return;
    visited.add(id);
    result.push(id);
    for (const edge of outgoing.get(id) ?? []) visit(edge.target);
  };
  visit(tree.rootId);
  // Also lay out visible disconnected validation nodes so the UI can show the issue.
  for (const node of tree.nodes) visit(node.id);
  return result;
}

export interface LayoutScene {
  positions: Record<string, Point>;
  routes: Record<string, Point[]>;
}

/** Layout is a pure projection: it never modifies model values, gates, IDs or saved view state. */
export async function layoutScene(
  tree: AttackTree,
  visibleIds?: Set<string>,
): Promise<LayoutScene> {
  const included = new Set(
    tree.nodes
      .filter((node) => !visibleIds || visibleIds.has(node.id))
      .map((node) => node.id),
  );
  if (!included.size) return { positions: {}, routes: {} };
  const edges = tree.edges.filter(
    (edge) => included.has(edge.source) && included.has(edge.target),
  );
  const order = stableChildren(tree, included, edges);
  const indices = new Map(order.map((id, index) => [id, index]));
  const size = nodeSize(tree);
  const graph: ElkNode = {
    id: `${tree.id}:canvas`,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": tree.root.AttackTreeJSON.direction,
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.padding": "[top=40,left=40,bottom=40,right=40]",
      "elk.spacing.nodeNode": "40",
      "elk.spacing.edgeNode": "24",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.randomSeed": "1",
    },
    children: order.map((id) => ({ id, ...size })),
    edges: [...edges]
      .sort(
        (a, b) =>
          indices.get(a.source)! - indices.get(b.source)! ||
          (a.gate === "SAND" && b.gate === "SAND"
            ? (a.sequence ?? 0) - (b.sequence ?? 0)
            : 0),
      )
      .map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })),
  };
  const { engine, dispose } = await createEngine();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      engine.layout(graph),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Layout exceeded 30 seconds. Decompose the system into smaller trees.",
              ),
            ),
          LAYOUT_TIMEOUT_MS,
        );
      }),
    ]);
    const positions: Record<string, Point> = {};
    for (const node of result.children ?? []) {
      if (!Number.isFinite(node.x) || !Number.isFinite(node.y))
        throw new Error(`Layout returned an invalid position for ${node.id}.`);
      positions[node.id] = { x: node.x!, y: node.y! };
    }
    const routes: Record<string, Point[]> = {};
    for (const edge of result.edges ?? []) {
      const section = edge.sections?.[0];
      if (section)
        routes[edge.id] = [
          section.startPoint,
          ...(section.bendPoints ?? []),
          section.endPoint,
        ];
    }
    return { positions, routes };
  } finally {
    clearTimeout(timer);
    dispose();
  }
}

export async function layoutTree(
  tree: AttackTree,
  visibleIds?: Set<string>,
): Promise<Record<string, Point>> {
  return (await layoutScene(tree, visibleIds)).positions;
}

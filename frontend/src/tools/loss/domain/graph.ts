import {
  LIMITS,
  NODE_TYPES,
  type AttackTree,
  type NodeType,
  type TreeEdge,
} from "./types";
export const UNSAFE_IDENTITIES = new Set([
  ...Object.getOwnPropertyNames(Object.prototype),
  "prototype",
]);
export const isUnsafeIdentity = (value: string) => UNSAFE_IDENTITIES.has(value);
export interface Finding {
  code: string;
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
  edgeId?: string;
}
export const allowedChildren: Record<NodeType, NodeType[]> = {
  Loss: ["Environment", "State"],
  Environment: [],
  State: ["Interface", "SystemFunction", "Component"],
  Interface: ["Attack"],
  SystemFunction: ["Attack"],
  Component: ["Attack"],
  Attack: ["Attack", "Countermeasure"],
  Countermeasure: ["Attack", "Asset"],
  Asset: [],
};
export const RECOMMENDATION = "Decompose the system to create smaller trees.";
export function indexGraph(tree: AttackTree) {
  const nodes = new Map(tree.nodes.map((n) => [n.id, n]));
  const outgoing = new Map(tree.nodes.map((n) => [n.id, [] as TreeEdge[]]));
  const incoming = new Map(tree.nodes.map((n) => [n.id, [] as TreeEdge[]]));
  for (const e of tree.edges) {
    outgoing.get(e.source)?.push(e);
    incoming.get(e.target)?.push(e);
  }
  for (const es of outgoing.values())
    es.sort(
      (a, b) =>
        (a.sequence ?? 0) - (b.sequence ?? 0) || a.id.localeCompare(b.id),
    );
  return { nodes, outgoing, incoming };
}
/** Kahn traversal computes longest-path depth, independent of rendering and tailoring. */
export function graphStats(tree: AttackTree) {
  const { outgoing, incoming } = indexGraph(tree);
  const indegree = new Map([...incoming].map(([id, es]) => [id, es.length]));
  const queue = tree.nodes.filter((n) => !indegree.get(n.id)).map((n) => n.id);
  const depths: Record<string, number> = {};
  depths[tree.rootId] = 0;
  for (let i = 0; i < queue.length; i++)
    for (const e of outgoing.get(queue[i]) ?? []) {
      if (depths[e.source] !== undefined)
        depths[e.target] = Math.max(
          depths[e.target] ?? 0,
          depths[e.source] + 1,
        );
      const d = (indegree.get(e.target) ?? 1) - 1;
      indegree.set(e.target, d);
      if (!d) queue.push(e.target);
    }
  const ranks: Record<number, number> = {};
  for (const d of Object.values(depths)) ranks[d] = (ranks[d] ?? 0) + 1;
  return {
    nodes: tree.nodes.length,
    depth: Math.max(0, ...Object.values(depths)),
    width: Math.max(0, ...Object.values(ranks)),
    depths,
    cyclic: queue.length !== tree.nodes.length,
  };
}
export function capacityFindings(tree: AttackTree): Finding[] {
  const s = graphStats(tree);
  return (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).flatMap<Finding>(
    (k) =>
      s[k] > LIMITS[k]
        ? [
            {
              code: "LIMIT",
              severity: "error",
              message: `${k}: ${s[k]} exceeds limit ${LIMITS[k]}. ${RECOMMENDATION}`,
            },
          ]
        : s[k] >= LIMITS[k] * 0.8
          ? [
              {
                code: "NEAR_LIMIT",
                severity: "warning",
                message: `${k}: ${s[k]} / ${LIMITS[k]} (80% or more). ${RECOMMENDATION}`,
              },
            ]
          : [],
  );
}
export function validateGraph(tree: AttackTree): Finding[] {
  const f: Finding[] = [];
  const add = (
    code: string,
    message: string,
    nodeId?: string,
    edgeId?: string,
  ) => f.push({ code, message, nodeId, edgeId, severity: "error" });
  if (
    isUnsafeIdentity(tree.rootId) ||
    tree.nodes.some((n) => isUnsafeIdentity(n.id)) ||
    tree.edges.some(
      (e) =>
        isUnsafeIdentity(e.id) ||
        isUnsafeIdentity(e.source) ||
        isUnsafeIdentity(e.target),
    )
  ) {
    add(
      "IDENTITY",
      "Reserved object-property names cannot be node or relationship identities.",
    );
    return f;
  }
  const { nodes, outgoing, incoming } = indexGraph(tree);
  const stats = graphStats(tree);
  if (nodes.size !== tree.nodes.length)
    add("IDENTITY", "Duplicate node identity.");
  if (new Set(tree.nodes.map((n) => n.hid)).size !== tree.nodes.length)
    add("IDENTITY", "Duplicate node HID.");
  if (
    tree.nodes.filter((n) => n.type === "Loss").length !== 1 ||
    nodes.get(tree.rootId)?.type !== "Loss"
  )
    add("ROOT", "Exactly one Loss root is required.");
  if (incoming.get(tree.rootId)?.length)
    add("ROOT", "Root cannot have an incoming relationship.");
  if (stats.cyclic) add("CYCLE", "Cycles are not allowed.");
  const edgeIds = new Set<string>(),
    pairs = new Set<string>();
  for (const n of tree.nodes) {
    if (!n.id.trim() || !n.hid.trim() || !n.label.trim())
      add("IDENTITY", "Node ID, HID and name must be nonblank.", n.id);
    if (!NODE_TYPES.includes(n.type)) add("TYPE", "Unknown node type.", n.id);
    if (stats.depths[n.id] === undefined)
      add("REACHABILITY", "Node is not reachable from the Loss root.", n.id);
    if (n.type === "Asset" && !n.derived)
      add("DERIVED", "Asset terminals must be marked derived.", n.id);
    const active = (outgoing.get(n.id) ?? []).filter(
      (e) => !e.tailoredOut && nodes.get(e.target)?.type !== "Environment",
    );
    const gates = new Set(active.map((e) => e.gate));
    if (gates.size > 1)
      add("GATE", "Active sibling relationships must use one operator.", n.id);
    if (gates.has("SAND") && active.some((e, i) => e.sequence !== i))
      add("SEQUENCE", "SAND sequence must be contiguous from zero.", n.id);
    if (n.id === tree.rootId && active.some((e) => e.gate === "AND"))
      add("GATE", "Root State group uses OR or SAND.", n.id);
    if (
      !active.length &&
      !["Environment", "Attack", "Asset"].includes(n.type) &&
      !(
        n.type === "Countermeasure" &&
        (incoming.get(n.id)?.length ?? 0) > 0 &&
        incoming.get(n.id)!.every((e) => e.completeBlock)
      )
    )
      f.push({
        code: "INCOMPLETE_BRANCH",
        severity: "warning",
        message: "Branch has no active terminal Attack or derived Asset.",
        nodeId: n.id,
      });
    if ((outgoing.get(n.id)?.length ?? 0) > 0 && Object.keys(n.metrics).length)
      f.push({
        code: "BRANCH_INPUT",
        severity: "warning",
        message:
          "Branch raw inputs are retained but ignored; only leaf values contribute.",
        nodeId: n.id,
      });
  }
  for (const e of tree.edges) {
    if (edgeIds.has(e.id) || pairs.has(`${e.source}\0${e.target}`))
      add("IDENTITY", "Duplicate edge identity or endpoints.", undefined, e.id);
    edgeIds.add(e.id);
    pairs.add(`${e.source}\0${e.target}`);
    const a = nodes.get(e.source),
      b = nodes.get(e.target);
    if (!a || !b) {
      add("DANGLING", "Relationship endpoint is missing.", undefined, e.id);
      continue;
    }
    if (!allowedChildren[a.type]?.includes(b.type))
      add(
        "TYPE",
        `Illegal transition: ${a.type} → ${b.type}.`,
        undefined,
        e.id,
      );
    if (e.lossId !== tree.rootId)
      add(
        "SCOPE",
        "Relationship Loss scope must match selected root.",
        undefined,
        e.id,
      );
    if (!["AND", "OR", "SAND"].includes(e.gate))
      add("GATE", "Invalid operator.", undefined, e.id);
    if (b.type === "Environment" && e.gate !== "AND")
      add("CONTEXT", "Environment context uses AND.", undefined, e.id);
    if (e.gate !== "SAND" && e.sequence !== null)
      add("SEQUENCE", "Non-SAND sequence must be null.", undefined, e.id);
    if (e.tailoredOut && !e.tailoredReason.trim())
      add("REASON", "Tailoring requires a reason.", undefined, e.id);
    if (!e.tailoredOut && e.tailoredReason)
      add(
        "REASON",
        "Restored relationship must clear tailoring reason.",
        undefined,
        e.id,
      );
    if (
      e.completeBlock &&
      (a.type !== "Attack" ||
        b.type !== "Countermeasure" ||
        !e.blockReason.trim())
    )
      add(
        "BLOCK",
        "CompleteBlock requires Attack → Countermeasure and a reason.",
        undefined,
        e.id,
      );
    if (!e.completeBlock && e.blockReason)
      add(
        "REASON",
        "Unblocked relationship must clear block reason.",
        undefined,
        e.id,
      );
    if (
      e.allowedRV !== null &&
      (b.type !== "Attack" ||
        (outgoing.get(b.id)?.length ?? 0) > 0 ||
        e.allowedReason.trim().length < 20 ||
        !Number.isFinite(e.allowedRV) ||
        e.allowedRV !== 1)
    )
      add(
        "RV",
        "Allowed RV requires a leaf Attack, the Boolean sentinel 1, and a reason of at least 20 characters.",
        undefined,
        e.id,
      );
    if (e.allowedRV === null && e.allowedReason)
      add(
        "REASON",
        "Revoked Allowed RV must clear its reason.",
        undefined,
        e.id,
      );
  }
  return [...f, ...capacityFindings(tree)];
}
export function descendants(tree: AttackTree, id: string): Set<string> {
  const { outgoing } = indexGraph(tree),
    result = new Set<string>();
  const q = [id];
  for (let i = 0; i < q.length; i++)
    for (const e of outgoing.get(q[i]) ?? [])
      if (!result.has(e.target) && e.target !== id) {
        result.add(e.target);
        q.push(e.target);
      }
  return result;
}
export function visibleNodes(
  tree: AttackTree,
  expandedPath: string[] = [],
): Set<string> {
  const { outgoing } = indexGraph(tree);
  const collapsed = new Set(
    tree.root.AttackTreeJSON.collapsed.filter(
      (id) => !expandedPath.includes(id),
    ),
  );
  const visible = new Set([tree.rootId]);
  const q = [tree.rootId];
  for (let i = 0; i < q.length; i++) {
    if (collapsed.has(q[i])) continue;
    for (const e of outgoing.get(q[i]) ?? [])
      if (!visible.has(e.target)) {
        visible.add(e.target);
        q.push(e.target);
      }
  }
  return visible;
}
export function pruneBranch(tree: AttackTree, id: string) {
  if (id === tree.rootId) throw new Error("The Loss root cannot be removed.");
  tree.edges = tree.edges.filter((e) => e.target !== id);
  const all = visibleNodes({
    ...tree,
    root: {
      ...tree.root,
      AttackTreeJSON: { ...tree.root.AttackTreeJSON, collapsed: [] },
    },
  });
  tree.nodes = tree.nodes.filter((n) => all.has(n.id));
  tree.edges = tree.edges.filter((e) => all.has(e.source) && all.has(e.target));
  normalizeSequences(tree);
}
export function normalizeSequences(tree: AttackTree) {
  const { outgoing } = indexGraph(tree);
  for (const es of outgoing.values()) {
    let seq = 0;
    for (const e of es) {
      e.sequence =
        e.gate === "SAND" && !e.tailoredOut
          ? seq++
          : e.gate === "SAND"
            ? e.sequence
            : null;
    }
  }
}
export function makeEdge(
  tree: AttackTree,
  source: string,
  target: string,
): TreeEdge {
  const n = tree.nodes.find((n) => n.id === source)!;
  const t = tree.nodes.find((n) => n.id === target)!;
  const sibling = tree.edges.find(
    (e) =>
      e.source === source &&
      !e.tailoredOut &&
      tree.nodes.find((n) => n.id === e.target)?.type !== "Environment",
  );
  const defaultGate =
    t.type === "Environment" ||
    (n.type === "Attack" && t.type === "Countermeasure") ||
    (n.type === "Countermeasure" && t.type === "Asset")
      ? "AND"
      : "OR";
  const gate =
    t.type === "Environment" ? "AND" : (sibling?.gate ?? defaultGate);
  return {
    id: crypto.randomUUID(),
    source,
    target,
    lossId: tree.rootId,
    gate,
    sequence:
      gate === "SAND"
        ? tree.edges.filter((e) => e.source === source && !e.tailoredOut).length
        : null,
    tailoredOut: false,
    tailoredReason: "",
    completeBlock: false,
    blockReason: "",
    allowedRV: null,
    allowedReason: "",
  };
}

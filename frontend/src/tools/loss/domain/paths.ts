import type { AttackTree, TreeEdge } from "./types";
import { indexGraph } from "./graph";
export type TerminalStatus =
  | "RV"
  | "ALLOWED"
  | "BLOCKED"
  | "DERIVED"
  | "INCOMPLETE";
export interface AttackPath {
  id: string;
  nodeIds: string[];
  edgeIds: string[];
  status: TerminalStatus;
  reason: string;
  terminalId: string;
}
export function analyzePaths(tree: AttackTree, cap = 10000) {
  const { nodes, outgoing } = indexGraph(tree);
  const active = (id: string) =>
    (outgoing.get(id) ?? []).filter(
      (e) => !e.tailoredOut && nodes.get(e.target)?.type !== "Environment",
    );
  const terminal = (id: string) =>
    nodes.get(id)?.type === "Attack" ||
    (nodes.get(id)?.type === "Asset" && nodes.get(id)?.derived);
  const countMemo = new Map<string, bigint>(),
    visiting = new Set<string>();
  function count(id: string): bigint {
    if (countMemo.has(id)) return countMemo.get(id)!;
    if (visiting.has(id)) throw new Error("Cannot enumerate cyclic graph");
    visiting.add(id);
    const es = active(id);
    const c = es.length
      ? es.reduce(
          (sum, e) => sum + (e.completeBlock ? 1n : count(e.target)),
          0n,
        )
      : terminal(id)
        ? 1n
        : 0n;
    visiting.delete(id);
    countMemo.set(id, c);
    return c;
  }
  const total = count(tree.rootId),
    paths: AttackPath[] = [];
  function walk(id: string, ns: string[], es: string[], incoming?: TreeEdge) {
    if (paths.length >= cap) return;
    const next = active(id);
    if (incoming?.completeBlock || !next.length) {
      if (!incoming?.completeBlock && !terminal(id)) return;
      const n = nodes.get(id)!;
      const status: TerminalStatus = incoming?.completeBlock
        ? "BLOCKED"
        : n.type === "Asset" && n.derived
          ? "DERIVED"
          : n.type === "Attack"
            ? incoming?.allowedRV !== null && incoming?.allowedRV !== undefined
              ? "ALLOWED"
              : "RV"
            : "INCOMPLETE";
      paths.push({
        id: `path:${es.join("/")}`,
        nodeIds: ns,
        edgeIds: es,
        status,
        reason:
          status === "BLOCKED"
            ? incoming!.blockReason
            : status === "ALLOWED"
              ? incoming!.allowedReason
              : "",
        terminalId: id,
      });
      return;
    }
    for (const e of next) {
      walk(e.target, [...ns, e.target], [...es, e.id], e);
      if (paths.length >= cap) break;
    }
  }
  walk(tree.rootId, [tree.rootId], []);
  // An exact dynamic RV count remains accurate even when materialized routes are capped.
  const rvMemo = new Map<string, bigint>();
  function rvCount(id: string): bigint {
    if (rvMemo.has(id)) return rvMemo.get(id)!;
    const es = active(id);
    let sum = 0n;
    for (const e of es) {
      if (e.completeBlock) continue;
      const child = active(e.target);
      sum += child.length
        ? rvCount(e.target)
        : nodes.get(e.target)?.type === "Attack" && e.allowedRV === null
          ? 1n
          : 0n;
    }
    rvMemo.set(id, sum);
    return sum;
  }
  return {
    paths,
    total: total.toString(),
    truncated: total > BigInt(cap),
    rvCount: rvCount(tree.rootId).toString(),
    cap,
  };
}

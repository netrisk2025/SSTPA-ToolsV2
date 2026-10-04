import { NODE_TYPES, type AttackTree, type Repository } from "./types";
import { isUnsafeIdentity, validateGraph } from "./graph";
import { validateMetricConfiguration, validateLeafMetrics } from "./metrics";
import {
  AUTHORITATIVE_UUID_PATTERN,
  NODE_PROPERTY_OPTIONS,
  selectedNodePropertyKeys,
} from "./identity";
const key = "sstpa.attack-tree.standalone.v1";
/** Parse only the documented DTO. Limits are checked before expensive analysis. */
export function parseTree(raw: string): AttackTree {
  if (raw.length > 12_000_000)
    throw new Error(
      "JSON exceeds the 12 MB import envelope. Decompose the system to create smaller trees.",
    );
  const t = JSON.parse(raw);
  const obj = (v: unknown) => !!v && typeof v === "object" && !Array.isArray(v);
  const str = (v: unknown) => typeof v === "string";
  const finite = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  if (
    !obj(t) ||
    t.schemaVersion !== 1 ||
    !str(t.id) ||
    !str(t.name) ||
    !str(t.rootId) ||
    !Number.isInteger(t.revision) ||
    t.revision < 0 ||
    !str(t.createdAt) ||
    !str(t.updatedAt) ||
    !Array.isArray(t.nodes) ||
    !Array.isArray(t.edges) ||
    !obj(t.root)
  )
    throw new Error("Invalid version-1 AttackTree document.");
  if (t.nodes.length > 1000)
    throw new Error(
      "nodes exceeds limit 1000. Decompose the system to create smaller trees.",
    );
  if (t.edges.length > 50000)
    throw new Error("Relationship import envelope exceeded.");
  for (const n of t.nodes)
    if (
      !obj(n) ||
      !str(n.id) ||
      !str(n.hid) ||
      !str(n.label) ||
      !str(n.description) ||
      !NODE_TYPES.includes(n.type) ||
      !["Core database", "Not yet committed", "FireSat reference", "Prototype illustration"].includes(n.provenance) ||
      (n.authoritativeUuid !== undefined &&
        n.authoritativeUuid !== null &&
        (!str(n.authoritativeUuid) ||
          !AUTHORITATIVE_UUID_PATTERN.test(n.authoritativeUuid))) ||
      !obj(n.metrics) ||
      Object.values(n.metrics).some(
        (v) => v !== null && typeof v !== "boolean" && !finite(v),
      ) ||
      (n.eventKind !== undefined &&
        !["hostile", "stochastic"].includes(n.eventKind))
    )
      throw new Error("Invalid node record or metric input.");
  for (const e of t.edges)
    if (
      !obj(e) ||
      ![
        "id",
        "source",
        "target",
        "lossId",
        "gate",
        "tailoredReason",
        "blockReason",
        "allowedReason",
      ].every((k) => str(e[k])) ||
      !["tailoredOut", "completeBlock"].every(
        (k) => typeof e[k] === "boolean",
      ) ||
      (e.sequence !== null &&
        (!Number.isInteger(e.sequence) || e.sequence < 0)) ||
      (e.allowedRV !== null && !finite(e.allowedRV))
    )
      throw new Error("Invalid relationship record.");
  const r = t.root,
    v = r.AttackTreeJSON;
  if (
    !["asset", "environment", "soi", "criticality"].every((k) => str(r[k])) ||
    !["Confidentiality", "Availability", "Authenticity", "NonRepudiation", "Certifiable", "Privacy", "Trustworthy"].includes(
      r.assurance,
    ) ||
    !Array.isArray(r.MetricDefinitionsJSON) ||
    !obj(r.AnalysisProfileJSON) ||
    !obj(v) ||
    !obj(v.positions) ||
    !Array.isArray(v.collapsed) ||
    !v.collapsed.every(str) ||
    !Array.isArray(v.selectedProperties) ||
    !v.selectedProperties.every(str) ||
    (v.selectedNodeProperties !== undefined &&
      (!Array.isArray(v.selectedNodeProperties) ||
        !v.selectedNodeProperties.every((key: unknown) =>
          NODE_PROPERTY_OPTIONS.some((option) => option.key === key),
        ))) ||
    !obj(v.nodeStyles) ||
    !["DOWN", "RIGHT"].includes(v.direction) ||
    !["parchment", "nocturne"].includes(v.theme) ||
    !obj(v.viewport) ||
    !["x", "y", "zoom"].every((k) => finite(v.viewport[k])) ||
    v.viewport.zoom < 0.02 ||
    v.viewport.zoom > 3
  )
    throw new Error("Invalid root context or presentation properties.");
  if (Object.keys(v.positions).some(isUnsafeIdentity))
    throw new Error(
      "Reserved object-property names cannot be saved position identities.",
    );
  for (const p of Object.values(v.positions))
    if (
      !obj(p) ||
      !finite((p as { x: unknown }).x) ||
      !finite((p as { y: unknown }).y)
    )
      throw new Error("Invalid card position.");
  for (const type of NODE_TYPES)
    if (
      !obj(v.nodeStyles[type]) ||
      !["font", "box", "border", "line"].every((k) =>
        /^#[0-9a-f]{6}$/i.test(v.nodeStyles[type][k]),
      )
    )
      throw new Error("Invalid node type colors.");
  const errors = validateGraph(t).filter((f) => f.severity === "error");
  if (errors.length) throw new Error(errors.map((f) => f.message).join("\n"));
  const metricErrors = validateMetricConfiguration(
    r.MetricDefinitionsJSON,
    r.AnalysisProfileJSON,
  );
  if (metricErrors.length) throw new Error(metricErrors.join("\n"));
  const parents = new Set(t.edges.map((e: { source: string }) => e.source));
  for (const n of t.nodes)
    if (!parents.has(n.id)) {
      const invalid = validateLeafMetrics(n.metrics, r.MetricDefinitionsJSON);
      if (invalid.length) throw new Error(`${n.hid}: ${invalid.join(" ")}`);
    }
  // Imported identifiers are never promoted to database authority. The production
  // adapter resolves HIDs against the authenticated Core response before staging.
  for (const n of t.nodes)
    if (n.authoritativeUuid === undefined)
      n.authoritativeUuid = null;
  if (v.selectedNodeProperties === undefined) {
    v.selectedNodeProperties = selectedNodePropertyKeys(v);
    v.selectedProperties = v.selectedProperties.filter(
      (key: string) => key !== "provenance",
    );
  }
  return t;
}
export class BrowserRepository implements Repository {
  load() {
    const raw = localStorage.getItem(key);
    return raw ? parseTree(raw) : null;
  }
  save(tree: AttackTree) {
    localStorage.setItem(key, JSON.stringify(tree));
  }
}
export class MemoryRepository implements Repository {
  private tree: AttackTree | null = null;
  load() {
    return this.tree ? structuredClone(this.tree) : null;
  }
  save(tree: AttackTree) {
    this.tree = structuredClone(tree);
  }
}
export function commitTree(
  draft: AttackTree,
  repository: Repository,
): AttackTree {
  const next = structuredClone(draft);
  next.revision += 1;
  next.updatedAt = new Date().toISOString();
  const validated = parseTree(JSON.stringify(next));
  repository.save(validated);
  return validated;
}

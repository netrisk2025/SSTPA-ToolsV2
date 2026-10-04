// Pure projection of authoritative SSTPA Core records into the approved GSN core.
// HIDs are identity; the shorter, human-readable GSN ID is presentation only.
import type { SoINode, SoIRelationship } from "../../api/types";
import { emptyLayout, GSN_TYPES, ID_PREFIX, statementProp } from "./domain/model/types";
import type { EvidenceNote, Finding, GoalStructure, GsnElement, GsnType, NodePosition, ViewportState } from "./domain/model/types";
import { mergeLastSaved } from "./domain/layout/manager";
import { parseNodeStyles, type GsnNodeStyles } from "./domain/presentation/colors";

const EVIDENCE_TYPES: Readonly<Record<string, string>> = {
  HAS_VALIDATION: "Validation", HAS_VERIFICATION: "Verification", HAS_LOSS: "Loss",
};
function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function text(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}
function properties(node: SoINode): Record<string, unknown> { return record(node.properties) ?? {}; }
function relationships(node: SoINode): SoIRelationship[] {
  return Array.isArray(node.relationships) ? node.relationships.filter(r => record(r) && typeof r.type === "string" && typeof r.targetHID === "string" && r.targetHID.trim()) : [];
}
function isGsn(node: SoINode | undefined): node is SoINode & { typeName: GsnType } {
  return !!node && GSN_TYPES.includes(node.typeName as GsnType);
}
function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Schema integer IDs are labelled G1/S1/Sn1, never used as map keys. */
export function displayIdFor(node: SoINode): string {
  if (!isGsn(node)) return node.hid;
  const value = text(properties(node)[`${node.typeName.slice(3)}ID`]).trim();
  return value ? /^\d+$/.test(value) ? `${ID_PREFIX[node.typeName]}${value}` : value : node.hid;
}

/** Only argument-reachable Core nodes enter a case. View snapshots never add semantics. */
export function fromCore(rootHid: string, nodes: readonly SoINode[]): GoalStructure {
  const byHid = new Map<string, SoINode>();
  for (const node of nodes) {
    if (!node || typeof node.hid !== "string" || !node.hid.trim()) continue;
    if (byHid.has(node.hid)) throw new Error(`Core returned duplicate canonical HID ${node.hid}; refresh or repair the Core data before editing.`);
    byHid.set(node.hid, node);
  }
  const root = byHid.get(rootHid);
  const elements = new Map<string, GsnElement>();
  const evidence = new Map<string, EvidenceNote>();
  const loadFindings: Finding[] = [];
  const add = (code: string, nodeId: string, message: string) => loadFindings.push({ code, nodeId, message, severity: "ERROR" });
  const pending = [rootHid], visited = new Set<string>();
  while (pending.length) {
    const hid = pending.pop()!;
    if (visited.has(hid)) continue;
    visited.add(hid);
    const node = byHid.get(hid);
    if (!isGsn(node)) continue;
    // API isolation is normally enforced by Core; fail closed if a bad response mixes SoIs.
    if (root?.soi && node.soi !== root.soi) { add("CROSS_SOI", hid, `${hid} belongs to a different System of Interest and was not loaded.`); continue; }
    const props = properties(node), rels = relationships(node);
    if (!record(node.properties)) add("MALFORMED_PROPERTIES", hid, `${hid} has malformed Core properties.`);
    // Core serializes an empty outgoing set as null (and older payloads omit it).
    if (node.relationships != null && (!Array.isArray(node.relationships) || rels.length !== node.relationships.length)) add("MALFORMED_RELATIONSHIP", hid, `${hid} has malformed Core relationship records.`);
    const statement = props[statementProp(node.typeName)];
    if (statement !== undefined && statement !== null && typeof statement !== "string") add("MALFORMED_STATEMENT", hid, `${hid} has a non-text ${statementProp(node.typeName)}; repair it in Core.`);
    if (props.Undeveloped !== undefined && typeof props.Undeveloped !== "boolean") add("MALFORMED_UNDEVELOPED", hid, `${hid} has a non-Boolean Undeveloped value.`);
    const supportedBy = rels.filter(r => r.type === "SUPPORTED_BY").map(r => r.targetHID);
    const inContextOf = rels.filter(r => r.type === "IN_CONTEXT_OF").map(r => r.targetHID);
    const evidenceRels = rels.filter(r => Object.hasOwn(EVIDENCE_TYPES, r.type));
    const nodeEvidence = evidenceRels.map(r => r.targetHID);
    elements.set(hid, {
      filePath: hid, gkType: node.typeName, gsnId: hid, displayId: displayIdFor(node),
      name: text(props.Name) || displayIdFor(node), statement: typeof statement === "string" ? statement : "",
      isRoot: hid === rootHid, undeveloped: props.Undeveloped === true,
      supportedBy, inContextOf, hasEvidence: nodeEvidence,
      metadata: { core_hid: hid, core_uuid: node.uuid, core_type: node.typeName, source_properties: cloneJson(props) },
    });
    pending.push(...[...supportedBy, ...inContextOf].reverse());
    const seenEvidence = new Set<string>();
    for (const rel of evidenceRels) {
      const target = byHid.get(rel.targetHID);
      const key = `${rel.type}:${rel.targetHID}`;
      if (seenEvidence.has(key)) add("DUP_EVIDENCE_EDGE", hid, `${hid} repeats ${rel.type} to ${rel.targetHID}.`);
      seenEvidence.add(key);
      if (!target) continue; // Generic validator reports the missing evidence reference.
      if (target.typeName !== EVIDENCE_TYPES[rel.type]) {
        add("INVALID_EVIDENCE_REL", hid, `${rel.type} from ${hid} must target ${EVIDENCE_TYPES[rel.type]}, not ${target.typeName}.`);
        continue;
      }
      if (root?.soi && target.soi !== root.soi) { add("CROSS_SOI", hid, `Evidence ${target.hid} belongs to a different System of Interest and was not loaded.`); continue; }
      const ep = properties(target);
      const details = [text(ep.ShortDescription), target.typeName === "Validation" ? text(ep.VMethod) : "", target.typeName === "Verification" ? text(ep.Procedure) : ""].filter(Boolean);
      evidence.set(target.hid, {
        filePath: target.hid, name: text(ep.Name) || target.hid, statement: details.join("\n\n"),
        // A Core node category does not establish which assurance method was performed.
        kind: "Other",
        ...(text(ep.ArtifactPath) ? { artifactPath: text(ep.ArtifactPath) } : {}),
        metadata: { core_hid: target.hid, core_uuid: target.uuid, core_type: target.typeName, source_properties: cloneJson(ep) },
      });
    }
  }
  const displayOwners = new Map<string, string[]>();
  for (const element of elements.values()) {
    const id = element.displayId!;
    displayOwners.set(id, [...displayOwners.get(id) ?? [], element.gsnId]);
  }
  for (const [id, hids] of displayOwners) if (hids.length > 1) for (const hid of hids) add("DUP_DISPLAY_ID", hid, `Display identifier ${id} is shared by ${hids.join(", ")}. Canonical HIDs remain distinct; repair the display IDs.`);
  for (const node of nodes) if (!elements.has(node.hid) && isGsn(node) && (!root?.soi || node.soi === root.soi) && relationships(node).some(r => r.type === "SUPPORTED_BY" && r.targetHID === rootHid)) add("ROOT_INCOMING", rootHid, `Selected Root Goal ${rootHid} has incoming support from ${node.hid}. Select the containing root or repair the relationship.`);
  return { rootId: rootHid, rootDir: rootHid, elements, evidence, layout: emptyLayout(rootHid), loadFindings };
}

export interface CoreView {
  positions: Record<string, NodePosition>;
  viewport: ViewportState;
  nodeStyles: GsnNodeStyles;
  savedAt?: string;
  hasSavedLayout: boolean;
  warnings: string[];
  newlyPlaced: string[];
}
export interface CoreViewInput {
  positions: Record<string, NodePosition>;
  viewport: ViewportState;
  nodeStyles?: GsnNodeStyles;
}
interface Envelope { value: Record<string, unknown>; error?: string }
function envelope(root: SoINode | undefined): Envelope {
  const raw = root ? properties(root).GoalStructure : undefined;
  if (raw === undefined || raw === null || raw === "" || raw === "Null" || raw === "null") return { value: {} };
  let value: Record<string, unknown> | undefined;
  try { value = record(typeof raw === "string" ? JSON.parse(raw) : raw); } catch { /* Report and preserve unrecognized data. */ }
  if (!value) return { value: {}, error: "Saved GoalStructure is not a valid JSON object; repair or export the stored value before saving a replacement." };
  if (value.schemaVersion !== undefined && value.schemaVersion !== "1.0" && value.schemaVersion !== 1) return { value, error: "Saved GoalStructure has an unsupported schema version; this view cannot safely rewrite it." };
  if ((value.rootGoalHid !== undefined && value.rootGoalHid !== root?.hid) || (value.rootGoalUuid !== undefined && value.rootGoalUuid !== null && value.rootGoalUuid !== root?.uuid)) return { value, error: "Saved GoalStructure belongs to a different root identity and cannot be applied or overwritten." };
  if (value.goalKeeperView !== undefined && (!record(value.goalKeeperView) || record(value.goalKeeperView)!.version !== 1)) return { value, error: "Saved Goal Keeper view has an unsupported version; this view cannot safely rewrite it." };
  return { value };
}
function positionsFor(value: unknown, structure: GoalStructure): Record<string, NodePosition> {
  const output: Record<string, NodePosition> = {};
  for (const [id, position] of Object.entries(record(value) ?? {})) {
    const p = record(position);
    if (structure.elements.has(id) && typeof p?.x === "number" && typeof p.y === "number" && Number.isFinite(p.x) && Number.isFinite(p.y)) output[id] = { x: p.x, y: p.y };
  }
  return output;
}
function viewportFor(value: unknown, structure: GoalStructure, legacyZoom?: unknown): ViewportState {
  const v = record(value) ?? {};
  const zoom = v.zoom ?? legacyZoom;
  return {
    x: typeof v.x === "number" && Number.isFinite(v.x) ? v.x : 0,
    y: typeof v.y === "number" && Number.isFinite(v.y) ? v.y : 0,
    zoom: typeof zoom === "number" && Number.isFinite(zoom) && zoom > 0 ? zoom : 1,
    ...(typeof v.focusId === "string" && structure.elements.has(v.focusId) ? { focusId: v.focusId } : {}),
  };
}

/** Load presentation only, reconciling saved HIDs with the current Core graph. */
export function readCoreView(root: SoINode | undefined, structure: GoalStructure): CoreView {
  const parsed = root && root.hid !== structure.rootId
    ? { value: {}, error: "The saved view root does not match the current argument." }
    : envelope(root);
  const value = parsed.error ? {} : parsed.value;
  const view = record(value.goalKeeperView);
  const legacyPositions = Object.fromEntries((Array.isArray(value.nodes) ? value.nodes : []).flatMap(row => {
    const n = record(row); return n && typeof n.hid === "string" ? [[n.hid, { x: n.x, y: n.y }]] : [];
  }));
  const saved = positionsFor(view ? view.positions : legacyPositions, structure);
  const viewport = viewportFor(view ? view.viewport : value.viewport, structure, view ? undefined : value.zoom);
  const nodeStyles = parseNodeStyles(view?.nodeStyles);
  const merged = mergeLastSaved(structure, { ...emptyLayout(structure.rootId), nodes: saved });
  return { positions: merged.positions, viewport, nodeStyles, savedAt: typeof value.savedAt === "string" ? value.savedAt : undefined,
    hasSavedLayout: Object.keys(saved).length > 0, warnings: parsed.error ? [parsed.error] : [], newlyPlaced: merged.newlyPlaced };
}

/** Build the single Core property value; the host sends it through /api/commit. */
export function serializeCoreView(root: SoINode | undefined, structure: GoalStructure, input: CoreViewInput): string {
  if (!root || root.hid !== structure.rootId || root.typeName !== "GsnGoal" || !structure.elements.has(root.hid)) throw new Error("A current canonical Root Goal is required to save this view.");
  const parsed = envelope(root);
  if (parsed.error) throw new Error(parsed.error);
  const value = cloneJson(parsed.value), oldView = record(value.goalKeeperView) ?? {};
  const positions = positionsFor(input.positions, structure), viewport = viewportFor(input.viewport, structure);
  const nodeStyles = parseNodeStyles(input.nodeStyles);
  const oldRows = new Map((Array.isArray(value.nodes) ? value.nodes : []).flatMap(row => {
    const n = record(row); return n && typeof n.hid === "string" ? [[n.hid, n] as const] : [];
  }));
  return JSON.stringify({ ...value, schemaVersion: "1.0", rootGoalHid: root.hid, rootGoalUuid: root.uuid,
    toolType: "sstpa.goalkeeper", savedAt: new Date().toISOString(), layoutMode: "gsn-v3-layered",
    viewport: { ...record(value.viewport), x: viewport.x, y: viewport.y }, zoom: viewport.zoom,
    nodes: Object.entries(positions).map(([hid, pos]) => ({ ...oldRows.get(hid), hid, ...pos, collapsed: oldRows.get(hid)?.collapsed === true })),
    goalKeeperView: { ...oldView, version: 1, positions, viewport, nodeStyles },
  });
}

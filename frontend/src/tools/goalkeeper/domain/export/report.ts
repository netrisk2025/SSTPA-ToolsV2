import type { Finding, GoalStructure } from "../model/types";
import { validateStructure } from "../rules/validate";

function uniqueEvidence(structure: GoalStructure) {
  return [...new Map([...structure.evidence.values()].map((note) => [note.filePath, note])).values()];
}

const REVIEW_LIMIT = "Structural validation does not establish evidence sufficiency, accepted risk, certification or approval by a security regime official.";

// Customer reports contain traceable provenance and evidence facts. The JSON
// export retains complete source properties, including analytical/view snapshots.
const PROVENANCE_FIELDS = ["core_hid", "core_uuid", "core_type", "source_repository", "source_revision", "source_file", "source_entity_ids", "source_sha256", "sha256", "provenance", "assurance_status"] as const;
const EVIDENCE_FIELDS = {
  ShortDescription: "Description", VStatement: "Validation statement", VMethod: "Method",
  Procedure: "Verification procedure", VStatus: "Verification status", Status: "Status",
} as const;
const CLASSIFICATION_FIELDS = ["SafetyCritical", "MissionCritical", "FlightCritical", "SecurityCritical", "Confidentiality", "Availability", "Authenticity", "NonRepudiation", "Certifiable", "Privacy", "Trustworthy"] as const;

function reportValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value) && value.every(item => typeof item === "string" || typeof item === "number")) return value.join(", ");
  return undefined;
}

function reportMetadata(metadata: Record<string, unknown> | undefined, statement: string): string[] {
  const lines: string[] = [];
  for (const key of PROVENANCE_FIELDS) {
    const value = reportValue(metadata?.[key]);
    if (value !== undefined) lines.push(`- ${key}: ${value}`);
  }
  const source = metadata?.source_properties;
  if (!source || typeof source !== "object" || Array.isArray(source)) return lines;
  const properties = source as Record<string, unknown>;
  const alreadyShown = new Set(statement.split(/\n{2,}/).map(part => part.trim()));
  for (const [key, label] of Object.entries(EVIDENCE_FIELDS)) {
    const value = reportValue(properties[key]);
    if (value !== undefined && !alreadyShown.has(value.trim())) lines.push(`- ${label}: ${value}`);
  }
  const classifications = CLASSIFICATION_FIELDS.filter(key => properties[key] === true);
  if (classifications.length) lines.push(`- Classification: ${classifications.join(", ")}`);
  return lines;
}

export function exportMarkdown(structure: GoalStructure, findings?: Finding[]): string {
  const f = findings ?? validateStructure(structure);
  const root = structure.elements.get(structure.rootId);
  const lines = [
    `# Goal Structure: ${root?.name ?? structure.rootId}`, "",
    `- Root: **${structure.rootId}**`, `- Directory: \`${structure.rootDir}\``,
    `- Exported: ${new Date().toISOString()}`, "", REVIEW_LIMIT, "", "## Elements", "",
  ];
  for (const el of structure.elements.values()) {
    lines.push(`### ${el.displayId ?? el.gsnId} — ${el.name} (${el.gkType.replace("Gsn", "")})`);
    if (el.displayId && el.displayId !== el.gsnId) lines.push(`Canonical HID: ${el.gsnId}`);
    if (el.isRoot) lines.push("_Root Goal_");
    if (el.undeveloped) lines.push("_Undeveloped_");
    lines.push("", el.statement || "_(empty statement)_", "");
    for (const [label, links] of [["Supported by", el.supportedBy], ["In context of", el.inContextOf], ["Evidence", el.hasEvidence]] as const) {
      if (links.length) lines.push(`${label}: ${links.map((id) => `[[${id}]]`).join(", ")}`);
    }
    lines.push(...reportMetadata(el.metadata, el.statement));
    lines.push("");
  }
  lines.push("## Evidence notes", "");
  for (const note of uniqueEvidence(structure)) {
    lines.push(`### ${note.name}`, "", `- Note: ${note.filePath}`, `- Kind: ${note.kind}`);
    if (note.artifactPath) lines.push(`- Artifact: ${note.artifactPath}`);
    lines.push(...reportMetadata(note.metadata, note.statement));
    lines.push("", note.statement, "");
  }
  lines.push("## Validation findings", "");
  if (!f.length) lines.push("No structural findings. Evidence sufficiency still requires review.");
  else for (const item of f) lines.push(`- **${item.severity}** \`${item.code}\`${item.nodeId ? ` (${item.nodeId})` : ""}: ${item.message}`);
  return lines.join("\n") + "\n";
}

export function exportJson(structure: GoalStructure, findings?: Finding[]): string {
  return JSON.stringify({
    schemaVersion: 1,
    profile: "GSN Community Standard v3 — core notation",
    reviewLimit: REVIEW_LIMIT,
    exportedAt: new Date().toISOString(),
    root: { gsnId: structure.rootId, name: structure.elements.get(structure.rootId)?.name ?? "", rootDir: structure.rootDir },
    elements: [...structure.elements.values()],
    relationships: [...structure.elements.values()].flatMap((el) => [
      ...el.supportedBy.map((target) => ({ type: "SUPPORTED_BY", source: el.gsnId, target })),
      ...el.inContextOf.map((target) => ({ type: "IN_CONTEXT_OF", source: el.gsnId, target })),
      ...el.hasEvidence.map((target) => ({ type: "HAS_EVIDENCE", source: el.gsnId, target })),
    ]),
    evidence: uniqueEvidence(structure),
    layout: structure.layout,
    findings: findings ?? validateStructure(structure),
  }, null, 2);
}

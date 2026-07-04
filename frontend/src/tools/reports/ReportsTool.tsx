// Reports Tool (SRS §6.5.3): general text-based reports — System Description,
// System Specification, Requirement-Traceability Gap Analysis, Controls List.
// Output as plain text, Markdown, or HTML (Word-compatible / print-to-PDF);
// see docs/REQUIREMENTS-NOTES.md I-11.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../../api/client";
import type { SoINode } from "../../api/types";
import { displayName } from "../../components/NodeTypeBadge";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

type ReportKind =
  | "system-description"
  | "system-specification"
  | "gap-analysis"
  | "controls-list";

const REPORTS: { id: ReportKind; label: string }[] = [
  { id: "system-description", label: "System Description" },
  { id: "system-specification", label: "System Specification" },
  { id: "gap-analysis", label: "Requirement-Traceability Gap Analysis" },
  { id: "controls-list", label: "Controls List" },
];

/** Primary node type ordering for report sections (§6.3.4.2 order). */
const SECTION_ORDER = [
  "Environment",
  "Connection",
  "Interface",
  "SystemFunction",
  "Component",
  "Purpose",
  "State",
  "Asset",
  "SecurityControl",
  "Countermeasure",
];

export default function ReportsTool({
  ctx,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  const [kind, setKind] = useState<ReportKind>("system-description");
  const [generated, setGenerated] = useState<string | null>(null); // markdown
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const soi = useQuery({
    queryKey: ["soi", ctx.soiHid],
    queryFn: () => api.soi(ctx.soiHid!),
    enabled: !!ctx.soiHid,
  });

  const nodes = useMemo(() => soi.data?.nodes ?? [], [soi.data]);
  const byHid = useMemo(() => new Map(nodes.map((n) => [n.hid, n])), [nodes]);

  const generate = async () => {
    if (!ctx.soiHid) return;
    setBusy(true);
    setNotice(null);
    try {
      let md: string;
      switch (kind) {
        case "system-description":
          md = systemDescription(ctx.soiHid, nodes, byHid);
          break;
        case "system-specification":
          md = systemSpecification(ctx.soiHid, nodes, byHid);
          break;
        case "gap-analysis":
          md = await gapAnalysis(ctx, nodes, byHid);
          break;
        case "controls-list":
          md = controlsList(ctx.soiHid, nodes, byHid);
          break;
      }
      setGenerated(md);
      if (kind === "gap-analysis") {
        setNotice("Orphan and Barren properties were computed and committed by this report (SRS §6.5.3.8).");
      }
    } catch (e) {
      setNotice(String(e));
    } finally {
      setBusy(false);
    }
  };

  const download = (format: "md" | "txt" | "html") => {
    if (!generated) return;
    let content = generated;
    let mime = "text/markdown";
    if (format === "txt") {
      content = generated.replace(/^#+\s*/gm, "").replace(/\*\*/g, "");
      mime = "text/plain";
    } else if (format === "html") {
      content = mdToHtml(generated);
      mime = "text/html";
    }
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sstpa-${kind}-${ctx.soiHid}.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printPdf = () => {
    if (!generated) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(mdToHtml(generated));
    win.document.close();
    win.print();
  };

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        <select
          className="sstpa-input"
          style={{ width: "auto" }}
          value={kind}
          onChange={(e) => setKind(e.target.value as ReportKind)}
        >
          {REPORTS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <button className="sstpa-button" disabled={!ctx.soiHid || busy} onClick={() => void generate()}>
          {busy ? "Generating…" : "Generate"}
        </button>
        <span style={{ flex: 1 }} />
        <button className="icon-button" disabled={!generated} onClick={() => download("md")}>
          Markdown
        </button>
        <button className="icon-button" disabled={!generated} onClick={() => download("txt")}>
          Text
        </button>
        <button className="icon-button" disabled={!generated} onClick={() => download("html")}>
          HTML (Word)
        </button>
        <button className="icon-button" disabled={!generated} onClick={printPdf}>
          Print / PDF
        </button>
      </div>
      {notice && (
        <div className="sstpa-alert-warning" style={{ margin: "6px 12px" }}>
          {notice}
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", padding: "var(--sstpa-sp-4)" }}>
        {!ctx.soiHid && <p>Select a System of Interest first.</p>}
        {generated ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--sstpa-font-mono)",
              fontSize: "0.78rem",
              background: "var(--sstpa-ivory-raised)",
              border: "var(--sstpa-border-soft)",
              borderRadius: 4,
              padding: "var(--sstpa-sp-4)",
            }}
          >
            {generated}
          </pre>
        ) : (
          <p style={{ color: "var(--sstpa-navy-muted)" }}>
            Choose a report and press Generate.
          </p>
        )}
      </div>
    </div>
  );
}

function prop(n: SoINode | undefined, key: string): string {
  const v = n?.properties?.[key];
  if (v == null || v === "null") return "";
  return String(v);
}

function header(soiHid: string, title: string, byHid: Map<string, SoINode>): string {
  const sys = byHid.get(soiHid);
  return [
    `# ${title}`,
    "",
    `**System of Interest:** ${prop(sys, "Name")} (${soiHid})`,
    `**Description:** ${prop(sys, "ShortDescription") || prop(sys, "LongDescription") || "—"}`,
    `**Generated:** ${new Date().toISOString()} by SSTPA Tools`,
    "",
    "---",
    "",
  ].join("\n");
}

/** System Description (§6.5.3.6): hierarchical description of the SoI, its
 *  primary nodes and relationships, then secondary nodes and relationships. */
function systemDescription(
  soiHid: string,
  nodes: SoINode[],
  byHid: Map<string, SoINode>,
): string {
  let md = header(soiHid, "System Description", byHid);
  for (const type of SECTION_ORDER) {
    const group = nodes.filter((n) => n.typeName === type);
    if (group.length === 0) continue;
    md += `## ${displayName(type)} (${group.length})\n\n`;
    for (const n of group) {
      md += `### ${n.hid} — ${prop(n, "Name")}\n\n`;
      const desc = prop(n, "LongDescription") || prop(n, "ShortDescription");
      if (desc) md += `${desc}\n\n`;
      const rels = (n.relationships ?? []).filter((r) => r.targetHID);
      if (rels.length > 0) {
        md += "Relationships:\n\n";
        for (const r of rels) {
          const target = byHid.get(r.targetHID);
          md += `- \`[:${r.type}]\` → ${r.targetHID}${target ? ` (${prop(target, "Name")})` : ""}\n`;
        }
        md += "\n";
      }
    }
  }
  return md;
}

/** System Specification (§6.5.3.7): requirements organized by the bearer node
 *  they relate to, one section per primary type with [:HAS_REQUIREMENT]. */
function systemSpecification(
  soiHid: string,
  nodes: SoINode[],
  byHid: Map<string, SoINode>,
): string {
  let md = header(soiHid, "System Specification", byHid);
  for (const type of ["Purpose", "Connection", "Interface", "SystemFunction", "Component", "Constraint", "Countermeasure", "SecurityControl"]) {
    const bearers = nodes.filter(
      (n) =>
        n.typeName === type &&
        (n.relationships ?? []).some((r) => r.type === "HAS_REQUIREMENT"),
    );
    if (bearers.length === 0) continue;
    md += `## Requirements on ${displayName(type)} nodes\n\n`;
    for (const b of bearers) {
      md += `### ${b.hid} — ${prop(b, "Name")}\n\n`;
      const reqs = (b.relationships ?? [])
        .filter((r) => r.type === "HAS_REQUIREMENT")
        .map((r) => byHid.get(r.targetHID))
        .filter((r): r is SoINode => !!r)
        .sort((a, b2) => a.hid.localeCompare(b2.hid));
      let i = 1;
      for (const rq of reqs) {
        md += `${i}. \`${rq.uuid}\` ${prop(rq, "RStatement") || prop(rq, "Name")}\n`;
        i++;
      }
      md += "\n";
    }
  }
  return md;
}

/** Gap Analysis (§6.5.3.8): identifies problematic requirements; computes and
 *  COMMITS Orphan/Barren per the §6.5.3.8 definitions (see note I-10). */
async function gapAnalysis(
  ctx: ToolLaunchContext,
  nodes: SoINode[],
  byHid: Map<string, SoINode>,
): Promise<string> {
  const requirements = nodes.filter((n) => n.typeName === "Requirement");

  // Incoming HAS_REQUIREMENT sources and PARENTS per requirement.
  const incomingBearers = new Map<string, string[]>();
  const hasParent = new Map<string, boolean>();
  const hasChild = new Map<string, boolean>();
  for (const n of nodes) {
    for (const r of n.relationships ?? []) {
      if (r.type === "HAS_REQUIREMENT" && byHid.get(r.targetHID)?.typeName === "Requirement") {
        incomingBearers.set(r.targetHID, [
          ...(incomingBearers.get(r.targetHID) ?? []),
          n.typeName,
        ]);
      }
      if (r.type === "PARENTS" && n.typeName === "Requirement") {
        hasChild.set(n.hid, true);
        hasParent.set(r.targetHID, true);
      }
    }
  }

  const rows = requirements.map((rq) => {
    const bearers = incomingBearers.get(rq.hid) ?? [];
    const nonPurpose = bearers.filter((b) => b !== "Purpose");
    const orphan = !hasParent.get(rq.hid); // §6.5.3.8: no parent Requirement
    const barren = !hasChild.get(rq.hid) || nonPurpose.length === 0; // §6.5.3.8
    return { rq, orphan, barren, baseline: prop(rq, "Baseline") };
  });

  // Persist the computed flags (report generation SHALL set them, §6.5.3.8).
  const ops = rows
    .filter(
      ({ rq, orphan, barren }) =>
        rq.properties.Orphan !== orphan || rq.properties.Barren !== barren,
    )
    .map(({ rq, orphan, barren }) => ({
      op: "updateNode" as const,
      hid: rq.hid,
      properties: { Orphan: orphan, Barren: barren },
    }));
  if (ops.length > 0) {
    await api.commit({
      soiHid: ctx.soiHid ?? undefined,
      toolId: "sstpa.reports",
      operations: ops,
    });
  }

  let md = header(ctx.soiHid!, "Requirement-Traceability Gap Analysis", byHid);
  const problems = rows.filter((r) => r.orphan || r.barren);
  md += `**${problems.length} of ${rows.length} requirements need remediation.**\n\n`;
  md += "| UUID | HID | Baseline | Orphan | Barren | Remediation |\n";
  md += "|---|---|---|---|---|---|\n";
  for (const { rq, orphan, barren, baseline } of rows) {
    if (!orphan && !barren) continue;
    const fixes = [];
    if (orphan) fixes.push("re-parent or remove");
    if (barren) fixes.push("allocate to Interface/Function/Element or add child");
    md += `| \`${rq.uuid}\` | ${rq.hid} | ${baseline || "—"} | ${orphan} | ${barren} | ${fixes.join("; ")} |\n`;
  }
  md += "\n## Compliant requirements\n\n";
  for (const { rq, orphan, barren } of rows) {
    if (orphan || barren) continue;
    md += `- \`${rq.uuid}\` ${rq.hid} ${prop(rq, "Name")}\n`;
  }
  return md;
}

/** Controls List: (:SecurityControl) nodes with satisfying countermeasures. */
function controlsList(
  soiHid: string,
  nodes: SoINode[],
  byHid: Map<string, SoINode>,
): string {
  let md = header(soiHid, "Controls List", byHid);
  const controls = nodes.filter((n) => n.typeName === "SecurityControl");
  const satisfies = new Map<string, string[]>();
  for (const cm of nodes.filter((n) => n.typeName === "Countermeasure")) {
    for (const r of cm.relationships ?? []) {
      if (r.type === "SATISFIES") {
        satisfies.set(r.targetHID, [...(satisfies.get(r.targetHID) ?? []), cm.hid]);
      }
    }
  }
  md += `**${controls.length} control(s) in this SoI.**\n\n`;
  for (const c of controls) {
    md += `## ${c.hid} — ${prop(c, "Name")}\n\n`;
    const ref = prop(c, "ReferenceID");
    if (ref) md += `Reference: ${ref} (${prop(c, "ReferenceFramework")})\n\n`;
    const desc = prop(c, "LongDescription") || prop(c, "ShortDescription");
    if (desc) md += `${desc}\n\n`;
    const cms = satisfies.get(c.hid) ?? [];
    md += cms.length
      ? `Satisfied by: ${cms.map((h) => `${h} (${prop(byHid.get(h), "Name")})`).join(", ")}\n\n`
      : `**Not yet satisfied by any Countermeasure.**\n\n`;
  }
  return md;
}

/** Minimal Markdown → HTML for Word/print output. */
function mdToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  let html = "";
  let inTable = false;
  let inList = false;
  for (const line of lines) {
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      if (!inTable) {
        html += "<table border='1' cellspacing='0' cellpadding='4'>";
        inTable = true;
        html += "<tr>" + cells.map((c) => `<th>${esc(c)}</th>`).join("") + "</tr>";
        continue;
      }
      html += "<tr>" + cells.map((c) => `<td>${esc(c)}</td>`).join("") + "</tr>";
      continue;
    }
    if (inTable) {
      html += "</table>";
      inTable = false;
    }
    const listItem = /^[-*] (.*)/.exec(line) || /^\d+\. (.*)/.exec(line);
    if (listItem) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inline(esc(listItem[1]))}</li>`;
      continue;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    const h = /^(#{1,4}) (.*)/.exec(line);
    if (h) {
      const lvl = h[1].length;
      html += `<h${lvl}>${inline(esc(h[2]))}</h${lvl}>`;
    } else if (line.trim() === "---") {
      html += "<hr/>";
    } else if (line.trim() !== "") {
      html += `<p>${inline(esc(line))}</p>`;
    }
  }
  if (inTable) html += "</table>";
  if (inList) html += "</ul>";
  return `<!doctype html><html><head><meta charset="utf-8"><title>SSTPA Report</title>
<style>body{font-family:Georgia,serif;color:#1b2a4a;max-width:900px;margin:2em auto;line-height:1.5}
table{border-collapse:collapse;font-size:0.9em}th{background:#f0ece0}
code{font-family:monospace;background:#f4f1e8;padding:0 3px}</style></head><body>${html}</body></html>`;

  function inline(s: string): string {
    return s
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }
}

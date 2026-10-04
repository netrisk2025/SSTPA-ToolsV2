import type { AttackTree } from "./types";
import { analyzePaths } from "./paths";
import { visibleNodes, descendants } from "./graph";
import { evaluateMetrics } from "./metrics";
import { nodeSize } from "./layout";
import {
  NODE_PROPERTY_OPTIONS,
  nodePropertyValue,
  selectedNodePropertyKeys,
  selectedMetricPropertyKeys,
} from "./identity";
export const formatMetric = (value: unknown) =>
  value === null || value === undefined
    ? "Unknown / unbounded"
    : typeof value === "number"
      ? new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 4,
          notation: Math.abs(value) >= 1000000 ? "compact" : "standard",
        }).format(value)
      : String(value);
export function csvCell(v: unknown) {
  let s = String(v ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function pathsCSV(tree: AttackTree) {
  const p = analyzePaths(tree),
    m = evaluateMetrics(tree);
  const keys = tree.root.MetricDefinitionsJSON.map((r) => r.id);
  const rows = [
    [
      "Tree",
      "Revision",
      "Exact paths",
      "Materialized",
      "Truncated",
      "Metric scope",
      "Core status",
      "Core validation findings",
      "Path",
      "HIDs",
      "Names",
      "Status",
      "Rationale",
      ...keys,
    ],
  ];
  for (const path of p.paths)
    rows.push([
      tree.name,
      String(tree.revision),
      p.total,
      String(p.paths.length),
      String(p.truncated),
      "Terminal leaf projection; not a complete AND scenario",
      tree.core?.status ?? "Standalone fixture",
      tree.core?.findings.map(f=>`${f.severity}: ${f.message}`).join(" | ") ?? "",
      path.id,
      path.nodeIds
        .map((id) => tree.nodes.find((n) => n.id === id)!.hid)
        .join(" → "),
      path.nodeIds
        .map((id) => tree.nodes.find((n) => n.id === id)!.label)
        .join(" → "),
      path.status,
      path.reason,
      ...keys.map((k) => formatMetric(m.byNode[path.terminalId]?.values[k])),
    ]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}
export function evidenceMarkdown(tree: AttackTree) {
  const coreEvidence=tree.core ? `## Core model validity\n\nStatus: ${tree.core.status}; loaded Core revision: ${tree.core.loadedVersion}.\n\n${tree.core.findings.map(f=>`- ${f.severity} ${f.type}: ${f.message}`).join('\n') || 'No Core reconciliation findings.'}\n\nNumerical completeness does not establish Core model validity.\n\n` : '';
  const p = analyzePaths(tree),
    m = evaluateMetrics(tree);
  return `# SSTPA Loss Tool evidence\n\nTree: ${tree.name} (${tree.nodes.find((n) => n.id === tree.rootId)!.hid})\n\nRevision: ${tree.revision}; exported ${new Date().toISOString()}\n\nPaths: ${p.total} exact; ${p.paths.length} materialized; truncated: ${p.truncated}; unaddressed RVs: ${p.rvCount}.\n\nProfile: ${tree.root.AnalysisProfileJSON.mode}; analysis complete: ${m.complete}; scenario: ${m.root.selectedScenarioId ?? "none"}.\n\nAnalyst-staged model; verify commit revision before baselining. Paths are routes, not full AND scenarios. Leaf-only effects and declared independence assumptions apply.\n\n${coreEvidence}## Root metric values\n\n${Object.entries(
    m.root.values,
  )
    .map(([k, v]) => `- ${k}: ${formatMetric(v)}`)
    .join(
      "\n",
    )}\n\n## Findings\n\n${m.warnings.map((w) => "- " + w).join("\n") || "No metric findings."}\n\n## Terminal evidence\n\n${p.paths.map((path) => `- ${path.nodeIds.map((id) => tree.nodes.find((n) => n.id === id)!.hid).join(" → ")}: **${path.status}** ${path.reason}`).join("\n")}\n\n## Root rules and assumptions\n\n\`\`\`json\n${JSON.stringify({ rules: tree.root.MetricDefinitionsJSON, analysis: tree.root.AnalysisProfileJSON }, null, 2)}\n\`\`\`\n`;
}
const esc = (v: unknown) =>
  String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
/** Exports the entire visible projection, including offscreen cards; never silently claims a full expanded tree. */
export function diagramSVG(tree: AttackTree) {
  const visible = visibleNodes(tree),
    { width: w, height: h } = nodeSize(tree),
    pos = tree.root.AttackTreeJSON.positions,
    m = evaluateMetrics(tree),
    view = tree.root.AttackTreeJSON;
  const ns = tree.nodes.filter((n) => visible.has(n.id));
  const minX = Math.min(0, ...ns.map((n) => pos[n.id]?.x ?? 0)) - 40,
    minY = Math.min(0, ...ns.map((n) => pos[n.id]?.y ?? 0)) - 100;
  const maxX = Math.max(...ns.map((n) => (pos[n.id]?.x ?? 0) + w)) + 40,
    maxY = Math.max(...ns.map((n) => (pos[n.id]?.y ?? 0) + h)) + 80;
  const dark = view.theme === "nocturne",
    ink = dark ? "#e5e0d6" : "#2c2416";
  const markers = Object.entries(view.nodeStyles)
    .map(
      ([type, style]) =>
        `<marker id="arrow-${type}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${style.line}"/></marker>`,
    )
    .join("");
  const edges = tree.edges
    .filter(
      (e) =>
        visible.has(e.source) &&
        visible.has(e.target) &&
        !view.collapsed.includes(e.source),
    )
    .map((e) => {
      const a = pos[e.source] ?? { x: 0, y: 0 },
        b = pos[e.target] ?? { x: 0, y: 0 },
        type = tree.nodes.find((n) => n.id === e.source)!.type,
        color = view.nodeStyles[type].line;
      const right = view.direction === "RIGHT";
      const x1 = a.x + (right ? w : w/2), y1 = a.y + (right ? h/2 : h),
        x2 = b.x + (right ? 0 : w/2), y2 = b.y + (right ? h/2 : 0),
        ym = (y1+y2)/2, xm=(x1+x2)/2;
      const route=right ? `M${x1},${y1} H${xm} V${y2} H${x2}` : `M${x1},${y1} V${ym} H${x2} V${y2}`;
      const state = e.tailoredOut
        ? " · TAILORED"
        : e.completeBlock
          ? " · BLOCKED"
          : e.allowedRV !== null
            ? " · ALLOWED RV"
            : "";
      return `<path d="${route}" fill="none" stroke="${color}" stroke-width="2" marker-end="url(#arrow-${type})" ${e.tailoredOut ? 'stroke-dasharray="7 5" opacity=".5"' : ""}/><text x="${(x1 + x2) / 2}" y="${ym - 5}" text-anchor="middle" fill="${ink}" font-size="11">${e.gate}${e.sequence !== null ? " " + e.sequence : ""}${state}</text>`;
    })
    .join("");
  const cards = ns
    .map((n) => {
      const p = pos[n.id] ?? { x: 0, y: 0 },
        s = view.nodeStyles[n.type],
        fold = view.collapsed.includes(n.id),
        values = m.byNode[n.id]?.values ?? {};
      const incoming = tree.edges.filter(
          (e) => e.target === n.id && !e.tailoredOut,
        ),
        children = tree.edges.filter(
          (e) => e.source === n.id && !e.tailoredOut,
        );
      const status =
        n.type === "Attack" && !children.length
          ? incoming.every((e) => e.allowedRV !== null)
            ? "ALLOWED RV"
            : incoming.some((e) => e.allowedRV !== null)
              ? "RV / ALLOWED BY EDGE"
              : "RV"
          : n.type === "Asset"
            ? "DERIVED"
            : incoming.some((e) => e.completeBlock)
              ? "BLOCKED BY EDGE"
              : "";
      let rowY = 97;
      const identityRows = selectedNodePropertyKeys(view)
        .map((key) => {
          const label = NODE_PROPERTY_OPTIONS.find((p) => p.key === key)!.label;
          const value = nodePropertyValue(n, key);
          const y = rowY;
          rowY += key === "provenance" ? 22 : 44;
          if (key === "provenance")
            return `<text x="12" y="${y}" fill="${s.font}" font-size="11">${esc(label)}: ${esc(value)}</text>`;
          return `<text x="12" y="${y}" fill="${s.font}" font-size="10">${esc(label)}</text><text x="12" y="${y + 15}" fill="${s.font}" font-family="monospace" font-size="9"><title>${esc(value)}</title>${esc(value.length > 42 ? value.slice(0, 41) + "…" : value)}</text>`;
        })
        .join("");
      const rows =
        identityRows +
        selectedMetricPropertyKeys(view)
          .map((k, i) => {
            const field = formatMetric(values[k]);
            const text = `${k}: ${field}`;
            return `<text x="12" y="${rowY + i * 22}" fill="${s.font}" font-size="11"><title>${esc(text)}</title>${esc(text.length > 39 ? text.slice(0, 38) + "…" : text)}</text>`;
          })
          .join("");
      return `<g transform="translate(${p.x},${p.y})"><title>${esc(n.label)} — ${esc(n.description)}</title><rect width="${w}" height="${h}" rx="12" fill="${s.box}" stroke="${fold ? "#855da5" : s.border}" stroke-width="2"/><text x="${w / 2}" y="20" text-anchor="middle" fill="${s.font}" font-size="10">${n.type}</text><text x="${w / 2}" y="43" text-anchor="middle" fill="${s.font}" font-size="13">${esc(n.label.length > 32 ? n.label.slice(0, 31) + "…" : n.label)}</text><path d="M0 56 H${w}" stroke="${s.border}"/><text x="12" y="75" fill="${s.font}" font-size="10">${esc(n.hid)}</text>${rows}<text x="12" y="${h - 22}" fill="${s.font}" font-size="9">${status}${incoming.length > 1 ? " · SHARED" : ""}</text>${!n.authoritativeUuid ? `<text x="12" y="${h - 8}" fill="${s.font}" font-size="9">not yet committed</text>` : ""}${fold ? `<path d="M${w / 2} ${h} v28 h35" fill="none" stroke="#855da5" stroke-width="3" stroke-dasharray="5 3"/><text x="${w / 2 + 40}" y="${h + 30}" font-size="12" fill="#855da5">${[...descendants(tree, n.id)].filter(id=>!visible.has(id)).length} folded descendants</text>` : ""}</g>`;
    })
    .join("");
  const detail = `Core status: ${tree.core?.status ?? "Standalone fixture"}; Core findings: ${tree.core?.findings.map(f=>`${f.severity}: ${f.message}`).join(" | ") || "none"}. Numerical completeness is separate from Core validity. ${tree.nodes.length} semantic nodes; ${ns.length} rendered. Folded branches omitted. Analysis complete: ${m.complete}. Includes offscreen visible cards. Asset: ${tree.root.asset}; Environment: ${tree.root.environment}; Criticality: ${tree.root.criticality}; Assurance: ${tree.root.assurance}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}"><title>${esc(tree.name)} — visible projection, revision ${tree.revision}</title><desc>${esc(detail)}</desc><defs>${markers}</defs><rect x="${minX}" y="${minY}" width="100%" height="100%" fill="${dark ? "#171f2b" : "#ede4d4"}"/><g font-family="system-ui,sans-serif" fill="${ink}"><text x="${minX + 20}" y="${minY + 30}" font-size="18">${esc(tree.name)} · revision ${tree.revision}</text><text x="${minX + 20}" y="${minY + 50}" font-size="11">Visible projection · ${ns.length} / ${tree.nodes.length} semantic nodes · ${esc(new Date().toISOString())}</text>${edges}${cards}</g></svg>`;
}
export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

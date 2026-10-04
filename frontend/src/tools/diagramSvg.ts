// Original SSTPA vector exporter. Uses only Cytoscape's documented public API.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
import type { Core, EdgeSingular, NodeSingular, Position } from "cytoscape";

const xml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
    // XML permits tab/newline/CR but excludes the other C0 controls.
    .split("")
    .filter(
      (c) => c.charCodeAt(0) >= 32 || c === "\t" || c === "\n" || c === "\r",
    )
    .join("");
const n = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
const point = (p: Position) => `${n(p.x)} ${n(p.y)}`;
const valid = (p: Position | undefined): p is Position =>
  !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
const mean = (a: Position, b: Position) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
const style = (el: NodeSingular | EdgeSingular, key: string, fallback = "") =>
  String(el.style(key) ?? fallback);
const num = (
  el: NodeSingular | EdgeSingular,
  key: string,
  fallback: number,
) => {
  const value = Number.parseFloat(style(el, key));
  return Number.isFinite(value) ? value : fallback;
};
const dash = (line: string, width: number) =>
  line === "dashed"
    ? ` stroke-dasharray="${n(width * 4)} ${n(width * 3)}"`
    : line === "dotted"
      ? ` stroke-dasharray="${n(width)} ${n(width * 2)}" stroke-linecap="round"`
      : "";

/** Preserve the product's type shapes as vector geometry; rounded polygon
 * corners use quadratic arcs rather than converting the canvas to a bitmap. */
function shape(node: NodeSingular) {
  const p = node.position(),
    w = node.width(),
    h = node.height();
  const type = style(node, "shape", "ellipse");
  if (type === "ellipse")
    return `<ellipse cx="${n(p.x)}" cy="${n(p.y)}" rx="${n(w / 2)}" ry="${n(h / 2)}"/>`;
  if (type.includes("rectangle"))
    return `<rect x="${n(p.x - w / 2)}" y="${n(p.y - h / 2)}" width="${n(w)}" height="${n(h)}" rx="${type.includes("round") ? n(Math.min(w, h) / 6) : 0}"/>`;
  let coords: Position[];
  const base = type.replace(/^round-/, "");
  if (base === "tag")
    coords = [
      { x: -1, y: -1 },
      { x: 0.4, y: -1 },
      { x: 1, y: 0 },
      { x: 0.4, y: 1 },
      { x: -1, y: 1 },
    ];
  else if (base === "vee")
    coords = [
      { x: -1, y: -1 },
      { x: 0, y: -0.35 },
      { x: 1, y: -1 },
      { x: 0, y: 1 },
    ];
  else if (base === "diamond")
    coords = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];
  else {
    const sides =
      (
        {
          triangle: 3,
          pentagon: 5,
          hexagon: 6,
          heptagon: 7,
          octagon: 8,
          star: 10,
        } as Record<string, number>
      )[base] ?? 4;
    coords = Array.from({ length: sides }, (_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      const radius = base === "star" && i % 2 ? 0.42 : 1;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
  }
  const ps = coords.map((c) => ({
    x: p.x + (c.x * w) / 2,
    y: p.y + (c.y * h) / 2,
  }));
  if (!type.startsWith("round-"))
    return `<polygon points="${ps.map(point).join(" ")}"/>`;
  const inset = (a: Position, b: Position) => ({
    x: a.x + (b.x - a.x) * 0.13,
    y: a.y + (b.y - a.y) * 0.13,
  });
  const segments = ps.map((c, i) => {
    const before = inset(c, ps[(i + ps.length - 1) % ps.length]);
    const after = inset(c, ps[(i + 1) % ps.length]);
    return `${i ? "L" : "M"}${point(before)} Q${point(c)} ${point(after)}`;
  });
  return `<path d="${segments.join(" ")} Z"/>`;
}

function label(
  el: NodeSingular | EdgeSingular,
  at: Position,
  node?: NodeSingular,
) {
  const content = style(el, "label");
  if (!content) return "";
  const size = num(el, "font-size", 12),
    max = num(el, "text-max-width", 200);
  const capacity = Math.max(1, Math.floor(max / (size * 0.56)));
  const lines = content.split("\n").flatMap((line) => {
    if (style(el, "text-wrap") !== "wrap" || line.length <= capacity)
      return [line];
    const result: string[] = [];
    let current = "";
    for (const word of line.split(/\s+/)) {
      if (current && current.length + word.length + 1 > capacity) {
        result.push(current);
        current = "";
      }
      // Long identifiers wrap too, so exported cards keep their bounds.
      let rest = word;
      while (rest.length > capacity) {
        if (current) {
          result.push(current);
          current = "";
        }
        result.push(rest.slice(0, capacity));
        rest = rest.slice(capacity);
      }
      current += (current ? " " : "") + rest;
    }
    if (current) result.push(current);
    return result;
  });
  const lineHeight = size * 1.2;
  let x = at.x + num(el, "text-margin-x", 0),
    y =
      at.y +
      num(el, "text-margin-y", 0) -
      ((lines.length - 1) * lineHeight) / 2;
  let anchor = "middle";
  if (node) {
    const valign = style(el, "text-valign"),
      halign = style(el, "text-halign");
    if (valign === "bottom")
      y = at.y + node.height() / 2 + size / 2 + num(el, "text-margin-y", 0);
    if (valign === "top")
      y =
        at.y -
        node.height() / 2 -
        size / 2 -
        (lines.length - 1) * lineHeight +
        num(el, "text-margin-y", 0);
    if (halign === "left") {
      x -= node.width() / 2;
      anchor = "end";
    }
    if (halign === "right") {
      x += node.width() / 2;
      anchor = "start";
    }
  }
  const outline = num(el, "text-outline-width", 0);
  const opacity = num(el, "text-opacity", 1);
  const width = Math.max(...lines.map((l) => l.length), 1) * size * 0.56,
    pad = num(el, "text-background-padding", 2);
  const bg = num(el, "text-background-opacity", 0);
  const background =
    bg > 0
      ? `<rect x="${n(x - width / 2 - pad)}" y="${n(y - size / 2 - pad)}" width="${n(width + pad * 2)}" height="${n(lines.length * lineHeight + pad * 2)}" fill="${xml(style(el, "text-background-color", "white"))}" opacity="${n(bg)}"/>`
      : "";
  return `${background}<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" dominant-baseline="central" fill="${xml(style(el, "color", "black"))}" font-size="${n(size)}" font-family="${xml(style(el, "font-family", "sans-serif"))}" font-weight="${xml(style(el, "font-weight", "normal"))}" opacity="${n(opacity)}"${outline ? ` stroke="${xml(style(el, "text-outline-color", "white"))}" stroke-width="${n(outline * 2)}" paint-order="stroke" stroke-linejoin="round"` : ""}>${lines.map((line, i) => `<tspan x="${n(x)}" dy="${i ? n(lineHeight) : 0}">${xml(line)}</tspan>`).join("")}</text>`;
}

function edgeGeometry(edge: EdgeSingular) {
  // Public renderer geometry is available in browser exports. Headless clients
  // get a straight-line fallback; no private renderer state is read.
  const headless = !edge.cy().container();
  const start = headless ? undefined : edge.sourceEndpoint(),
    end = headless ? undefined : edge.targetEndpoint();
  const a = valid(start) ? start : edge.source().position();
  const b = valid(end) ? end : edge.target().position();
  const controls = (headless ? [] : (edge.controlPoints() ?? [])).filter(valid);
  const bends = (headless ? [] : (edge.segmentPoints() ?? [])).filter(valid);
  let d = `M${point(a)}`;
  if (controls.length)
    controls.forEach((c, i) => {
      d += ` Q${point(c)} ${point(i === controls.length - 1 ? b : mean(c, controls[i + 1]))}`;
    });
  else d += [...bends, b].map((p) => ` L${point(p)}`).join("");
  return {
    d,
    a,
    b,
    first: controls[0] ?? bends[0] ?? b,
    last: controls.at(-1) ?? bends.at(-1) ?? a,
  };
}

function arrow(
  edge: EdgeSingular,
  which: "source" | "target",
  tip: Position,
  from: Position,
) {
  const type = style(edge, `${which}-arrow-shape`, "none");
  if (type === "none") return "";
  const size =
    Math.max(5, num(edge, "width", 1) * 4 + 5) * num(edge, "arrow-scale", 1);
  const angle = (Math.atan2(tip.y - from.y, tip.x - from.x) * 180) / Math.PI;
  const color = xml(
    style(edge, `${which}-arrow-color`, style(edge, "line-color", "black")),
  );
  const fill =
    style(edge, `${which}-arrow-fill`) === "hollow" ? "white" : color;
  const geometry =
    type === "circle"
      ? `<circle cx="${n(-size / 2)}" cy="0" r="${n(size / 2)}"/>`
      : type === "diamond"
        ? `<path d="M0 0 L${n(-size / 2)} ${n(-size / 2)} L${n(-size)} 0 L${n(-size / 2)} ${n(size / 2)} Z"/>`
        : `<path d="M0 0 L${n(-size)} ${n(-size / 2)} L${n(-size)} ${n(size / 2)} Z"/>`;
  return `<g transform="translate(${point(tip)}) rotate(${n(angle)})" fill="${fill}" stroke="${color}" stroke-width="1">${geometry}</g>`;
}

/** Generate a self-contained vector snapshot of a full graph or current view.
 * Label wrapping is deterministic approximate typography; see SVG-EXPORT.md. */
export function diagramSvg(cy: Core, full = true): string {
  const elements = cy.elements().filter((el) => el.visible());
  const bounds = full
    ? elements.boundingBox({ includeLabels: true, includeOverlays: false })
    : cy.extent();
  const pad = full ? 16 : 0;
  const x = Number.isFinite(bounds.x1) ? bounds.x1 - pad : 0,
    y = Number.isFinite(bounds.y1) ? bounds.y1 - pad : 0;
  const w = Math.max(1, Number.isFinite(bounds.w) ? bounds.w + pad * 2 : 1),
    h = Math.max(1, Number.isFinite(bounds.h) ? bounds.h + pad * 2 : 1);
  const paths = elements
    .edges()
    .map((edge) => {
      const g = edgeGeometry(edge),
        width = num(edge, "width", 1),
        center = !cy.container() ? undefined : edge.midpoint();
      return `<g data-edge="${xml(edge.id())}" opacity="${n(edge.effectiveOpacity())}"><path d="${g.d}" fill="none" stroke="${xml(style(edge, "line-color", "black"))}" stroke-width="${n(width)}"${dash(style(edge, "line-style"), width)}/>${arrow(edge, "source", g.a, g.first)}${arrow(edge, "target", g.b, g.last)}${label(edge, valid(center) ? center : mean(g.a, g.b))}</g>`;
    })
    .join("");
  const nodes = elements
    .nodes()
    .toArray()
    .sort((a, b) => a.ancestors().length - b.ancestors().length)
    .map((node) => {
      const border = num(node, "border-width", 0),
        nodeShape = shape(node);
      const double =
        style(node, "border-style") === "double" && border > 0
          ? `<g fill="none" stroke="${xml(style(node, "background-color", "white"))}" stroke-width="${n(border / 3)}">${nodeShape}</g>`
          : "";
      return `<g data-node="${xml(node.id())}" opacity="${n(node.effectiveOpacity())}"><g fill="${xml(style(node, "background-color", "white"))}" fill-opacity="${n(num(node, "background-opacity", 1))}" stroke="${xml(style(node, "border-color", "black"))}" stroke-width="${n(border)}"${dash(style(node, "border-style"), border)}>${nodeShape}</g>${double}${label(node, node.position(), node)}</g>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${n(full ? w : cy.width())}" height="${n(full ? h : cy.height())}" viewBox="${n(x)} ${n(y)} ${n(w)} ${n(h)}"><title>SSTPA Tools diagram</title><desc>Vector export of ${full ? "full graph" : "current viewport"}; editable text and geometry.</desc><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="white"/>${paths}${nodes}</svg>`;
}

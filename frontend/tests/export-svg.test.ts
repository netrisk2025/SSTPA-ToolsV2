import { describe, it, expect, afterEach } from "vitest";
import cytoscape, { type Core } from "cytoscape";
import { diagramSvg } from "../src/tools/diagramSvg";
const graphs: Core[] = [];
function graph() {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: [
      {
        data: { id: "a", label: '<script> & "quoted"' },
        position: { x: 40, y: 50 },
      },
      { data: { id: "b", label: "Second" }, position: { x: 240, y: 250 } },
      { data: { id: "e", source: "a", target: "b", label: "OR & review" } },
    ],
    layout: { name: "preset" },
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          shape: "round-rectangle",
          width: 80,
          height: 50,
          "background-color": "#abcdef",
          "border-width": 2,
          "border-color": "#123456",
          "font-size": 12,
          "text-valign": "center",
        },
      },
      {
        selector: "edge",
        style: {
          label: "data(label)",
          "target-arrow-shape": "triangle",
          "line-color": "#123456",
          "line-style": "dashed",
          "curve-style": "straight",
          width: 2,
        },
      },
    ],
  });
  graphs.push(cy);
  return cy;
}
afterEach(() => graphs.splice(0).forEach((c) => c.destroy()));
describe("original SVG graph export", () => {
  it("contains editable vector geometry and safely escaped labels", () => {
    const svg = diagramSvg(graph());
    expect(svg).toContain("<svg");
    expect(svg).toContain("<rect");
    expect(svg).toContain('data-edge="e"');
    expect(svg).toContain("&lt;script&gt; &amp; &quot;quoted&quot;");
    expect(svg).not.toContain("<script>");
    expect(svg).not.toMatch(/<image|data:image|NaN|Infinity/);
    expect(svg).toContain("stroke-dasharray");
    expect(svg).toContain("rotate(");
  });
  it("uses full bounds or viewport extent without changing graph state", () => {
    const cy = graph();
    cy.zoom(2);
    cy.pan({ x: 50, y: 60 });
    const before = cy.json();
    const full = diagramSvg(cy, true),
      viewport = diagramSvg(cy, false);
    expect(full).not.toEqual(viewport);
    expect(viewport).toContain("current viewport");
    expect(cy.json()).toEqual(before);
  });
  it("omits hidden nodes and connected edges", () => {
    const cy = graph();
    cy.$id("b").style("display", "none");
    const svg = diagramSvg(cy);
    expect(svg).not.toContain('data-node="b"');
    expect(svg).not.toContain('data-edge="e"');
  });
  it("supports every shape currently assigned by the Navigator", () => {
    const cy = graph();
    for (const shape of [
      "rectangle",
      "round-rectangle",
      "ellipse",
      "round-hexagon",
      "diamond",
      "round-octagon",
      "round-tag",
      "round-pentagon",
      "star",
      "tag",
      "vee",
      "triangle",
      "heptagon",
    ]) {
      cy.$id("a").style("shape", shape);
      expect(diagramSvg(cy)).not.toMatch(/NaN|Infinity/);
    }
  });
  it("exports an empty diagram with valid nonzero bounds", () => {
    const cy = graph();
    cy.elements().remove();
    expect(diagramSvg(cy)).not.toMatch(/NaN|Infinity/);
    expect(diagramSvg(cy)).toContain('viewBox="-16 -16 32 32"');
  });
});

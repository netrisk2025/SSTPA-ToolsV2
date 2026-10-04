import { describe, it, expect } from "vitest";
import { createOverview } from "./examples";
import {
  csvCell,
  diagramSVG,
  evidenceMarkdown,
  pathsCSV,
} from "../../src/tools/loss/domain/export";

describe("portable analytical evidence [6.4]", () => {
  it("neutralizes formula cells and preserves CSV quote/newline content", () => {
    for (const s of [
      '=HYPERLINK("https://example.test")',
      "+1+2",
      "-2+3",
      "@SUM(1)",
      "  =1+1",
    ])
      expect(csvCell(s)).toMatch(/^"'/);
    expect(csvCell('ordinary, "quoted"\nlabel')).toBe(
      '"ordinary, ""quoted""\nlabel"',
    );
  });
  it("exports path completeness, metric scope, status and documented rationale", () => {
    const t = createOverview(),
      csv = pathsCSV(t);
    expect(csv).toContain('"Exact paths"');
    expect(csv).toContain('"Truncated"');
    expect(csv).toContain(
      "Terminal leaf projection; not a complete AND scenario",
    );
    expect(csv).toContain('"AttackCost"');
    expect(csv).toContain('"ALLOWED"');
    expect(csv).toContain('"BLOCKED"');
    expect(csv).toContain(
      t.edges.find((e) => e.allowedRV !== null)!.allowedReason,
    );
  });
  it("exports complete root rules and RV rationale in Markdown", () => {
    const t = createOverview(),
      md = evidenceMarkdown(t);
    expect(md).toContain("Root rules and assumptions");
    expect(md).toContain("unaddressed RVs:");
    expect(md).toContain("Illustrative");
    expect(md).toContain(
      t.edges.find((e) => e.allowedRV !== null)!.allowedReason,
    );
    expect(md).toContain("AttackCost");
    expect(md).toContain("analysis complete:");
  });
  it("includes visible offscreen cards and discloses folded content in SVG", () => {
    const t = createOverview();
    t.nodes.forEach((n, i) => {
      t.root.AttackTreeJSON.positions[n.id] = { x: i * 400, y: i * 600 };
    });
    const svg = diagramSVG(t);
    expect(svg).toContain("EL_1.1.2_3");
    expect(svg).toContain("DEMO_REVIEW_BYPASS");
    expect(svg).toContain("Includes offscreen visible cards.");
    expect(svg).toContain("marker-end=");
    expect(svg).toContain("ALLOWED RV");
    expect(svg).toContain("BLOCKED");
    expect(svg).toContain("Authenticity");
    t.root.AttackTreeJSON.collapsed = ["processor"];
    const folded = diagramSVG(t);
    expect(folded).toContain("folded descendants");
    expect(folded).toContain("Folded branches omitted");
    expect(folded).not.toContain("DEMO_KEYTHEFT");
    expect(t.root.AttackTreeJSON.collapsed).toEqual(["processor"]);
  });
  it("escapes labels embedded in SVG/XML", () => {
    const t = createOverview();
    t.nodes.find((n) => n.id === "diagnostic")!.label = "<script>& attack";
    const svg = diagramSVG(t);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;&amp; attack");
  });
  it("exports tree identity and full authoritative UUID separately from attack metrics", () => {
    const t = createOverview();
    t.root.AttackTreeJSON.selectedNodeProperties = [
      "nodeId",
      "authoritativeUuid",
    ];
    const processor = t.nodes.find((n) => n.id === "processor")!;
    processor.authoritativeUuid = "9b7f2ac0-9465-4d81-b305-107a205ab741";
    const svg = diagramSVG(t);
    expect(svg).toContain("Node ID");
    expect(svg).toContain("Authoritative UUID");
    expect(svg).toContain(processor.authoritativeUuid);
    expect(svg).toContain("not yet committed");
    expect(svg).toContain("AttackCost");
    t.root.AttackTreeJSON.selectedNodeProperties = [];
    const withoutRows = diagramSVG(t);
    expect(withoutRows).not.toContain(processor.authoritativeUuid);
    expect(withoutRows).not.toContain("Authoritative UUID");
    expect(withoutRows).toContain("not yet committed");
  });
});

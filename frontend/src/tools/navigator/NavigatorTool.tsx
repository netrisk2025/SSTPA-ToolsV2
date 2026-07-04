// The Navigator Tool (SRS §6.5.1): traverse the project hierarchy, select the
// current SoI, visualize the hierarchy as a graph (Cytoscape), and export the
// perspective as an image.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import cytoscape from "cytoscape";
// @ts-expect-error no types shipped for the fcose layout plugin
import fcose from "cytoscape-fcose";
import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { useSoI, useToolWindows } from "../../state/stores";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

cytoscape.use(fcose);

export default function NavigatorTool(_props: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  const { setSoI, soiHid } = useSoI();
  const closeTool = useToolWindows((s) => s.closeTool);
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [depth, setDepth] = useState(4);

  const hierarchy = useQuery({
    queryKey: ["hierarchy"],
    queryFn: api.hierarchy,
  });

  useEffect(() => {
    if (!containerRef.current || !hierarchy.data?.entries) return;
    const entries = hierarchy.data.entries;

    // Tier of each node (root = 0) to honor the depth filter.
    const tier = new Map<string, number>();
    const byHid = new Map(entries.map((e) => [e.hid, e]));
    const tierOf = (hid: string): number => {
      if (tier.has(hid)) return tier.get(hid)!;
      const e = byHid.get(hid);
      if (!e?.parentHid) {
        tier.set(hid, 0);
        return 0;
      }
      // parent may be a Component HID inside another SoI: resolve to its system
      const parentEntry = byHid.get(e.parentHid);
      const t = parentEntry
        ? tierOf(parentEntry.hid) + 1
        : (() => {
            const idx = e.parentHid.split("_")[1] ?? "";
            const sysHid = `SYS_${idx}_0`;
            return byHid.has(sysHid) ? tierOf(sysHid) + 1 : 1;
          })();
      tier.set(hid, t);
      return t;
    };
    entries.forEach((e) => tierOf(e.hid));

    const visible = entries.filter((e) => (tier.get(e.hid) ?? 0) <= depth);
    const visibleHids = new Set(visible.map((e) => e.hid));

    const nodes = visible.map((e) => ({
      data: {
        id: e.hid,
        label: `${e.hid}\n${e.name}`,
        type: e.typeName,
      },
    }));
    const edges = visible
      .filter((e) => e.parentHid)
      .map((e) => {
        // Edge from the parent's owning system (or the root) to this node.
        let source = e.parentHid!;
        if (!visibleHids.has(source)) {
          const idx = source.split("_")[1] ?? "";
          source = `SYS_${idx}_0`;
        }
        return { data: { source, target: e.hid, id: `${source}->${e.hid}` } };
      })
      .filter((e) => visibleHids.has(e.data.source));

    cyRef.current?.destroy();
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: {
            shape: "round-rectangle",
            "background-color": "var(--sstpa-node-fill, #fcfaf2)",
            "border-width": 1.5,
            "border-color": "#1b2a4a",
            label: "data(label)",
            "text-wrap": "wrap",
            "text-valign": "center",
            "font-size": 9,
            "font-family": "JetBrains Mono, monospace",
            width: 130,
            height: 44,
            color: "#1b2a4a",
          },
        },
        {
          selector: 'node[type = "Project"]',
          style: { "border-width": 3, "border-style": "double" },
        },
        {
          selector: "node:selected",
          style: { "border-color": "#a8853a", "border-width": 3 },
        },
        {
          selector: "edge",
          style: {
            width: 1.2,
            "line-color": "#7c89a0",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#7c89a0",
            "curve-style": "bezier",
          },
        },
      ],
      layout: {
        name: "fcose",
        animate: false,
        nodeSeparation: 90,
      } as cytoscape.LayoutOptions,
    });
    cy.on("select", "node", (ev) => setSelected(ev.target.id()));
    cy.on("unselect", "node", () => setSelected(null));
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [hierarchy.data, depth]);

  const exportPng = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const png = cy.png({ full: true, scale: 2, bg: "#faf7ee" });
    const a = document.createElement("a");
    a.href = png;
    a.download = "sstpa-hierarchy.png";
    a.click();
  };

  const selectedIsSystem = selected?.startsWith("SYS_") ?? false;

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--sstpa-sp-2)",
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        <label style={{ fontSize: "0.78rem" }}>
          Tier depth{" "}
          <input
            type="number"
            className="sstpa-input"
            style={{ width: 60, display: "inline-block" }}
            min={1}
            max={20}
            value={depth}
            onChange={(e) => setDepth(Math.max(1, parseInt(e.target.value || "1", 10)))}
          />
        </label>
        <span style={{ flex: 1 }} />
        <button
          className="sstpa-button"
          disabled={!selectedIsSystem}
          title="Make the selected System the current SoI"
          onClick={() => {
            if (selected) {
              setSoI(selected);
              closeTool("sstpa.navigator");
            }
          }}
        >
          Select as SoI
        </button>
        <button className="sstpa-button secondary" onClick={exportPng}>
          Export PNG
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ flex: 1, background: "var(--sstpa-canvas)" }}
      />
      <div className="tool-shell-footer">
        <span style={{ fontSize: "0.75rem", color: "var(--sstpa-navy-muted)" }}>
          {selected
            ? `Selected: ${selected}${selectedIsSystem ? "" : " (select a System node to change SoI)"}`
            : `Current SoI: ${soiHid ?? "none"} — click a node to select`}
        </span>
      </div>
    </div>
  );
}

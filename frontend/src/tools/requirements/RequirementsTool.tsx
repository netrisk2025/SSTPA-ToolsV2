// The Requirements Tool (SRS §6.5.2): hierarchical tier visualization of
// (:Requirement) nodes with user-selectable parent/child depth, allocation
// view, orphan/barren analysis, SysML 2-style requirement blocks, editing via
// the Data Drawer, and PNG export.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import cytoscape from "cytoscape";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/client";
import { useDrawer, useSession } from "../../state/stores";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

interface ReqRecord {
  hid: string;
  uuid: string;
  name: string;
  rStatement?: string;
  vMethod?: string;
  tier: number;
  soi: string;
  bearers: { hid: string; name: string; typeName: string }[];
  parents: string[];
  childCount: number;
  verificationCount: number;
  orphan: boolean;
  barren: boolean;
}

interface LineageNode {
  hid: string;
  name: string;
  rStatement?: string;
  tier: number;
  orphan: boolean;
  barren: boolean;
}

interface Lineage {
  focus: string;
  nodes: LineageNode[] | null;
  edges: { type: string; sourceHid: string; targetHid: string }[] | null;
  bearers?: { hid: string; name: string; typeName: string }[];
  verifications?: { hid: string; name: string }[];
}

function tokenHeader(): Record<string, string> {
  const token = useSession.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function RequirementsTool({
  ctx,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  // Initialize per §6.5.2.3: Hierarchy view centered on the drawer node when
  // it is a Requirement; Allocation view otherwise.
  const drawerIsReq = ctx.drawerNodeHid?.startsWith("REQ_") ?? false;
  const [view, setView] = useState<"hierarchy" | "allocation">(
    drawerIsReq ? "hierarchy" : "allocation",
  );
  const [focusHid, setFocusHid] = useState<string | null>(
    drawerIsReq ? ctx.drawerNodeHid : null,
  );
  const [history, setHistory] = useState<string[]>([]);
  const [up, setUp] = useState(3);
  const [down, setDown] = useState(3);

  const soiIndex = ctx.soiHid ? ctx.soiHid.split("_")[1] : "";

  const soiReqs = useQuery({
    queryKey: ["requirements", soiIndex],
    queryFn: async () => {
      const res = await fetch(
        `${ctx.backendBaseUrl}/api/requirements/soi/${encodeURIComponent(soiIndex)}`,
        { headers: tokenHeader() },
      );
      if (!res.ok) throw new Error("requirements query failed");
      return (await res.json()) as { requirements: ReqRecord[] | null };
    },
    enabled: !!ctx.soiHid,
  });

  const focusReq = (hid: string) => {
    if (focusHid) setHistory((h) => [...h, focusHid]);
    setFocusHid(hid);
    setView("hierarchy");
  };
  // Revert to prior context on back arrow (§6.5.2.4).
  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setFocusHid(prev);
    } else {
      setView("allocation");
      setFocusHid(null);
    }
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
        <button
          className="icon-button"
          title="Back to previous context"
          disabled={!focusHid && history.length === 0}
          onClick={goBack}
        >
          ←
        </button>
        <button
          className={`sstpa-button ${view === "allocation" ? "" : "secondary"}`}
          onClick={() => setView("allocation")}
        >
          Allocation View
        </button>
        <button
          className={`sstpa-button ${view === "hierarchy" ? "" : "secondary"}`}
          disabled={!focusHid}
          onClick={() => setView("hierarchy")}
        >
          Hierarchy View
        </button>
        {view === "hierarchy" && (
          <>
            <label style={{ fontSize: "0.76rem" }}>
              Up{" "}
              <input
                type="number"
                className="sstpa-input"
                style={{ width: 52, display: "inline-block" }}
                min={1}
                max={10}
                value={up}
                onChange={(e) => setUp(Math.max(1, +e.target.value || 1))}
              />
            </label>
            <label style={{ fontSize: "0.76rem" }}>
              Down{" "}
              <input
                type="number"
                className="sstpa-input"
                style={{ width: 52, display: "inline-block" }}
                min={1}
                max={10}
                value={down}
                onChange={(e) => setDown(Math.max(1, +e.target.value || 1))}
              />
            </label>
          </>
        )}
      </div>
      {view === "allocation" ? (
        <AllocationView
          ctx={ctx}
          records={soiReqs.data?.requirements ?? []}
          onFocus={focusReq}
        />
      ) : (
        <HierarchyView
          ctx={ctx}
          focusHid={focusHid!}
          up={up}
          down={down}
          onFocus={focusReq}
        />
      )}
    </div>
  );
}

/** Allocation View (§6.5.2.3/§6.5.2.14): requirements with bearers,
 *  orphan/barren flags, and allocation actions. */
function AllocationView({
  ctx,
  records,
  onFocus,
}: {
  ctx: ToolLaunchContext;
  records: ReqRecord[];
  onFocus: (hid: string) => void;
}) {
  const openDrawer = useDrawer((s) => s.openDrawer);
  const drawerOpen = useDrawer((s) => s.open);
  const qc = useQueryClient();
  const [associating, setAssociating] = useState<ReqRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orphans = records.filter((r) => r.orphan).length;
  const barrens = records.filter((r) => r.barren).length;

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "var(--sstpa-sp-3)" }}>
      {(orphans > 0 || barrens > 0) && (
        <div className="sstpa-alert-warning" style={{ marginBottom: 10 }}>
          {orphans} orphan / {barrens} barren requirement(s) in this SoI —
          allocate, parent, verify, or remove them (§6.5.2.1).
        </div>
      )}
      {error && <div className="sstpa-alert-warning">{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid var(--sstpa-navy)" }}>
            <th style={{ padding: "4px 8px" }}>HID</th>
            <th>Name</th>
            <th>Statement</th>
            <th>Tier</th>
            <th>Allocated to</th>
            <th>Flags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.hid} style={{ borderBottom: "1px solid var(--sstpa-line-soft)" }}>
              <td className="mono" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>
                {r.hid}
              </td>
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td
                style={{
                  maxWidth: 340,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={r.rStatement ?? ""}
              >
                {r.rStatement ?? ""}
              </td>
              <td>{r.tier}</td>
              <td style={{ fontSize: "0.72rem" }}>
                {r.bearers.map((b) => `${b.typeName}: ${b.name}`).join(", ") || "—"}
              </td>
              <td>
                {r.orphan && <span className="state-warn">orphan </span>}
                {r.barren && <span className="state-error">barren</span>}
              </td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button className="icon-button" title="Hierarchy view" onClick={() => onFocus(r.hid)}>
                  ⌘
                </button>
                <button
                  className="icon-button"
                  title="Edit in Data Drawer"
                  disabled={drawerOpen}
                  onClick={() => openDrawer({ mode: "edit", hid: r.hid })}
                >
                  ✎
                </button>
                <button
                  className="icon-button"
                  title="Allocate to a node"
                  onClick={() => setAssociating(r)}
                >
                  ⇄
                </button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 14, color: "var(--sstpa-navy-muted)" }}>
                No requirements in this SoI yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {associating && (
        <AllocateDialog
          ctx={ctx}
          req={associating}
          onClose={(err) => {
            setAssociating(null);
            if (err) setError(err);
            void qc.invalidateQueries({ queryKey: ["requirements"] });
          }}
        />
      )}
    </div>
  );
}

/** Allocate a requirement to a bearer node via [:HAS_REQUIREMENT], validated
 *  by the Backend (§6.5.2.14). */
function AllocateDialog({
  ctx,
  req,
  onClose,
}: {
  ctx: ToolLaunchContext;
  req: ReqRecord;
  onClose: (error?: string) => void;
}) {
  const soi = useQuery({
    queryKey: ["soi", ctx.soiHid],
    queryFn: () => api.soi(ctx.soiHid!),
    enabled: !!ctx.soiHid,
  });
  const candidates = (soi.data?.nodes ?? []).filter((n) =>
    [
      "Project",
      "Purpose",
      "Connection",
      "Interface",
      "SystemFunction",
      "Component",
      "Constraint",
      "Countermeasure",
      "SecurityControl",
    ].includes(n.typeName),
  );
  const [target, setTarget] = useState("");

  const commit = async () => {
    try {
      await api.commit({
        soiHid: ctx.soiHid ?? undefined,
        toolId: "sstpa.requirements",
        operations: [
          {
            op: "createRelationship",
            type: "HAS_REQUIREMENT",
            sourceHid: target,
            targetHid: req.hid,
          },
        ],
      });
      onClose();
    } catch (e) {
      onClose(String(e));
    }
  };

  return (
    <div className="sstpa-dialog-overlay" onClick={() => onClose()}>
      <div className="sstpa-frame sstpa-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Allocate {req.hid}</h2>
        <select className="sstpa-input" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select bearer node…</option>
          {candidates.map((c) => (
            <option key={c.hid} value={c.hid}>
              {c.typeName}: {String(c.properties.Name ?? c.hid)} ({c.hid})
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="sstpa-button secondary" onClick={() => onClose()}>
            Cancel
          </button>
          <button className="sstpa-button" disabled={!target} onClick={() => void commit()}>
            Allocate
          </button>
        </div>
      </div>
    </div>
  );
}

/** Hierarchy View (§6.5.2.6–§6.5.2.10): SysML 2-style requirement blocks,
 *  tiered layout, parent/child depth controls, selection detail panel,
 *  double-click recentering, PNG export (viewport or full, §6.5.2.16). */
function HierarchyView({
  ctx,
  focusHid,
  up,
  down,
  onFocus,
}: {
  ctx: ToolLaunchContext;
  focusHid: string;
  up: number;
  down: number;
  onFocus: (hid: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selected, setSelected] = useState<LineageNode | null>(null);
  const openDrawer = useDrawer((s) => s.openDrawer);
  const drawerOpen = useDrawer((s) => s.open);

  const lineage = useQuery({
    queryKey: ["req-lineage", focusHid, up, down],
    queryFn: async () => {
      const res = await fetch(
        `${ctx.backendBaseUrl}/api/requirements/lineage/${encodeURIComponent(focusHid)}?up=${up}&down=${down}`,
        { headers: tokenHeader() },
      );
      if (!res.ok) throw new Error("lineage query failed");
      return (await res.json()) as Lineage;
    },
  });

  const elements = useMemo(() => {
    if (!lineage.data) return [] as cytoscape.ElementDefinition[];
    const els: cytoscape.ElementDefinition[] = [];
    for (const n of lineage.data.nodes ?? []) {
      const stmt = (n.rStatement ?? "").slice(0, 90);
      els.push({
        data: {
          id: n.hid,
          label: `«requirement»\n${n.hid} · Tier ${n.tier}\n${n.name}\n${stmt}`,
          focus: n.hid === lineage.data!.focus,
          problem: n.orphan || n.barren,
        },
      });
    }
    for (const e of lineage.data.edges ?? []) {
      els.push({
        data: {
          id: `${e.sourceHid}->${e.targetHid}`,
          source: e.sourceHid,
          target: e.targetHid,
        },
      });
    }
    for (const b of lineage.data.bearers ?? []) {
      els.push({ data: { id: b.hid, label: `${b.typeName}\n${b.name}`, bearer: true } });
      els.push({
        data: {
          id: `${b.hid}=>${lineage.data.focus}`,
          source: b.hid,
          target: lineage.data.focus,
          label: "HAS_REQUIREMENT",
          assoc: true,
        },
      });
    }
    return els;
  }, [lineage.data]);

  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;
    cyRef.current?.destroy();
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            shape: "rectangle",
            "background-color": "#fcfaf2",
            "border-width": 1.5,
            "border-color": "#1b2a4a",
            label: "data(label)",
            "text-wrap": "wrap",
            "text-max-width": "180px",
            "text-valign": "center",
            "font-size": 8,
            "font-family": "JetBrains Mono, monospace",
            width: 200,
            height: 74,
            color: "#1b2a4a",
          },
        },
        { selector: "node[?focus]", style: { "border-width": 3, "border-color": "#a8853a" } },
        {
          selector: "node[?problem]",
          style: { "border-color": "#8c2f2f", "border-style": "dashed" },
        },
        {
          selector: "node[?bearer]",
          style: {
            shape: "round-rectangle",
            "background-color": "#eef2ee",
            "border-color": "#4a7a6f",
            width: 140,
            height: 44,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.4,
            "line-color": "#1b2a4a",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#1b2a4a",
            "curve-style": "bezier",
          },
        },
        {
          selector: "edge[?assoc]",
          style: {
            "line-color": "#4a7a6f",
            "target-arrow-color": "#4a7a6f",
            "line-style": "dashed",
            label: "data(label)",
            "font-size": 7,
            "text-rotation": "autorotate",
            color: "#4a7a6f",
          },
        },
      ],
      layout: { name: "breadthfirst", directed: true, spacingFactor: 1.15, animate: false },
    });
    cy.on("select", "node", (ev) => {
      const hid = ev.target.id();
      setSelected((lineage.data?.nodes ?? []).find((n) => n.hid === hid) ?? null);
    });
    cy.on("dbltap", "node", (ev) => {
      const hid = ev.target.id();
      if (hid.startsWith("REQ_")) onFocus(hid);
    });
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [elements, lineage.data, onFocus]);

  const exportPng = (full: boolean) => {
    const cy = cyRef.current;
    if (!cy) return;
    const a = document.createElement("a");
    a.href = cy.png({ full, scale: 2, bg: "#faf7ee" });
    a.download = `sstpa-requirements-${focusHid}.png`;
    a.click();
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <div
          ref={containerRef}
          style={{ position: "absolute", inset: 0, background: "var(--sstpa-canvas)" }}
        />
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
          <button className="icon-button" onClick={() => exportPng(false)} title="Export current viewport">
            PNG (view)
          </button>
          <button className="icon-button" onClick={() => exportPng(true)} title="Export full diagram">
            PNG (full)
          </button>
        </div>
        {lineage.isError && (
          <p className="tool-error" style={{ padding: 12 }}>
            {String(lineage.error)}
          </p>
        )}
      </div>
      {selected && (
        <div
          style={{
            width: 260,
            borderLeft: "var(--sstpa-border)",
            padding: "var(--sstpa-sp-3)",
            overflow: "auto",
            background: "var(--sstpa-ivory-raised)",
            fontSize: "0.8rem",
          }}
        >
          <div className="mono" style={{ fontSize: "0.7rem" }}>
            {selected.hid}
          </div>
          <div style={{ fontWeight: 700, margin: "4px 0" }}>{selected.name}</div>
          <p>{selected.rStatement ?? "(no statement)"}</p>
          <p>
            Tier {selected.tier}
            {selected.orphan && <span className="state-warn"> · orphan</span>}
            {selected.barren && <span className="state-error"> · barren</span>}
          </p>
          <button
            className="sstpa-button"
            disabled={drawerOpen}
            onClick={() => openDrawer({ mode: "edit", hid: selected.hid })}
          >
            Edit in Data Drawer
          </button>
        </div>
      )}
    </div>
  );
}

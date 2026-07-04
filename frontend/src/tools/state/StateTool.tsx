// The State Tool (SRS §6.5.5): SysML 2-aligned state-transition diagrams for
// the current SoI using (:State) nodes and [:TRANSITIONS_TO] relationships.
// Three modes: Diagram View, Context View, Criteria/Relationship View.
// Transition semantics via TransitionKind (FUNCTIONAL, COUNTERMEASURE_REQUIRED,
// BOTH); per-State StateSequence and [:VALID_IN] editing; PNG export.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cytoscape from "cytoscape";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/client";
import type { SoINode } from "../../api/types";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

const KIND_COLOR: Record<string, string> = {
  FUNCTIONAL: "#33567e",
  COUNTERMEASURE_REQUIRED: "#8c2f2f",
  BOTH: "#9a6b1f",
};

type Mode = "diagram" | "context" | "criteria";

interface TransitionSel {
  sourceHid: string;
  targetHid: string;
  props: Record<string, unknown>;
}

export default function StateTool({
  ctx,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  // Invocation context (§6.5.5.3): center on drawer State; Context view for
  // CM/HAZ/REQ; Criteria view for Loss; Environment highlights VALID_IN.
  const drawerPrefix = ctx.drawerNodeHid?.split("_")[0] ?? "";
  const initialMode: Mode =
    drawerPrefix === "LOS"
      ? "criteria"
      : ["CM", "HAZ", "REQ"].includes(drawerPrefix)
        ? "context"
        : "diagram";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selectedState, setSelectedState] = useState<string | null>(
    drawerPrefix === "ST" ? ctx.drawerNodeHid : null,
  );
  const [selectedTransition, setSelectedTransition] = useState<TransitionSel | null>(null);
  const [kindFilter, setKindFilter] = useState<string>("");
  const [showCriteria, setShowCriteria] = useState(true);
  const [showOverlays, setShowOverlays] = useState(mode !== "diagram");
  const [creatingTransition, setCreatingTransition] = useState<null | { source?: string; target?: string }>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const qc = useQueryClient();

  const soi = useQuery({
    queryKey: ["soi", ctx.soiHid],
    queryFn: () => api.soi(ctx.soiHid!),
    enabled: !!ctx.soiHid,
  });
  const nodes = soi.data?.nodes ?? [];
  const byHid = useMemo(() => new Map(nodes.map((n) => [n.hid, n])), [nodes]);
  const states = nodes.filter((n) => n.typeName === "State");
  const environments = nodes.filter((n) => n.typeName === "Environment");

  const refresh = () => void qc.invalidateQueries({ queryKey: ["soi"] });

  const createState = useMutation({
    mutationFn: (name: string) =>
      api.commit({
        soiHid: ctx.soiHid ?? undefined,
        toolId: "sstpa.state",
        operations: [
          { op: "createNode", tempId: "st", label: "State", properties: { Name: name } },
          {
            op: "createRelationship",
            type: "EXHIBITS",
            sourceHid: ctx.soiHid!,
            targetHid: "$st",
          },
        ],
      }),
    onSuccess: (res) => {
      setNotice(`State ${res.createdNodes.st} created.`);
      refresh();
    },
    onError: (e) => setNotice(String(e)),
  });

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        {(["diagram", "context", "criteria"] as Mode[]).map((m) => (
          <button
            key={m}
            className={`sstpa-button ${mode === m ? "" : "secondary"}`}
            onClick={() => {
              setMode(m);
              setShowOverlays(m !== "diagram");
            }}
          >
            {m === "diagram" ? "Diagram" : m === "context" ? "Context" : "Criteria / Relationships"}
          </button>
        ))}
        <span style={{ width: 12 }} />
        <button
          className="icon-button"
          onClick={() => {
            const name = window.prompt("Name for the new (:State):", "New State");
            if (name) createState.mutate(name);
          }}
        >
          + State
        </button>
        <button
          className="icon-button"
          title="Create a transition: pick source, then target"
          onClick={() => {
            setCreatingTransition({});
            setNotice("Transition: click the source State on the canvas…");
          }}
        >
          + Transition
        </button>
        <span style={{ flex: 1 }} />
        <label style={{ fontSize: "0.74rem" }}>
          Kind{" "}
          <select
            className="sstpa-input"
            style={{ width: "auto", display: "inline-block" }}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All</option>
            <option>FUNCTIONAL</option>
            <option>COUNTERMEASURE_REQUIRED</option>
            <option>BOTH</option>
          </select>
        </label>
        <label style={{ fontSize: "0.74rem" }}>
          <input
            type="checkbox"
            checked={showCriteria}
            onChange={(e) => setShowCriteria(e.target.checked)}
          />{" "}
          Criteria labels
        </label>
        <label style={{ fontSize: "0.74rem" }}>
          <input
            type="checkbox"
            checked={showOverlays}
            onChange={(e) => setShowOverlays(e.target.checked)}
          />{" "}
          Related overlays
        </label>
      </div>

      {notice && (
        <div className="sstpa-alert-warning" style={{ margin: "6px 12px" }}>
          {notice}{" "}
          <button className="icon-button" onClick={() => setNotice(null)}>
            ✕
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <StateCanvas
          ctx={ctx}
          nodes={nodes}
          mode={mode}
          kindFilter={kindFilter}
          showCriteria={showCriteria}
          showOverlays={showOverlays}
          selectedState={selectedState}
          creatingTransition={creatingTransition}
          onPickForTransition={(hid) => {
            setCreatingTransition((cur) => {
              if (!cur) return cur;
              if (!cur.source) {
                setNotice(`Source ${hid} — now click the target State…`);
                return { source: hid };
              }
              return { source: cur.source, target: hid };
            });
          }}
          onSelectState={(hid) => {
            setSelectedState(hid);
            setSelectedTransition(null);
          }}
          onSelectTransition={(t) => {
            setSelectedTransition(t);
            setSelectedState(null);
          }}
        />
        <aside
          style={{
            width: 330,
            borderLeft: "var(--sstpa-border)",
            overflow: "auto",
            background: "var(--sstpa-ivory-raised)",
          }}
        >
          {selectedState && byHid.get(selectedState) && (
            <StateDetailPanel
              ctx={ctx}
              state={byHid.get(selectedState)!}
              environments={environments}
              onChanged={refresh}
            />
          )}
          {selectedTransition && (
            <TransitionDetailPanel
              ctx={ctx}
              sel={selectedTransition}
              byHid={byHid}
              onChanged={() => {
                refresh();
                setSelectedTransition(null);
              }}
            />
          )}
          {!selectedState && !selectedTransition && (
            <p style={{ padding: 14, fontSize: "0.8rem", color: "var(--sstpa-navy-muted)" }}>
              Select a State block or a transition edge.
              <br />
              <br />
              States: {states.length} · Transitions:{" "}
              {states.reduce(
                (acc, s) =>
                  acc + (s.relationships ?? []).filter((r) => r.type === "TRANSITIONS_TO").length,
                0,
              )}
            </p>
          )}
        </aside>
      </div>

      {creatingTransition?.source && creatingTransition.target && (
        <NewTransitionDialog
          ctx={ctx}
          source={creatingTransition.source}
          target={creatingTransition.target}
          countermeasures={nodes.filter((n) => n.typeName === "Countermeasure")}
          onClose={(msg) => {
            setCreatingTransition(null);
            if (msg) setNotice(msg);
            refresh();
          }}
        />
      )}
    </div>
  );
}

/** Cytoscape canvas: SysML state blocks + transition edges + optional
 *  analytical overlays (§6.5.5.7–§6.5.5.9). */
function StateCanvas({
  nodes,
  mode,
  kindFilter,
  showCriteria,
  showOverlays,
  selectedState,
  creatingTransition,
  onPickForTransition,
  onSelectState,
  onSelectTransition,
}: {
  ctx: ToolLaunchContext;
  nodes: SoINode[];
  mode: Mode;
  kindFilter: string;
  showCriteria: boolean;
  showOverlays: boolean;
  selectedState: string | null;
  creatingTransition: null | { source?: string; target?: string };
  onPickForTransition: (hid: string) => void;
  onSelectState: (hid: string) => void;
  onSelectTransition: (t: TransitionSel) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const elements = useMemo(() => {
    const els: cytoscape.ElementDefinition[] = [];
    const states = nodes.filter((n) => n.typeName === "State");
    for (const s of states) {
      const seq = s.properties.StateSequence;
      els.push({
        data: {
          id: s.hid,
          label: `${s.hid}${seq != null ? ` [#${seq}]` : ""}\n${String(s.properties.Name ?? "")}`,
          kind: "state",
        },
      });
      for (const rel of s.relationships ?? []) {
        if (rel.type === "TRANSITIONS_TO") {
          const kind = String(rel.props?.TransitionKind ?? "FUNCTIONAL");
          if (kindFilter && kind !== kindFilter) continue;
          const trigger = String(rel.props?.Trigger ?? "");
          const guard = String(rel.props?.GuardCondition ?? "");
          let label = "";
          if (showCriteria) {
            label = trigger && trigger !== "null" ? trigger : "";
            if (guard && guard !== "null") label += ` [${guard}]`;
          }
          els.push({
            data: {
              id: `${s.hid}->${rel.targetHID}`,
              source: s.hid,
              target: rel.targetHID,
              label,
              tkind: kind,
              props: rel.props ?? {},
            },
          });
        }
        if (showOverlays && rel.type === "VALID_IN") {
          els.push({
            data: {
              id: `${s.hid}~${rel.targetHID}`,
              source: s.hid,
              target: rel.targetHID,
              validIn: true,
            },
          });
        }
      }
    }
    if (showOverlays) {
      const overlayTypes = ["Hazard", "Countermeasure", "Environment"];
      const shown = new Set(els.map((e) => e.data.id as string));
      for (const n of nodes) {
        if (!overlayTypes.includes(n.typeName)) continue;
        const related =
          n.typeName === "Countermeasure"
            ? (n.relationships ?? []).some((r) => r.type === "APPLIES_TO_STATE")
            : n.typeName === "Environment"
              ? els.some((e) => (e.data as Record<string, unknown>).validIn && e.data.target === n.hid)
              : states.some((s) =>
                  (s.relationships ?? []).some((r) => r.type === "HAS_HAZARD" && r.targetHID === n.hid),
                );
        if (!related) continue;
        if (!shown.has(n.hid)) {
          els.push({
            data: {
              id: n.hid,
              label: `${n.typeName}\n${String(n.properties.Name ?? "")}`,
              kind: n.typeName.toLowerCase(),
            },
          });
          shown.add(n.hid);
        }
      }
      // Overlay edges
      for (const s of states) {
        for (const rel of s.relationships ?? []) {
          if (rel.type === "HAS_HAZARD" && shown.has(rel.targetHID)) {
            els.push({
              data: { id: `${s.hid}!${rel.targetHID}`, source: s.hid, target: rel.targetHID, overlay: true },
            });
          }
        }
      }
      for (const cm of nodes.filter((n) => n.typeName === "Countermeasure")) {
        for (const rel of cm.relationships ?? []) {
          if (rel.type === "APPLIES_TO_STATE" && shown.has(cm.hid)) {
            els.push({
              data: { id: `${cm.hid}!${rel.targetHID}`, source: cm.hid, target: rel.targetHID, overlay: true },
            });
          }
        }
      }
    }
    // Drop edges to missing endpoints.
    const ids = new Set(els.filter((e) => !e.data.source).map((e) => e.data.id as string));
    return els.filter((e) => !e.data.source || (ids.has(e.data.source as string) && ids.has(e.data.target as string)));
  }, [nodes, kindFilter, showCriteria, showOverlays]);

  useEffect(() => {
    if (!containerRef.current) return;
    cyRef.current?.destroy();
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node[kind = "state"]',
          style: {
            shape: "round-rectangle",
            "background-color": "#fcfaf2",
            "border-width": 2,
            "border-color": "#6d5a8e",
            label: "data(label)",
            "text-wrap": "wrap",
            "text-valign": "center",
            "font-size": 9,
            "font-family": "JetBrains Mono, monospace",
            width: 150,
            height: 54,
            color: "#1b2a4a",
          },
        },
        {
          selector: 'node[kind = "hazard"]',
          style: {
            shape: "diamond",
            "background-color": "#fbeeee",
            "border-color": "#8c2f2f",
            "border-width": 1.5,
            label: "data(label)",
            "text-wrap": "wrap",
            "font-size": 8,
            width: 110,
            height: 60,
            color: "#8c2f2f",
          },
        },
        {
          selector: 'node[kind = "countermeasure"]',
          style: {
            shape: "hexagon",
            "background-color": "#eef2ee",
            "border-color": "#2e6b4f",
            "border-width": 1.5,
            label: "data(label)",
            "text-wrap": "wrap",
            "font-size": 8,
            width: 120,
            height: 56,
            color: "#2e6b4f",
          },
        },
        {
          selector: 'node[kind = "environment"]',
          style: {
            shape: "ellipse",
            "background-color": "#f2f4ee",
            "border-color": "#567045",
            "border-width": 1.5,
            label: "data(label)",
            "text-wrap": "wrap",
            "font-size": 8,
            width: 120,
            height: 54,
            color: "#567045",
          },
        },
        {
          selector: "node:selected",
          style: { "border-color": "#a8853a", "border-width": 3.5 },
        },
        {
          selector: "edge",
          style: {
            width: 1.6,
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            label: "data(label)",
            "font-size": 7.5,
            "text-rotation": "autorotate",
            "text-background-color": "#faf7ee",
            "text-background-opacity": 0.85,
            color: "#22304c",
            "line-color": "#33567e",
            "target-arrow-color": "#33567e",
          },
        },
        {
          selector: 'edge[tkind = "COUNTERMEASURE_REQUIRED"]',
          style: {
            "line-color": KIND_COLOR.COUNTERMEASURE_REQUIRED,
            "target-arrow-color": KIND_COLOR.COUNTERMEASURE_REQUIRED,
            "line-style": "dashed",
          },
        },
        {
          selector: 'edge[tkind = "BOTH"]',
          style: {
            "line-color": KIND_COLOR.BOTH,
            "target-arrow-color": KIND_COLOR.BOTH,
            width: 2.4,
          },
        },
        {
          selector: "edge[?validIn]",
          style: {
            "line-color": "#567045",
            "target-arrow-shape": "none",
            "line-style": "dotted",
            width: 1,
          },
        },
        {
          selector: "edge[?overlay]",
          style: {
            "line-color": "#9aa4b5",
            "target-arrow-shape": "vee",
            "line-style": "dotted",
            width: 1,
          },
        },
        {
          selector: "edge:selected",
          style: { "line-color": "#a8853a", "target-arrow-color": "#a8853a", width: 3 },
        },
      ],
      layout:
        mode === "criteria"
          ? ({ name: "cose", animate: false } as cytoscape.LayoutOptions)
          : ({ name: "breadthfirst", directed: true, spacingFactor: 1.3, animate: false } as cytoscape.LayoutOptions),
    });
    cy.on("tap", 'node[kind = "state"]', (ev) => {
      const hid = ev.target.id();
      if (creatingTransitionRef.current) {
        onPickForTransition(hid);
      } else {
        onSelectState(hid);
      }
    });
    cy.on("tap", "edge", (ev) => {
      const d = ev.target.data();
      if (d.tkind) {
        onSelectTransition({
          sourceHid: d.source,
          targetHid: d.target,
          props: d.props ?? {},
        });
      }
    });
    if (selectedState) {
      const el = cy.getElementById(selectedState);
      if (el.nonempty()) {
        el.select();
        cy.animate({ center: { eles: el }, duration: 200 });
      }
    }
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // creatingTransition handled via ref to avoid re-layout churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, mode]);

  const creatingTransitionRef = useRef(creatingTransition);
  creatingTransitionRef.current = creatingTransition;

  const exportPng = (full: boolean) => {
    const cy = cyRef.current;
    if (!cy) return;
    const a = document.createElement("a");
    a.href = cy.png({ full, scale: 2, bg: "#faf7ee" });
    a.download = "sstpa-state-diagram.png";
    a.click();
  };

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, background: "var(--sstpa-canvas)" }} />
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
        <button className="icon-button" onClick={() => exportPng(false)}>
          PNG (view)
        </button>
        <button className="icon-button" onClick={() => exportPng(true)}>
          PNG (full)
        </button>
      </div>
      {/* Legend (§6.5.5.8) */}
      <div
        className="sstpa-frame"
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          padding: "6px 12px",
          fontSize: "0.68rem",
          display: "flex",
          gap: 14,
        }}
      >
        <span style={{ color: KIND_COLOR.FUNCTIONAL }}>— FUNCTIONAL</span>
        <span style={{ color: KIND_COLOR.COUNTERMEASURE_REQUIRED }}>-- COUNTERMEASURE_REQUIRED</span>
        <span style={{ color: KIND_COLOR.BOTH }}>▬ BOTH</span>
        <span style={{ color: "#567045" }}>·· VALID_IN</span>
      </div>
    </div>
  );
}

/** State Detail Panel (§6.5.5.9, §6.5.5.13.1): properties, StateSequence,
 *  VALID_IN management with staged Commit. */
function StateDetailPanel({
  ctx,
  state,
  environments,
  onChanged,
}: {
  ctx: ToolLaunchContext;
  state: SoINode;
  environments: SoINode[];
  onChanged: () => void;
}) {
  const [seq, setSeq] = useState<string>(
    state.properties.StateSequence == null ? "" : String(state.properties.StateSequence),
  );
  const [error, setError] = useState<string | null>(null);

  const validIn = (state.relationships ?? []).filter((r) => r.type === "VALID_IN");
  const assignedEnvs = new Set(validIn.map((r) => r.targetHID));
  const unassigned = environments.filter((e) => !assignedEnvs.has(e.hid));
  const [addEnv, setAddEnv] = useState("");

  const commitOps = async (ops: Parameters<typeof api.commit>[0]["operations"]) => {
    setError(null);
    try {
      await api.commit({ soiHid: ctx.soiHid ?? undefined, toolId: "sstpa.state", operations: ops });
      onChanged();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div style={{ padding: "var(--sstpa-sp-3)", fontSize: "0.8rem" }}>
      <div className="mono" style={{ fontSize: "0.7rem" }}>
        {state.hid}
      </div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{String(state.properties.Name ?? "")}</div>
      {error && <div className="sstpa-alert-warning">{error}</div>}

      <label style={{ display: "block", marginTop: 8 }}>
        Lifecycle Sequence:
        <span style={{ display: "flex", gap: 6 }}>
          <input
            className="sstpa-input"
            type="number"
            min={0}
            placeholder="Not Set"
            value={seq}
            onChange={(e) => setSeq(e.target.value)}
          />
          <button
            className="icon-button"
            onClick={() =>
              void commitOps([
                {
                  op: "updateNode",
                  hid: state.hid,
                  properties: { StateSequence: seq === "" ? null : parseInt(seq, 10) },
                },
              ])
            }
          >
            Commit
          </button>
        </span>
        <span style={{ fontSize: "0.68rem", color: "var(--sstpa-navy-muted)" }}>
          Used for SAND sequencing in the Loss Tool.
        </span>
      </label>

      <h4 style={{ margin: "12px 0 4px" }}>Valid in Environments</h4>
      {validIn.length === 0 && (
        <p style={{ color: "var(--sstpa-navy-muted)", fontSize: "0.74rem" }}>
          No [:VALID_IN] assignments.
        </p>
      )}
      {validIn.map((r) => (
        <div key={r.targetHID} className="prop-row">
          <span className="mono" style={{ fontSize: "0.7rem" }}>
            {r.targetHID}
          </span>
          <button
            className="icon-button danger"
            onClick={() =>
              void commitOps([
                {
                  op: "deleteRelationship",
                  type: "VALID_IN",
                  sourceHid: state.hid,
                  targetHid: r.targetHID,
                },
              ])
            }
          >
            Remove
          </button>
        </div>
      ))}
      {unassigned.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <select className="sstpa-input" value={addEnv} onChange={(e) => setAddEnv(e.target.value)}>
            <option value="">Add Environment…</option>
            {unassigned.map((e) => (
              <option key={e.hid} value={e.hid}>
                {String(e.properties.Name ?? e.hid)}
              </option>
            ))}
          </select>
          <button
            className="icon-button"
            disabled={!addEnv}
            onClick={() =>
              void commitOps([
                { op: "createRelationship", type: "VALID_IN", sourceHid: state.hid, targetHid: addEnv },
              ])
            }
          >
            Add
          </button>
        </div>
      )}

      <h4 style={{ margin: "12px 0 4px" }}>Hazards</h4>
      {(state.relationships ?? [])
        .filter((r) => r.type === "HAS_HAZARD")
        .map((r) => (
          <div key={r.targetHID} className="mono" style={{ fontSize: "0.7rem" }}>
            {r.targetHID}
          </div>
        ))}
    </div>
  );
}

/** Transition Detail Panel (§6.5.5.9, §6.5.5.11): view and edit the
 *  [:TRANSITIONS_TO] relationship properties. Edits are delete+recreate in
 *  one transaction (relationship property update via commit ops). */
function TransitionDetailPanel({
  ctx,
  sel,
  byHid,
  onChanged,
}: {
  ctx: ToolLaunchContext;
  sel: TransitionSel;
  byHid: Map<string, SoINode>;
  onChanged: () => void;
}) {
  const [props, setProps] = useState<Record<string, unknown>>({ ...sel.props });
  const [error, setError] = useState<string | null>(null);
  const kind = String(props.TransitionKind ?? "FUNCTIONAL");

  const set = (k: string, v: unknown) => setProps((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setError(null);
    if ((kind === "COUNTERMEASURE_REQUIRED" || kind === "BOTH") && !props.RequiredByCountermeasureHID && !props.RequiredByCountermeasureUUID) {
      setError("TransitionKind " + kind + " requires a governing Countermeasure HID (SRS §6.5.5.11).");
      return;
    }
    try {
      await api.commit({
        soiHid: ctx.soiHid ?? undefined,
        toolId: "sstpa.state",
        operations: [
          { op: "deleteRelationship", type: "TRANSITIONS_TO", sourceHid: sel.sourceHid, targetHid: sel.targetHid },
          {
            op: "createRelationship",
            type: "TRANSITIONS_TO",
            sourceHid: sel.sourceHid,
            targetHid: sel.targetHid,
            properties: props,
          },
        ],
      });
      onChanged();
    } catch (e) {
      setError(String(e));
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove this transition?")) return;
    try {
      await api.commit({
        soiHid: ctx.soiHid ?? undefined,
        toolId: "sstpa.state",
        operations: [
          { op: "deleteRelationship", type: "TRANSITIONS_TO", sourceHid: sel.sourceHid, targetHid: sel.targetHid },
        ],
      });
      onChanged();
    } catch (e) {
      setError(String(e));
    }
  };

  const field = (name: string, label: string) => (
    <label style={{ display: "block", marginTop: 6 }}>
      {label}
      <input
        className="sstpa-input"
        value={props[name] == null ? "" : String(props[name])}
        onChange={(e) => set(name, e.target.value === "" ? null : e.target.value)}
      />
    </label>
  );

  return (
    <div style={{ padding: "var(--sstpa-sp-3)", fontSize: "0.8rem" }}>
      <div className="mono" style={{ fontSize: "0.7rem" }}>
        {sel.sourceHid} → {sel.targetHid}
      </div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        {String(byHid.get(sel.sourceHid)?.properties.Name ?? "")} →{" "}
        {String(byHid.get(sel.targetHid)?.properties.Name ?? "")}
      </div>
      {error && <div className="sstpa-alert-warning">{error}</div>}
      <label style={{ display: "block" }}>
        Transition Kind
        <select
          className="sstpa-input"
          value={kind}
          onChange={(e) => set("TransitionKind", e.target.value)}
        >
          <option>FUNCTIONAL</option>
          <option>COUNTERMEASURE_REQUIRED</option>
          <option>BOTH</option>
        </select>
      </label>
      {field("Trigger", "Trigger")}
      {field("GuardCondition", "Guard Condition")}
      {field("Rationale", "Rationale")}
      {(kind === "COUNTERMEASURE_REQUIRED" || kind === "BOTH") &&
        field("RequiredByCountermeasureHID", "Required by Countermeasure (HID)")}
      {field("Priority", "Priority")}
      {field("ResidualRiskNote", "Residual Risk Note")}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="sstpa-button" onClick={() => void save()}>
          Commit
        </button>
        <button className="sstpa-button danger" onClick={() => void remove()}>
          Remove
        </button>
      </div>
    </div>
  );
}

/** New transition dialog (§6.5.5.11) — staged properties then one Commit. */
function NewTransitionDialog({
  ctx,
  source,
  target,
  countermeasures,
  onClose,
}: {
  ctx: ToolLaunchContext;
  source: string;
  target: string;
  countermeasures: SoINode[];
  onClose: (notice?: string) => void;
}) {
  const [kind, setKind] = useState("FUNCTIONAL");
  const [trigger, setTrigger] = useState("");
  const [guard, setGuard] = useState("");
  const [cmHid, setCmHid] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setError(null);
    if ((kind === "COUNTERMEASURE_REQUIRED" || kind === "BOTH") && !cmHid) {
      setError("Select the governing Countermeasure (SRS §6.5.5.11).");
      return;
    }
    const props: Record<string, unknown> = { TransitionKind: kind };
    if (trigger) props.Trigger = trigger;
    if (guard) props.GuardCondition = guard;
    if (cmHid) props.RequiredByCountermeasureHID = cmHid;
    try {
      await api.commit({
        soiHid: ctx.soiHid ?? undefined,
        toolId: "sstpa.state",
        operations: [
          { op: "createRelationship", type: "TRANSITIONS_TO", sourceHid: source, targetHid: target, properties: props },
        ],
      });
      onClose(`Transition ${source} → ${target} created.`);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="sstpa-dialog-overlay" onClick={() => onClose()}>
      <div className="sstpa-frame sstpa-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>
          New transition <span className="mono" style={{ fontSize: "0.8rem" }}>{source} → {target}</span>
        </h2>
        {error && <div className="sstpa-alert-warning">{error}</div>}
        <label style={{ display: "block", fontSize: "0.82rem" }}>
          Transition Kind
          <select className="sstpa-input" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>FUNCTIONAL</option>
            <option>COUNTERMEASURE_REQUIRED</option>
            <option>BOTH</option>
          </select>
        </label>
        <label style={{ display: "block", fontSize: "0.82rem", marginTop: 6 }}>
          Trigger
          <input className="sstpa-input" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
        </label>
        <label style={{ display: "block", fontSize: "0.82rem", marginTop: 6 }}>
          Guard Condition
          <input className="sstpa-input" value={guard} onChange={(e) => setGuard(e.target.value)} />
        </label>
        {(kind === "COUNTERMEASURE_REQUIRED" || kind === "BOTH") && (
          <label style={{ display: "block", fontSize: "0.82rem", marginTop: 6 }}>
            Governing Countermeasure
            <select className="sstpa-input" value={cmHid} onChange={(e) => setCmHid(e.target.value)}>
              <option value="">Select…</option>
              {countermeasures.map((cm) => (
                <option key={cm.hid} value={cm.hid}>
                  {String(cm.properties.Name ?? cm.hid)} ({cm.hid})
                </option>
              ))}
            </select>
          </label>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="sstpa-button secondary" onClick={() => onClose()}>
            Cancel
          </button>
          <button className="sstpa-button" onClick={() => void create()}>
            Commit
          </button>
        </div>
      </div>
    </div>
  );
}

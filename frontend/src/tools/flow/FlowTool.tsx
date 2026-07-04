// The Flow Tool (SRS §6.5.6): Functional Flow and STPA Control Flow diagrams
// for the current SoI. Functional Flow renders FLOWS_TO_FUNCTION /
// FLOWS_TO_INTERFACE / CONNECTS / PARTICIPATES_IN; STPA Control Flow renders
// the control loop (GENERATES, COMMANDS, PRODUCES, INFORMS, TUNES) with
// role casting of Functions/Interfaces via [:IMPLEMENTS]. Layout persists in
// FunctionalFlowJSON / ControlStructureJSON node properties (§6.5.6.5).
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import cytoscape from "cytoscape";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api/client";
import type { SoINode } from "../../api/types";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

type Mode = "functional" | "stpa";

const STPA_ROLES = ["ControlAlgorithm", "ControlledProcess", "ProcessModel", "ControlAction", "Feedback"];
const LOOP_RELS = ["GENERATES", "COMMANDS", "PRODUCES", "INFORMS", "TUNES", "IMPLEMENTS"];
const FLOW_RELS = ["FLOWS_TO_FUNCTION", "FLOWS_TO_INTERFACE", "CONNECTS", "PARTICIPATES_IN"];

export default function FlowTool({
  ctx,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  const drawerPrefix = ctx.drawerNodeHid?.split("_")[0] ?? "";
  const initialMode: Mode = ["CS", "CAL", "PM", "CP", "ACT", "FB"].includes(drawerPrefix)
    ? "stpa"
    : "functional";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [containerHid, setContainerHid] = useState<string>(""); // FunctionalFlow or ControlStructure node
  const [selected, setSelected] = useState<SoINode | null>(null);
  const [cmFilter, setCmFilter] = useState("");
  const [linking, setLinking] = useState<null | { type: string; source?: string }>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const qc = useQueryClient();

  const soi = useQuery({
    queryKey: ["soi", ctx.soiHid],
    queryFn: () => api.soi(ctx.soiHid!),
    enabled: !!ctx.soiHid,
  });
  const nodes = useMemo(() => soi.data?.nodes ?? [], [soi.data]);
  const byHid = useMemo(() => new Map(nodes.map((n) => [n.hid, n])), [nodes]);

  const containers = nodes.filter((n) =>
    mode === "functional" ? n.typeName === "FunctionalFlow" : n.typeName === "ControlStructure",
  );
  useEffect(() => {
    // Auto-select a container; offer selection when several exist (§6.5.6.3).
    if (containers.length > 0 && !containers.some((c) => c.hid === containerHid)) {
      setContainerHid(containers[0].hid);
    }
  }, [containers, containerHid]);

  const refresh = () => void qc.invalidateQueries({ queryKey: ["soi"] });

  const commit = useMutation({
    mutationFn: (ops: Parameters<typeof api.commit>[0]["operations"]) =>
      api.commit({ soiHid: ctx.soiHid ?? undefined, toolId: "sstpa.flow", operations: ops }),
    onSuccess: () => {
      refresh();
      setNotice(null);
    },
    onError: (e) => setNotice(String(e)),
  });

  const layoutProp = mode === "functional" ? "FunctionalFlowJSON" : "ControlStructureJSON";
  const container = byHid.get(containerHid);

  const saveLayout = (positions: Record<string, { x: number; y: number }>) => {
    if (!container) return;
    const doc = {
      schemaVersion: "1.0",
      containerHid,
      soiHid: ctx.soiHid,
      positions,
      savedAt: new Date().toISOString(),
    };
    commit.mutate([
      { op: "updateNode", hid: containerHid, properties: { [layoutProp]: JSON.stringify(doc) } },
    ]);
  };

  const savedPositions = useMemo(() => {
    const raw = container?.properties?.[layoutProp];
    if (typeof raw !== "string" || !raw || raw === "null") return {};
    try {
      return (JSON.parse(raw).positions ?? {}) as Record<string, { x: number; y: number }>;
    } catch {
      return {};
    }
  }, [container, layoutProp]);

  // Create-node helpers.
  const createNode = (label: string) => {
    const name = window.prompt(`Name for the new (:${label}):`, `New ${label}`);
    if (!name) return;
    const ops: Parameters<typeof api.commit>[0]["operations"] = [
      { op: "createNode", tempId: "n", label, properties: { Name: name } },
    ];
    if (label === "SystemFunction") {
      ops.push({ op: "createRelationship", type: "HAS_FUNCTION", sourceHid: ctx.soiHid!, targetHid: "$n" });
    } else if (label === "Interface") {
      ops.push({ op: "createRelationship", type: "HAS_INTERFACE", sourceHid: ctx.soiHid!, targetHid: "$n" });
    } else if (STPA_ROLES.includes(label) && containerHid) {
      const relByRole: Record<string, string> = {
        ControlAlgorithm: "HAS_CONTROL_ALGORITHM",
        ControlledProcess: "HAS_CONTROLLED_PROCESS",
        ProcessModel: "HAS_PROCESS_MODEL",
        ControlAction: "HAS_CONTROL_ACTION",
        Feedback: "HAS_FEEDBACK",
      };
      ops.push({ op: "createRelationship", type: relByRole[label], sourceHid: containerHid, targetHid: "$n" });
    }
    commit.mutate(ops);
  };

  const createContainer = () => {
    const label = mode === "functional" ? "FunctionalFlow" : "ControlStructure";
    const name = window.prompt(`Name for the new (:${label}):`, `New ${label}`);
    if (!name) return;
    const purpose = nodes.find((n) => n.typeName === "Purpose");
    const ops: Parameters<typeof api.commit>[0]["operations"] = [
      { op: "createNode", tempId: "c", label, properties: { Name: name } },
    ];
    if (purpose) {
      ops.push({
        op: "createRelationship",
        type: mode === "functional" ? "HAS_FUNCTIONAL_FLOW" : "HAS_CONTROL_STRUCTURE",
        sourceHid: purpose.hid,
        targetHid: "$c",
      });
    }
    commit.mutate(ops);
  };

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
        <button
          className={`sstpa-button ${mode === "functional" ? "" : "secondary"}`}
          onClick={() => setMode("functional")}
        >
          Functional Flow
        </button>
        <button
          className={`sstpa-button ${mode === "stpa" ? "" : "secondary"}`}
          onClick={() => setMode("stpa")}
        >
          STPA Control Flow
        </button>
        <select
          className="sstpa-input"
          style={{ width: "auto" }}
          value={containerHid}
          onChange={(e) => setContainerHid(e.target.value)}
          title={mode === "functional" ? "Functional Flow" : "Control Structure"}
        >
          {containers.length === 0 && <option value="">(none — create one)</option>}
          {containers.map((c) => (
            <option key={c.hid} value={c.hid}>
              {String(c.properties.Name ?? c.hid)}
            </option>
          ))}
        </select>
        <button className="icon-button" onClick={createContainer}>
          + {mode === "functional" ? "Flow" : "Structure"}
        </button>
        <span style={{ width: 10 }} />
        {mode === "functional" ? (
          <>
            <button className="icon-button" onClick={() => createNode("SystemFunction")}>
              + Function
            </button>
            <button className="icon-button" onClick={() => createNode("Interface")}>
              + Interface
            </button>
            <button
              className="icon-button"
              onClick={() => {
                setLinking({ type: "FLOW" });
                setNotice("Flow: click the source node…");
              }}
            >
              + Flow edge
            </button>
          </>
        ) : (
          <>
            {STPA_ROLES.map((r) => (
              <button key={r} className="icon-button" onClick={() => createNode(r)}>
                + {r.replace("Control", "C.").replace("Process", "Proc.")}
              </button>
            ))}
            <button
              className="icon-button"
              title="Cast a Function/Interface into an STPA role via [:IMPLEMENTS]"
              onClick={() => {
                setLinking({ type: "IMPLEMENTS" });
                setNotice("Cast: click the Function/Interface, then the STPA role node…");
              }}
            >
              ⇄ Cast role
            </button>
            <button
              className="icon-button"
              onClick={() => {
                setLinking({ type: "LOOP" });
                setNotice("Loop edge: click source (CAL/ACT/CP/FB/PM), then target…");
              }}
            >
              + Loop edge
            </button>
          </>
        )}
        <span style={{ flex: 1 }} />
        {mode === "functional" && (
          <select
            className="sstpa-input"
            style={{ width: "auto" }}
            value={cmFilter}
            onChange={(e) => setCmFilter(e.target.value)}
            title="Countermeasure overlay filter (§6.5.6.8)"
          >
            <option value="">No CM filter</option>
            {nodes
              .filter((n) => n.typeName === "Countermeasure")
              .map((cm) => (
                <option key={cm.hid} value={cm.hid}>
                  {String(cm.properties.Name ?? cm.hid)}
                </option>
              ))}
          </select>
        )}
      </div>

      {notice && (
        <div className="sstpa-alert-warning" style={{ margin: "6px 12px" }}>
          {notice}{" "}
          <button
            className="icon-button"
            onClick={() => {
              setNotice(null);
              setLinking(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <FlowCanvas
          mode={mode}
          nodes={nodes}
          cmFilter={cmFilter}
          savedPositions={savedPositions}
          linking={linking}
          onNodeTap={(hid) => {
            if (linking) {
              if (!linking.source) {
                setLinking({ ...linking, source: hid });
                setNotice(`Source ${hid} — now click the target…`);
              } else {
                const src = byHid.get(linking.source);
                const tgt = byHid.get(hid);
                if (src && tgt) {
                  let type = "";
                  if (linking.type === "IMPLEMENTS") type = "IMPLEMENTS";
                  else if (linking.type === "LOOP") {
                    const loopMap: Record<string, string> = {
                      "ControlAlgorithm>ControlAction": "GENERATES",
                      "ControlAction>ControlledProcess": "COMMANDS",
                      "ControlledProcess>Feedback": "PRODUCES",
                      "Feedback>ProcessModel": "INFORMS",
                      "ProcessModel>ControlAlgorithm": "TUNES",
                    };
                    type = loopMap[`${src.typeName}>${tgt.typeName}`] ?? "";
                  } else {
                    // Functional flow edge type from endpoint types (§6.5.6.7).
                    if (src.typeName === "SystemFunction" && tgt.typeName === "SystemFunction")
                      type = "FLOWS_TO_FUNCTION";
                    else if (src.typeName === "SystemFunction" && tgt.typeName === "Interface")
                      type = "FLOWS_TO_INTERFACE";
                    else if (src.typeName === "Interface" && tgt.typeName === "SystemFunction")
                      type = "CONNECTS";
                    else if (src.typeName === "Interface" && tgt.typeName === "Connection")
                      type = "PARTICIPATES_IN";
                  }
                  if (!type) {
                    setNotice(`No authorized flow relationship from (:${src.typeName}) to (:${tgt.typeName}).`);
                  } else {
                    commit.mutate([
                      { op: "createRelationship", type, sourceHid: src.hid, targetHid: tgt.hid },
                    ]);
                    setNotice(null);
                  }
                }
                setLinking(null);
              }
              return;
            }
            setSelected(byHid.get(hid) ?? null);
          }}
          onLayoutSave={saveLayout}
        />
        <aside
          style={{
            width: 300,
            borderLeft: "var(--sstpa-border)",
            overflow: "auto",
            background: "var(--sstpa-ivory-raised)",
            padding: "var(--sstpa-sp-3)",
            fontSize: "0.8rem",
          }}
        >
          {selected ? (
            <>
              <div className="mono" style={{ fontSize: "0.7rem" }}>
                {selected.hid}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {String(selected.properties.Name ?? "")}
              </div>
              <div style={{ color: "var(--sstpa-navy-muted)" }}>{selected.typeName}</div>
              <p>{String(selected.properties.ShortDescription ?? "").replace("null", "")}</p>
              <h4>Outgoing</h4>
              {(selected.relationships ?? [])
                .filter((r) => [...FLOW_RELS, ...LOOP_RELS].includes(r.type))
                .map((r) => (
                  <div key={`${r.type}${r.targetHID}`} className="prop-row">
                    <span className="mono" style={{ fontSize: "0.66rem" }}>
                      [:{r.type}] {r.targetHID}
                    </span>
                    <button
                      className="icon-button danger"
                      onClick={() =>
                        commit.mutate([
                          {
                            op: "deleteRelationship",
                            type: r.type,
                            sourceHid: selected.hid,
                            targetHid: r.targetHID,
                          },
                        ])
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </>
          ) : (
            <p style={{ color: "var(--sstpa-navy-muted)" }}>
              Select a node. Drag nodes to arrange; positions persist to{" "}
              {layoutProp} on Commit Layout.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function FlowCanvas({
  mode,
  nodes,
  cmFilter,
  savedPositions,
  linking,
  onNodeTap,
  onLayoutSave,
}: {
  mode: Mode;
  nodes: SoINode[];
  cmFilter: string;
  savedPositions: Record<string, { x: number; y: number }>;
  linking: null | { type: string; source?: string };
  onNodeTap: (hid: string) => void;
  onLayoutSave: (positions: Record<string, { x: number; y: number }>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const linkingRef = useRef(linking);
  linkingRef.current = linking;

  const elements = useMemo(() => {
    const els: cytoscape.ElementDefinition[] = [];
    const include = (n: SoINode) =>
      mode === "functional"
        ? ["SystemFunction", "Interface", "Connection"].includes(n.typeName)
        : [...STPA_ROLES, "SystemFunction", "Interface"].includes(n.typeName);

    // Countermeasure overlay filter (§6.5.6.8): show only flow nodes the CM
    // applies to (plus their neighbors).
    let cmTargets: Set<string> | null = null;
    if (mode === "functional" && cmFilter) {
      const cm = nodes.find((n) => n.hid === cmFilter);
      cmTargets = new Set(
        (cm?.relationships ?? [])
          .filter((r) => r.type.startsWith("APPLIES_TO"))
          .map((r) => r.targetHID),
      );
    }

    const shown = new Set<string>();
    for (const n of nodes) {
      if (!include(n)) continue;
      // In STPA mode, show Functions/Interfaces only when cast via IMPLEMENTS.
      if (
        mode === "stpa" &&
        ["SystemFunction", "Interface"].includes(n.typeName) &&
        !(n.relationships ?? []).some((r) => r.type === "IMPLEMENTS")
      )
        continue;
      if (cmTargets && !cmTargets.has(n.hid)) {
        const touches = (n.relationships ?? []).some(
          (r) => cmTargets!.has(r.targetHID),
        );
        if (!touches) continue;
      }
      shown.add(n.hid);
      const pos = savedPositions[n.hid];
      els.push({
        data: {
          id: n.hid,
          label: `${n.hid}\n${String(n.properties.Name ?? "")}`,
          kind: n.typeName,
          cmHit: cmTargets?.has(n.hid) ?? false,
        },
        position: pos ? { ...pos } : undefined,
      });
    }
    const relSet = mode === "functional" ? FLOW_RELS : LOOP_RELS;
    for (const n of nodes) {
      if (!shown.has(n.hid)) continue;
      for (const r of n.relationships ?? []) {
        if (!relSet.includes(r.type)) continue;
        if (!shown.has(r.targetHID)) continue;
        els.push({
          data: {
            id: `${n.hid}-${r.type}->${r.targetHID}`,
            source: n.hid,
            target: r.targetHID,
            label: r.type,
            rel: r.type,
          },
        });
      }
    }
    return els;
  }, [nodes, mode, cmFilter, savedPositions]);

  useEffect(() => {
    if (!containerRef.current) return;
    cyRef.current?.destroy();
    const hasPositions = elements.some((e) => e.position);
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            shape: "round-rectangle",
            "background-color": "#fcfaf2",
            "border-width": 1.5,
            "border-color": "#33567e",
            label: "data(label)",
            "text-wrap": "wrap",
            "text-valign": "center",
            "font-size": 8.5,
            "font-family": "JetBrains Mono, monospace",
            width: 140,
            height: 48,
            color: "#1b2a4a",
          },
        },
        { selector: 'node[kind = "Interface"]', style: { shape: "ellipse", "border-color": "#4a7a6f" } },
        { selector: 'node[kind = "Connection"]', style: { shape: "diamond", "border-color": "#3d6b7a" } },
        { selector: 'node[kind = "ControlAlgorithm"]', style: { "border-width": 3, "border-color": "#1b2a4a" } },
        { selector: 'node[kind = "ControlledProcess"]', style: { "border-color": "#567045", "border-width": 2.5 } },
        { selector: 'node[kind = "ProcessModel"]', style: { shape: "round-hexagon", "border-color": "#6d5a8e" } },
        { selector: 'node[kind = "ControlAction"]', style: { shape: "rectangle", "border-color": "#8c2f2f" } },
        { selector: 'node[kind = "Feedback"]', style: { shape: "rectangle", "border-color": "#9a6b1f" } },
        { selector: "node[?cmHit]", style: { "background-color": "#f3ead3" } },
        { selector: "node:selected", style: { "border-color": "#a8853a", "border-width": 3.5 } },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            "line-color": "#33567e",
            "target-arrow-color": "#33567e",
            label: "data(label)",
            "font-size": 6.5,
            "text-rotation": "autorotate",
            "text-background-color": "#faf7ee",
            "text-background-opacity": 0.85,
            color: "#44546e",
          },
        },
        { selector: 'edge[rel = "PRODUCES"], edge[rel = "INFORMS"]', style: { "line-style": "dashed", "line-color": "#9a6b1f", "target-arrow-color": "#9a6b1f" } },
        { selector: 'edge[rel = "IMPLEMENTS"]', style: { "line-style": "dotted", "line-color": "#6d5a8e", "target-arrow-color": "#6d5a8e" } },
        { selector: 'edge[rel = "PARTICIPATES_IN"]', style: { "line-color": "#3d6b7a", "target-arrow-color": "#3d6b7a" } },
        { selector: "edge:selected", style: { "line-color": "#a8853a", "target-arrow-color": "#a8853a", width: 3 } },
      ],
      layout: hasPositions
        ? ({ name: "preset" } as cytoscape.LayoutOptions)
        : mode === "stpa"
          ? ({ name: "circle", animate: false } as cytoscape.LayoutOptions)
          : ({ name: "breadthfirst", directed: true, spacingFactor: 1.4, animate: false } as cytoscape.LayoutOptions),
    });
    cy.on("tap", "node", (ev) => onNodeTap(ev.target.id()));
    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, mode]);

  const exportPng = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const a = document.createElement("a");
    a.href = cy.png({ full: true, scale: 2, bg: "#faf7ee" });
    a.download = `sstpa-${mode}-flow.png`;
    a.click();
  };

  const commitLayout = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const positions: Record<string, { x: number; y: number }> = {};
    cy.nodes().forEach((n) => {
      positions[n.id()] = { x: Math.round(n.position("x")), y: Math.round(n.position("y")) };
    });
    onLayoutSave(positions);
  };

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, background: "var(--sstpa-canvas)" }} />
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
        <button className="icon-button" onClick={commitLayout} title="Persist node positions (§6.5.6.5)">
          Commit layout
        </button>
        <button className="icon-button" onClick={exportPng}>
          PNG
        </button>
      </div>
    </div>
  );
}

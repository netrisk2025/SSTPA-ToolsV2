// Reference Tool (SRS §6.5.4): browse the read-only Reference Data set
// (ATT&CK / ATLAS / NIST 800-53 / EMB3D) in Research Mode, and assign
// [:REFERENCES] to a valid Core node in Assignment Mode. Cloning copies
// select properties per SRS §3.4.6.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../../api/client";
import type { ReferenceSearchResult } from "../../api/types";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

/** Authorized clone sources by Core node type (SRS §3.4.6.1). */
const CLONE_SOURCES: Record<string, string[]> = {
  Attack: ["AK_Technique", "AT_Technique"],
  Countermeasure: [
    "AK_Mitigation",
    "AK_DetectionStrategy",
    "AK_Analytic",
    "AT_Mitigation",
    "EMB3D_CourseOfAction",
  ],
  SecurityControl: ["NIST_Control", "NIST_Enhancement"],
  Component: ["AK_Software", "AK_Asset", "EMB3D_Device"],
  Hazard: ["AK_Technique", "AT_Technique", "EMB3D_Vulnerability"],
  System: ["AK_Group", "AK_Campaign"],
};

const VALID_SOURCE_PREFIXES: Record<string, string> = {
  CTRL: "SecurityControl",
  EL: "Component",
  SYS: "System",
  HAZ: "Hazard",
  ATK: "Attack",
  CM: "Countermeasure",
};

export default function ReferenceTool({
  ctx,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
}) {
  // Assignment Mode when the Data Drawer holds a valid node type (§6.5.4.1).
  const drawerPrefix = ctx.drawerNodeHid?.split("_")[0] ?? "";
  const sourceType = VALID_SOURCE_PREFIXES[drawerPrefix];
  const canAssign = !!sourceType && !!ctx.drawerNodeHid;
  const [mode, setMode] = useState<"research" | "assignment">(
    canAssign ? "assignment" : "research",
  );

  const [framework, setFramework] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [queryText, setQueryText] = useState("");
  const [externalId, setExternalId] = useState("");
  const [selected, setSelected] = useState<ReferenceSearchResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const qc = useQueryClient();

  const frameworks = useQuery({
    queryKey: ["ref-frameworks"],
    queryFn: api.referenceFrameworks,
  });

  const allowedLabels =
    mode === "assignment" && sourceType ? CLONE_SOURCES[sourceType] : null;

  const search = useQuery({
    queryKey: ["ref-search", framework, typeFilter, queryText, externalId],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (externalId) params.externalId = externalId;
      else if (queryText) params.text = queryText;
      if (framework) params.framework = framework;
      if (typeFilter) params.label = typeFilter;
      params.limit = "100";
      return api.referenceSearch(params);
    },
    enabled: !!(externalId || queryText.length >= 2),
  });

  const detail = useQuery({
    queryKey: ["ref-node", selected?.uuid],
    queryFn: () => api.referenceNode(selected!.uuid),
    enabled: !!selected,
  });

  const assign = async (overwrite: boolean) => {
    if (!selected || !ctx.drawerNodeHid) return;
    setNotice(null);
    try {
      await api.referenceClone({
        coreHid: ctx.drawerNodeHid,
        referenceUuid: selected.uuid,
        overwrite,
      });
      setNotice(
        `Assigned ${selected.externalId} to ${ctx.drawerNodeHid} via [:REFERENCES]; shared properties cloned (SRS §3.4.6.2).`,
      );
      void qc.invalidateQueries({ queryKey: ["soi"] });
      void qc.invalidateQueries({ queryKey: ["node"] });
    } catch (e) {
      setNotice(String(e));
    }
  };

  const results = useMemo(() => {
    let r = search.data?.results ?? [];
    if (allowedLabels) {
      // Invalid item types for the source node are muted, not hidden here —
      // we sort valid first and disable assignment on invalid (§6.5.4.7).
      r = [...r].sort((a, b) => {
        const av = a.labels.some((l) => allowedLabels.includes(l)) ? 0 : 1;
        const bv = b.labels.some((l) => allowedLabels.includes(l)) ? 0 : 1;
        return av - bv;
      });
    }
    return r;
  }, [search.data, allowedLabels]);

  const selectedValid =
    !allowedLabels ||
    (selected?.labels.some((l) => allowedLabels.includes(l)) ?? false);

  const props = (detail.data?.props ?? {}) as Record<string, unknown>;
  const relationships = (detail.data?.relationships ?? []) as {
    type: string;
    targetUuid: string;
    targetExternalId: string;
    targetName: string;
  }[];

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      {/* Header: mode + source context (§6.5.4.3) */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
          flexWrap: "wrap",
        }}
      >
        <button
          className={`sstpa-button ${mode === "research" ? "" : "secondary"}`}
          onClick={() => setMode("research")}
        >
          Research Mode
        </button>
        <button
          className={`sstpa-button ${mode === "assignment" ? "" : "secondary"}`}
          disabled={!canAssign}
          title={canAssign ? "" : "Open a valid node in the Data Drawer first (§6.5.4.1)"}
          onClick={() => setMode("assignment")}
        >
          Assignment Mode
        </button>
        {mode === "assignment" && (
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--sstpa-navy-muted)" }}>
            Source: {ctx.drawerNodeHid} ({sourceType}) · SoI {ctx.soiHid ?? "—"} · allowed:{" "}
            {allowedLabels?.join(", ")}
          </span>
        )}
      </div>

      {/* Framework selector / type filter / search (§6.5.4.6–§6.5.4.8) */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
          flexWrap: "wrap",
        }}
      >
        <select
          className="sstpa-input"
          style={{ width: "auto" }}
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
        >
          <option value="">All frameworks</option>
          {(frameworks.data?.frameworks ?? []).map((f, i) => (
            <option key={i} value={String(f.frameworkName)}>
              {String(f.frameworkName)} {String(f.frameworkVersion)}{" "}
              {f.frameworkDomain && f.frameworkDomain !== "n/a" ? `(${String(f.frameworkDomain)})` : ""}
            </option>
          ))}
        </select>
        <input
          className="sstpa-input"
          style={{ width: 160 }}
          placeholder="Type filter (e.g. AK_Technique)"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          list="ref-type-suggestions"
        />
        <datalist id="ref-type-suggestions">
          {[
            "AK_Tactic", "AK_Technique", "AK_Mitigation", "AK_Group", "AK_Software",
            "AK_Campaign", "AK_DetectionStrategy", "AK_Analytic", "AK_DataComponent",
            "AT_Tactic", "AT_Technique", "AT_Mitigation", "AT_CaseStudy",
            "NIST_Family", "NIST_Control", "NIST_Enhancement",
            "EMB3D_Vulnerability", "EMB3D_CourseOfAction", "EMB3D_Device",
          ].map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <input
          className="sstpa-input"
          style={{ width: 140 }}
          placeholder="Exact ExternalID"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value.trim())}
        />
        <input
          className="sstpa-input"
          style={{ flex: 1, minWidth: 180 }}
          placeholder="Search name / description (incremental)…"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

      {notice && (
        <div className="sstpa-alert-warning" style={{ margin: "6px 12px" }}>
          {notice}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Results grid (§6.5.4.8) */}
        <div style={{ flex: 1, overflow: "auto", borderRight: "var(--sstpa-border-soft)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid var(--sstpa-navy)" }}>
                <th style={{ padding: "4px 8px" }}>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Framework</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const valid =
                  !allowedLabels || r.labels.some((l) => allowedLabels.includes(l));
                return (
                  <tr
                    key={r.uuid}
                    onClick={() => setSelected(r)}
                    style={{
                      borderBottom: "1px solid var(--sstpa-line-soft)",
                      cursor: "pointer",
                      opacity: valid ? 1 : 0.45,
                      background:
                        selected?.uuid === r.uuid ? "var(--sstpa-ivory-sunken)" : undefined,
                    }}
                  >
                    <td className="mono" style={{ padding: "4px 8px", fontSize: "0.7rem" }}>
                      {r.externalId}
                    </td>
                    <td>{r.name}</td>
                    <td className="mono" style={{ fontSize: "0.66rem" }}>
                      {r.labels.join(",")}
                    </td>
                    <td style={{ fontSize: "0.7rem" }}>{r.frameworkName}</td>
                  </tr>
                );
              })}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 14, color: "var(--sstpa-navy-muted)" }}>
                    {search.isFetching
                      ? "Searching…"
                      : "Enter an ExternalID or at least two characters of text to search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Read-only inspector (§6.5.4.10) */}
        <div
          style={{
            width: 380,
            overflow: "auto",
            padding: "var(--sstpa-sp-3)",
            background: "var(--sstpa-ivory-raised)",
            fontSize: "0.8rem",
          }}
        >
          {!selected && <p style={{ color: "var(--sstpa-navy-muted)" }}>Select a reference item.</p>}
          {selected && (
            <>
              <div className="mono" style={{ fontSize: "0.72rem", color: "var(--sstpa-navy-muted)" }}>
                {String(props.FrameworkName ?? selected.frameworkName)}{" "}
                {String(props.FrameworkVersion ?? selected.frameworkVersion)} ·{" "}
                {selected.labels.join(", ")}
              </div>
              <h3 style={{ margin: "4px 0", fontFamily: "var(--sstpa-font-brand)" }}>
                {selected.externalId} — {selected.name}
              </h3>
              {selected.isDeprecated && <span className="state-warn">deprecated </span>}
              {selected.isRevoked && <span className="state-error">revoked</span>}
              <p style={{ whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }}>
                {String(props.LongDescription ?? selected.shortDescription ?? "")}
              </p>
              <p className="mono" style={{ fontSize: "0.66rem" }}>
                Source: {String(props.SourceURI ?? "")}
              </p>
              {relationships.filter((r) => r.targetExternalId).length > 0 && (
                <>
                  <h4 style={{ margin: "8px 0 4px" }}>Related items</h4>
                  <ul style={{ margin: 0, paddingLeft: 16, maxHeight: 170, overflow: "auto" }}>
                    {relationships
                      .filter((r) => r.targetExternalId)
                      .slice(0, 40)
                      .map((r, i) => (
                        <li key={i} style={{ fontSize: "0.72rem" }}>
                          <span className="mono">[{r.type}]</span> {r.targetExternalId}{" "}
                          {r.targetName}
                        </li>
                      ))}
                  </ul>
                </>
              )}
              {/* Action bar (§6.5.4.11) */}
              {mode === "assignment" && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexDirection: "column" }}>
                  {!selectedValid && (
                    <div className="sstpa-alert-warning">
                      (:{sourceType}) may not clone from {selected.labels.join(", ")} (SRS
                      §3.4.6.1).
                    </div>
                  )}
                  <button
                    className="sstpa-button"
                    disabled={!selectedValid}
                    onClick={() => void assign(false)}
                  >
                    Assign Selected Reference
                  </button>
                  <button
                    className="sstpa-button secondary"
                    disabled={!selectedValid}
                    title="Also overwrite non-default Name/Description on the Core node"
                    onClick={() => void assign(true)}
                  >
                    Assign + overwrite properties
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

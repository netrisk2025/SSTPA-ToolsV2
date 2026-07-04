// Model Text Panel (SRS §6.4.2): docked right, collapsible to a labeled tab,
// resizable; shows G2M output for the tool's scope. Read-only until the
// Backend advertises model.translate.write (M2G editing lands with the
// translator, SRS §3.7).
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { API_BASE } from "../api/client";
import { useSession } from "../state/stores";
import type { ModelTextLanguage } from "./manifest";

export function ModelTextPanel({
  languages,
  soiHid,
}: {
  languages: ModelTextLanguage[];
  soiHid: string | null;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sstpa.modeltext.collapsed") === "true";
  });
  const [width, setWidth] = useState(() => {
    return Number(localStorage.getItem("sstpa.modeltext.width")) || 340;
  });
  const [language, setLanguage] = useState<ModelTextLanguage>(languages[0]);
  const { token } = useSession();

  const modelText = useQuery({
    queryKey: ["model-text", language, soiHid],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/api/model/${language.toLowerCase()}?scope=SOI&soi=${encodeURIComponent(soiHid ?? "")}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) throw new Error(`translator unavailable (${res.status})`);
      return res.text();
    },
    enabled: !collapsed && !!soiHid,
    retry: false,
  });

  const persist = (c: boolean, w: number) => {
    localStorage.setItem("sstpa.modeltext.collapsed", String(c));
    localStorage.setItem("sstpa.modeltext.width", String(w));
  };

  if (collapsed) {
    return (
      <button
        className="model-text-panel"
        style={{
          width: 28,
          cursor: "pointer",
          border: "none",
          borderLeft: "var(--sstpa-border)",
          writingMode: "vertical-rl",
          fontFamily: "var(--sstpa-font-mono)",
          fontSize: "0.7rem",
          color: "var(--sstpa-navy-muted)",
          background: "var(--sstpa-ivory-raised)",
        }}
        onClick={() => {
          setCollapsed(false);
          persist(false, width);
        }}
        title="Expand Model Text Panel"
      >
        MODEL TEXT ▸
      </button>
    );
  }

  return (
    <div className="model-text-panel" style={{ width }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 8px",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        <div
          style={{ cursor: "ew-resize", padding: "0 4px", userSelect: "none" }}
          title="Drag to resize"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = width;
            const onMove = (ev: MouseEvent) => {
              const w = Math.max(140, startW - (ev.clientX - startX));
              setWidth(w);
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
              persist(false, width);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
        >
          ⋮
        </div>
        <span className="mono" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
          MODEL TEXT
        </span>
        {languages.length > 1 && (
          <select
            className="sstpa-input"
            style={{ width: "auto", fontSize: "0.7rem", padding: "1px 4px" }}
            value={language}
            onChange={(e) => setLanguage(e.target.value as ModelTextLanguage)}
          >
            {languages.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        )}
        <span style={{ flex: 1 }} />
        <button
          className="icon-button"
          style={{ fontSize: "0.68rem" }}
          title="Copy model text"
          onClick={() => {
            if (modelText.data) void navigator.clipboard.writeText(modelText.data);
          }}
        >
          Copy
        </button>
        <button
          className="icon-button"
          style={{ fontSize: "0.68rem" }}
          title="Collapse"
          onClick={() => {
            setCollapsed(true);
            persist(true, width);
          }}
        >
          ▸
        </button>
      </div>
      <div className="model-text-content">
        {!soiHid && "// Select a System of Interest."}
        {modelText.isLoading && "// Translating…"}
        {modelText.isError &&
          `// Model translator not yet available on this Backend.\n// (${String(modelText.error)})`}
        {modelText.data}
      </div>
    </div>
  );
}

// SSTPA Tools Branding Panel (SRS §6.3.1): logo left, name+version center,
// backend status / user / Message Center / gear right.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { api, API_BASE } from "../api/client";
import { useSession, useToolWindows } from "../state/stores";
import { useState } from "react";
import { GearMenu } from "./GearMenu";

export function BrandingPanel() {
  const { user, connected, backendInfo } = useSession();
  const openTool = useToolWindows((s) => s.openTool);
  const [gearOpen, setGearOpen] = useState(false);

  const unread = useQuery({
    queryKey: ["unread-count"],
    queryFn: api.unreadCount,
    refetchInterval: 15000,
    enabled: !!user,
  });

  const backendHost = API_BASE.replace(/^https?:\/\//, "");

  return (
    <header className="branding-panel sstpa-panel">
      <img
        src="/sstpa-menu-logo.png"
        alt="SSTPA Tools logo"
        style={{ height: 42 }}
      />
      <div style={{ flex: 1, textAlign: "center" }}>
        <span className="branding-title">SSTPA Tools</span>{" "}
        <span className="branding-version">
          v{backendInfo?.version ?? "—"}
        </span>
      </div>
      <div className={`branding-status ${connected ? "" : "disconnected"}`}>
        {backendHost}
        <br />
        {connected ? "CONNECTED" : "DISCONNECTED"}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sstpa-sp-2)",
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--sstpa-navy)" }}>
          {user?.userName ?? ""}
        </span>
        <button
          className="icon-button"
          title="Message Center"
          onClick={() => openTool("sstpa.messagecenter")}
          style={{ position: "relative", fontSize: "1rem" }}
        >
          ✉️
          {(unread.data?.unread ?? 0) > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "var(--sstpa-status-error)",
                color: "#fff",
                borderRadius: 999,
                fontSize: "0.6rem",
                minWidth: 15,
                textAlign: "center",
                padding: "0 3px",
              }}
            >
              {unread.data?.unread}
            </span>
          )}
        </button>
        <div style={{ position: "relative" }}>
          <button
            className="icon-button"
            title="Settings, style, license and version information"
            onClick={() => setGearOpen((v) => !v)}
            style={{ fontSize: "1rem" }}
          >
            ⚙️
          </button>
          {gearOpen && <GearMenu onClose={() => setGearOpen(false)} />}
        </div>
      </div>
    </header>
  );
}

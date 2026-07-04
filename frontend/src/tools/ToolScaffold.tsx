// Shared interim scaffold for Add-on Tools under active development: lists
// the SoI nodes in the tool's supported contexts and surfaces the tool's
// manifest. Each tool replaces this with its full SRS §6.5.x implementation.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { NodeTypeBadge } from "../components/NodeTypeBadge";
import { useDrawer } from "../state/stores";
import type { ToolLaunchContext, ToolManifest } from "./manifest";

export function ToolScaffold({
  ctx,
  manifest,
  note,
}: {
  ctx: ToolLaunchContext;
  manifest: ToolManifest;
  note?: string;
}) {
  const soi = useQuery({
    queryKey: ["soi", ctx.soiHid],
    queryFn: () => api.soi(ctx.soiHid!),
    enabled: !!ctx.soiHid,
  });
  const openDrawer = useDrawer((s) => s.openDrawer);
  const drawerOpen = useDrawer((s) => s.open);

  const contexts = manifest.SupportedNodeContexts;
  const nodes = (soi.data?.nodes ?? []).filter(
    (n) => contexts.includes("*") || contexts.includes(n.typeName),
  );

  return (
    <div style={{ padding: "var(--sstpa-sp-4)" }}>
      {note && (
        <div className="sstpa-alert-warning" style={{ marginBottom: 12 }}>
          🚧 {note}
        </div>
      )}
      {!ctx.soiHid && <p>Select a System of Interest first.</p>}
      {ctx.soiHid && (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--sstpa-navy-muted)" }}>
            {nodes.length} node(s) in {ctx.soiHid} within this tool's context (
            {contexts.join(", ")}).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {nodes.map((n) => (
              <div className="entity-card" key={n.hid}>
                <div className="entity-card-header">
                  <span className="entity-hid">{n.hid}</span>
                  <span className="entity-name">
                    {String(n.properties.Name ?? "")}
                  </span>
                  <span className="entity-desc">
                    {String(n.properties.ShortDescription ?? "") === "null"
                      ? ""
                      : String(n.properties.ShortDescription ?? "")}
                  </span>
                  <NodeTypeBadge typeName={n.typeName} />
                  <button
                    className="icon-button"
                    disabled={drawerOpen}
                    onClick={() => openDrawer({ mode: "edit", hid: n.hid })}
                  >
                    ✎
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

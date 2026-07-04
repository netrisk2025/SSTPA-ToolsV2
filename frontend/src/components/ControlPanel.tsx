// SSTPA Control Panel (SRS §6.3.2): Add-on Tool icons left-to-right, red
// Shutdown icon far right with visual separation. Remains visible/accessible
// when the Data Drawer is open.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useSession, useToolWindows } from "../state/stores";
import { controlPanelTools, unavailableReason } from "../tools/manifest";
import { shutdownApplication } from "../shutdown";

export function ControlPanel() {
  const { user } = useSession();
  const openTool = useToolWindows((s) => s.openTool);

  const capability = useQuery({
    queryKey: ["capability"],
    queryFn: api.capability,
    staleTime: 5 * 60 * 1000,
  });
  const backendCaps = capability.data?.capabilities ?? [];

  return (
    <nav className="control-panel sstpa-panel">
      {controlPanelTools().map((tool) => {
        const reason = unavailableReason(
          tool,
          backendCaps,
          user?.isAdmin ?? false,
        );
        return (
          <button
            key={tool.ToolID}
            className="tool-button"
            disabled={reason !== null}
            title={reason ?? tool.ToolName}
            onClick={() => openTool(tool.ToolID)}
          >
            <span className="tool-icon" aria-hidden>
              {tool.Icon}
            </span>
            <span>{tool.ToolName.replace(" Tool", "")}</span>
          </button>
        );
      })}
      <button
        className="tool-button shutdown"
        title="Shutdown SSTPA Tools"
        onClick={() => void shutdownApplication()}
      >
        <span className="tool-icon" aria-hidden>
          ⏻
        </span>
        <span>Shutdown</span>
      </button>
    </nav>
  );
}

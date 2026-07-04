// SSTPA Tools GUI main window (SRS §6.3): Branding Panel, Control Panel,
// SoI Panel, Main Panel + Data Drawer, Add-on Tool popups.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "./api/client";
import { BrandingPanel } from "./components/BrandingPanel";
import { ControlPanel } from "./components/ControlPanel";
import { UnderConstructionDialog } from "./components/ConfirmDialog";
import { DataDrawer } from "./components/DataDrawer";
import { LoginScreen } from "./components/LoginScreen";
import { MainPanel } from "./components/MainPanel";
import { SoIPanel } from "./components/SoIPanel";
import { useSession, useUnderConstruction } from "./state/stores";
import { ToolWindowHost } from "./tools/ToolShell";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

function Shell() {
  const { user, setConnected } = useSession();
  const uc = useUnderConstruction();

  // Backend connection status for the Branding Panel (SRS §6.3.1).
  const capability = useQuery({
    queryKey: ["capability"],
    queryFn: api.capability,
    refetchInterval: 10000,
    retry: false,
  });

  useEffect(() => {
    if (capability.data) {
      setConnected(true, {
        version: capability.data.version,
        schemaVersion: capability.data.schemaVersion,
      });
    } else if (capability.isError) {
      setConnected(false);
    }
  }, [capability.data, capability.isError, setConnected]);

  if (!user) return <LoginScreen />;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <BrandingPanel />
      <ControlPanel />
      <SoIPanel />
      <div style={{ position: "relative", flex: 1, display: "flex", overflow: "hidden" }}>
        <MainPanel />
        <DataDrawer />
      </div>
      <ToolWindowHost />
      {uc.visible && (
        <UnderConstructionDialog feature={uc.feature} onClose={uc.hide} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}

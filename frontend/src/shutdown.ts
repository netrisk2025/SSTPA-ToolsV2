// Shutdown coordination (SRS §4, §6.3.2): the Frontend signals the Startup
// Software, which assures Frontend and Backend shut down cleanly.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

export async function shutdownApplication(): Promise<void> {
  const confirmed = window.confirm(
    "Shut down SSTPA Tools? The Startup Software will close the Frontend and stop the Backend, preserving stored data.",
  );
  if (!confirmed) return;

  // Under Tauri, emit the shutdown event for the Startup Software / shell.
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("request_shutdown");
    return;
  } catch {
    // Browser dev mode: just close the window.
    window.close();
  }
}

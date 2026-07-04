// Startup Software flow (SRS §4):
// 1. start (or connect to) the Backend on the local machine
// 2. verify user name and password with the Backend
// 3. launch the Frontend
// 4. on Frontend exit, assure Backend shuts down preserving data
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

const { invoke } = window.__TAURI__.core;

const statusEl = document.getElementById("status");
const loginEl = document.getElementById("login");
const goBtn = document.getElementById("go");

function setStatus(text, cls = "") {
  statusEl.textContent = text;
  statusEl.className = `status ${cls}`;
}

async function boot() {
  try {
    setStatus("Starting Backend…\n(docker compose up)");
    await invoke("start_backend");
    setStatus("Waiting for Backend to become healthy…");
    await invoke("wait_backend_healthy");
    setStatus("Backend connected.", "ok");
    loginEl.style.display = "block";
    document.getElementById("user").focus();
  } catch (e) {
    setStatus(`Backend startup failed:\n${e}`, "error");
  }
}

loginEl.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  goBtn.disabled = true;
  const userName = document.getElementById("user").value;
  const password = document.getElementById("pass").value;
  try {
    setStatus("Verifying credentials with Backend…");
    await invoke("verify_login", { userName, password });
    setStatus("Launching SSTPA Tools GUI…", "ok");
    await invoke("launch_frontend");
    // The Rust side watches the GUI process; when it exits, the Backend is
    // stopped cleanly and this Startup application exits (SRS §4).
    setStatus("SSTPA Tools is running.\nThis window will close on shutdown.", "ok");
  } catch (e) {
    setStatus(`${e}`, "error");
    goBtn.disabled = false;
  }
});

boot();

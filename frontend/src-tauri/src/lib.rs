// SSTPA Tools Frontend — Tauri shell (SRS §6.2: standalone desktop
// application in a single window).
//
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

use std::path::PathBuf;

/// Shutdown command invoked by the GUI's red Shutdown icon (SRS §6.3.2).
/// The Frontend process exits; the Startup Software observes child-process
/// exit and stops the Backend cleanly (SRS §4).
#[tauri::command]
fn request_shutdown(app: tauri::AppHandle) {
    app.exit(0);
}

/// Launch configuration handed over by the Startup Software (SRS §4): the
/// backend base URL and the already-authenticated session, so the user does
/// not sign in twice.
#[derive(serde::Serialize)]
struct LaunchConfig {
    backend_url: Option<String>,
    token: Option<String>,
    user_name: Option<String>,
}

fn deploy_dir() -> Option<PathBuf> {
    if let Ok(dir) = std::env::var("SSTPA_DEPLOY_DIR") {
        let path = PathBuf::from(dir);
        if path.join("docker-compose.yml").exists() {
            return Some(path);
        }
    }

    let exe = std::env::current_exe().ok()?;
    let mut dir = exe.parent()?.to_path_buf();
    for _ in 0..8 {
        let candidate = dir.join("deploy");
        if candidate.join("docker-compose.yml").exists() {
            return Some(candidate);
        }
        if !dir.pop() {
            break;
        }
    }
    None
}

fn backend_url() -> String {
    if let Ok(url) = std::env::var("SSTPA_BACKEND_URL") {
        let url = url.trim().trim_end_matches('/');
        if !url.is_empty() {
            return url.to_string();
        }
    }

    if let Some(dir) = deploy_dir() {
        if let Ok(contents) = std::fs::read_to_string(dir.join(".env")) {
            for line in contents.lines() {
                if let Some(port) = line.trim().strip_prefix("SSTPA_HTTPS_PORT=") {
                    let port = port.trim();
                    if !port.is_empty() && port != "443" {
                        return format!("https://localhost:{port}");
                    }
                }
            }
        }
    }

    "https://localhost".to_string()
}

#[tauri::command]
fn launch_config() -> LaunchConfig {
    let read = |k: &str| std::env::var(k).ok().filter(|v| !v.is_empty());
    LaunchConfig {
        backend_url: Some(backend_url()),
        token: read("SSTPA_SESSION_TOKEN"),
        user_name: read("SSTPA_USER_NAME"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![request_shutdown, launch_config])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

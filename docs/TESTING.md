# SSTPA Tools Local Validation Startup

This procedure starts a fresh development checkout of SSTPA Tools with the
Docker backend stack and the Tauri desktop GUI.

## Local Validation Credentials

These are the credentials used for this workstation validation setup.

| Purpose | User | Password | Notes |
|---|---:|---:|---|
| SSTPA RootAdmin | `boss` | `sstpa-dev-2026` | Created through `/api/auth/bootstrap` for local validation. |
| Neo4j service | `neo4j` | `sstpa-dev-password` | Stored in `deploy/.env`; used by Neo4j and the backend. |
| Grafana admin | `admin` | `sstpa-dev-password` | Grafana is proxied at `https://localhost:8543/grafana/`. |

Do not reuse these credentials outside local development.

## Paths And Ports

Repository path:

```bash
/home/netrisk/Projects/SSTPA Tools
```

Important local URLs:

```text
Backend/API edge: https://localhost:8543
HTTP redirect:    http://localhost:8880
Grafana:          https://localhost:8543/grafana/
```

The local port and password values live in `deploy/.env`:

```dotenv
SSTPA_ENV=development
SSTPA_NEO4J_PASSWORD=sstpa-dev-password
SSTPA_GRAFANA_USER=admin
SSTPA_GRAFANA_PASSWORD=sstpa-dev-password
SSTPA_HTTP_PORT=8880
SSTPA_HTTPS_PORT=8543
```

## Start From A Clean Checkout

From the repository root:

```bash
cd "/home/netrisk/Projects/SSTPA Tools"
```

Remove old SSTPA containers and volumes when a true first-run state is needed:

```bash
cd deploy
docker compose down -v --remove-orphans
cd ..
```

If containers were created outside this compose project and must all be cleared:

```bash
docker rm -f $(docker ps -aq)
```

Create `deploy/.env` if it does not exist:

```bash
umask 077
cat > deploy/.env <<'EOF'
SSTPA_ENV=development
SSTPA_NEO4J_PASSWORD=sstpa-dev-password
SSTPA_GRAFANA_USER=admin
SSTPA_GRAFANA_PASSWORD=sstpa-dev-password
SSTPA_HTTP_PORT=8880
SSTPA_HTTPS_PORT=8543
EOF
```

## Build And Start The Backend

Run the backend tests:

```bash
cd backend
go test ./...
cd ..
```

Build and start the Docker backend stack:

```bash
cd deploy
docker compose up -d --build
docker compose ps
cd ..
```

Wait for the API to respond:

```bash
curl -sk https://localhost:8543/api/capability
```

## Trust The Local Caddy Certificate

The production Tauri GUI connects to `https://localhost:8543`. Caddy generates a
local root CA, and the host must trust it before the webview can call the API.

Check trust status:

```bash
installer/templates/trust-ca.sh --deploy-dir deploy --check
```

Install the local CA into the host trust store:

```bash
sudo installer/templates/trust-ca.sh --deploy-dir deploy --no-start
```

If this is skipped, `curl -k` may work while the Tauri GUI cannot reach the API.

## Create Or Verify The RootAdmin

On a brand-new database, either use the Startup GUI first-run form or bootstrap
the local validation RootAdmin from the terminal:

```bash
curl -sk -X POST https://localhost:8543/api/auth/bootstrap \
  -H 'Content-Type: application/json' \
  -d '{"userName":"boss","password":"sstpa-dev-2026","email":"boss@example.local"}'
```

If the RootAdmin already exists, the endpoint returns a conflict. Verify login:

```bash
curl -sk -X POST https://localhost:8543/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"boss","password":"sstpa-dev-2026"}'
```

## Build The Tauri Applications

Build the frontend web bundle:

```bash
cd frontend
npm ci
npm run build
cd ..
```

Build the main Tauri GUI:

```bash
cd frontend/src-tauri
cargo build --release
cd ../..
```

Build the Startup launcher:

```bash
cd startup/src-tauri
cargo build --release
cd ../..
```

## Launch With The Startup Tauri GUI

The Startup launcher is the normal activation path. It starts the backend,
checks health, authenticates the user, opens the main GUI, and stops the backend
when the main GUI exits.

```bash
SSTPA_DEPLOY_DIR="/home/netrisk/Projects/SSTPA Tools/deploy" \
SSTPA_GUI_BIN="/home/netrisk/Projects/SSTPA Tools/frontend/src-tauri/target/release/sstpa-tools-gui" \
SSTPA_BACKEND_URL="https://localhost:8543" \
"/home/netrisk/Projects/SSTPA Tools/startup/src-tauri/target/release/sstpa-startup"
```

Sign in with:

```text
User:     boss
Password: sstpa-dev-2026
```

## Launch The Tauri Dev GUI Without CA Trust

For immediate developer validation, the Tauri dev GUI can use Vite's `/api`
proxy. The proxy connects to Caddy with certificate verification disabled, so
this path works before the local Caddy CA is installed into the host trust
store.

Start from the repository root:

```bash
cd "/home/netrisk/Projects/SSTPA Tools"

TOKEN=$(curl -sk -X POST https://localhost:8543/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"boss","password":"sstpa-dev-2026"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

cd frontend
SSTPA_DEV_PROXY_TARGET="https://localhost:8543" \
SSTPA_SESSION_TOKEN="$TOKEN" \
SSTPA_USER_NAME="boss" \
npx tauri dev
```

When launched this way, the GUI API base remains same-origin
`http://localhost:5173`, and Vite proxies `/api` to
`https://localhost:8543`.

## Direct Main-GUI Launch For Debugging

Use this when the backend is already running and you want to bypass the Startup
launcher. This creates a short-lived API token and hands it to the GUI.

```bash
TOKEN=$(curl -sk -X POST https://localhost:8543/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"boss","password":"sstpa-dev-2026"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

SSTPA_BACKEND_URL="https://localhost:8543" \
SSTPA_SESSION_TOKEN="$TOKEN" \
SSTPA_USER_NAME="boss" \
"/home/netrisk/Projects/SSTPA Tools/frontend/src-tauri/target/release/sstpa-tools-gui"
```

When launching from a terminal embedded in Snap-packaged VS Code, scrub the Snap
GTK variables if WebKit reports library symbol errors:

```bash
env \
  -u SNAP -u SNAP_ARCH -u SNAP_COMMON -u SNAP_CONTEXT -u SNAP_COOKIE -u SNAP_DATA \
  -u SNAP_EUID -u SNAP_INSTANCE_NAME -u SNAP_LAUNCHER_ARCH_TRIPLET -u SNAP_LIBRARY_PATH \
  -u SNAP_NAME -u SNAP_REAL_HOME -u SNAP_REVISION -u SNAP_UID -u SNAP_USER_COMMON \
  -u SNAP_USER_DATA -u SNAP_VERSION -u GIO_MODULE_DIR -u GTK_EXE_PREFIX \
  -u GTK_IM_MODULE_FILE -u GTK_PATH \
  XDG_DATA_DIRS="${XDG_DATA_DIRS_VSCODE_SNAP_ORIG:-/usr/share/plasma:/usr/share/gnome:/usr/local/share:/usr/share:/var/lib/snapd/desktop}" \
  SSTPA_BACKEND_URL="https://localhost:8543" \
  SSTPA_SESSION_TOKEN="$TOKEN" \
  SSTPA_USER_NAME="boss" \
  "/home/netrisk/Projects/SSTPA Tools/frontend/src-tauri/target/release/sstpa-tools-gui"
```

## Shutdown

If the app was started through the Startup launcher, closing the main GUI stops
the backend stack with `docker compose stop`.

If the main GUI was launched directly, stop the backend manually:

```bash
cd "/home/netrisk/Projects/SSTPA Tools/deploy"
docker compose stop
```

To remove containers and local SSTPA data:

```bash
cd "/home/netrisk/Projects/SSTPA Tools/deploy"
docker compose down -v --remove-orphans
```

## Current Validation Checklist

1. `go test ./...` passes in `backend/`.
2. `npm ci && npm run build` passes in `frontend/`.
3. `docker compose up -d --build` starts all backend services.
4. `curl -sk https://localhost:8543/api/capability` returns backend capability JSON.
5. RootAdmin login works for `boss` / `sstpa-dev-2026`.
6. Tauri GUI starts from `frontend/src-tauri/target/release/sstpa-tools-gui`.

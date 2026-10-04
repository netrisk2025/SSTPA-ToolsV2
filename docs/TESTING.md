# SSTPA Tools — Testing and validation guide

Updated for the approved Loss Tool integration, SRS §6.5.10.22 (2026-10-04). This file specifies procedures; observed results are recorded in `VERIFICATION.md` and `PROGRESS.md`. A running port, seeded account or example dataset is not guaranteed by this document.

## Establish the test environment

Inspect existing services before starting or replacing them. `deploy/.env` supplies this installation's host ports and credentials; do not print its contents into shared logs. The development installation has historically used Caddy HTTPS 8543 and HTTP 8880, but verify the current configuration. Neo4j, Prometheus, Tempo and OTel remain on the private Docker network. Grafana is reached through Caddy and requires authentication; anonymous access and the public metrics proxy were removed.

```bash
cd "/home/netrisk/Projects/SSTPA Tools/deploy"
docker compose ps
curl -sk https://localhost:8543/api/auth/status
```

Use `docker compose up -d` only for the intended deployment after confirming its configuration. Schema/transaction integration tests use `backend/scripts/integration-test.sh`, which provisions a throwaway Neo4j; they do not require clearing the user's database. Do not run `docker compose down -v` as a troubleshooting step on an occupied installation.

For browser development, route API traffic through the Vite development proxy:

```bash
cd "/home/netrisk/Projects/SSTPA Tools/frontend"
SSTPA_DEV_PROXY_TARGET=https://localhost:8543 npm run dev -- --host 127.0.0.1 --port 5199 --strictPort
```

Open the exact reported URL. Port 4173 may belong to the separately approved Attack Tree prototype and is not the production SSTPA preview. `ERR_CONNECTION_REFUSED` means no process is accepting connections at the requested address; check the process and listener before changing firewall settings.

A production browser preview is different from the Vite development proxy: build the frontend, serve it on an unused port, and supply `?backend=https://localhost:8543` when this installation uses 8543. The production client validates the Caddy certificate; use the installed local trust root. The development proxy's `secure: false` applies only between Vite and Caddy and does not alter production TLS policy.

### Login credentials

Use an account provisioned for the selected test database. A previously provisioned development account is named `boss`; it is not seeded automatically on every startup. Retrieve its credential through the local approved configuration, not a new default password in this guide. A fresh disposable database exposes first-run RootAdmin bootstrap in the login UI. A populated database does not permit a second bootstrap.

## Full supported-host automated gate

Run from the repository root. Keep command outcomes, test counts, timestamps and failures in the verification record; run the final gate against the final source state.

```bash
(cd backend && go build ./... && go vet ./... && go test ./... && go test -race ./internal/api ./internal/model ./internal/schema)
(cd backend && ./scripts/integration-test.sh)
(cd frontend && npm test)
(cd frontend && npm run build && npm run lint)
(cd frontend/src-tauri && cargo check)
(cd startup/src-tauri && cargo check)
```

For a focused migration/identity regression run, use `cd frontend && npm test -- tests/loss/core-adapter.test.ts`; the full gate still requires `npm test`. The adapter fixtures cover candidate edits before first association Commit, imported authority/context, explicit legacy metric direction, collision-free endpoint IDs, partial presentation settings and world-center camera migration.

The frontend suite transfers the approved prototype's independent graph, metric, path, identity, export, layout and limit vectors, and adds production adapter/migration tests. Backend tests cover Core schema, G2M, authentication, ownership, trace derivation, Loss transaction guards, final graph limits and rollback. The pre-integration oxlint baseline was 10 warnings with exit 0; record the final count and investigate new warnings.

Verify the generated license catalog/source checksums and its inclusion in the production output using the frontend's license scripts. The production notice inventory must match the resolved lockfile, not the standalone prototype's old dependency list. Check the offline viewer through the main gear menu and inspect the installer output for retained license/source materials.

Other product checks:

```bash
# External FireSat builder against the current mirrored schema, isolated output
sustainment/.venv/bin/python Example_Data/FireSat/build_firesat.py --out-dir /tmp/sstpa-firesat-verification --no-package

# Offline reference pipeline using already acquired data; its validation uses throwaway Neo4j
(cd sustainment && .venv/bin/python -m sstpa_ref.pipeline --config config.yaml --skip-acquire)

# Package staging without rebuilding native shells or Docker; inspect its manifest limitations
./installer/scripts/build-package.sh --skip-tauri --skip-docker --version verification --out /tmp/sstpa-package-verification
```

A `--skip-tauri` package staging pass does not verify native desktop behavior. A successful `cargo check` does not prove a native installer was executed. Linux verification cannot establish Windows-native operation (REQUIREMENTS-NOTES N-1).

## Current FireSat baseline

The application no longer seeds or resets an embedded FS-namespaced example. The external package under `Example_Data/FireSat` contains `CAP__1`, 33 Systems across SoI indexes 1–4, 467 nodes and a hierarchy extending to Tier 8. Its YAML and hierarchy document are the source for expected names/counts. The old `CAP_FS_0`, `SYS_FS1_0`, `LOS_FS1_1` walkthrough describes a removed dataset and must not be used as current evidence.

The structural package intentionally leaves Assets, traces, Attacks, Loss trees and Countermeasures as tutorial exercises. For Loss verification, create an explicitly labeled fixture in an isolated database or use an existing authorized analysis. Do not inject the prototype's illustrative FireSat nodes into live Core data merely because their names match. Load or reset external examples only through the guarded package procedure in `Example_Data/Skills.md`; there is no `/api/examples` endpoint or gear-menu reset action.

## Main application regression walkthrough

1. Sign in; verify Backend connection status, current user, the 17 tool entries and Shutdown control.
2. Navigate a known hierarchy, select an SoI, open Main Panel sections and the Data Drawer. Confirm fixed UUID/HID/ownership fields remain read-only and ordinary edits stay staged until Commit.
3. Exercise an authorized non-owner edit on disposable data. Confirm the edit's transaction records the specified notification; ownership transfer is a separate explicit operation, not a side effect of every edit.
4. Open Requirements and Asset Manager; inspect read-only SysML/KerML model text from the same Core graph. Model text editing remains deferred under REQUIREMENTS-NOTES M-4.
5. Create CURRENT trace coverage for the test Asset/State and verify generated protection requirements and assurance inheritance. Superseded traces remain in the audit history.
6. Search installed reference data, inspect read-only framework content and perform an authorized clone into an owned Core node.
7. Generate representative specification, gap and controls reports; verify supported Markdown/HTML/print export paths.
8. Switch Light/Nocturne via the gear menu. Open Hover Help and Product & License. These are working controls, not “Under Construction” placeholders.
9. Open Navigator, State, Requirements and Flow diagrams; export full-scene and viewport SVG. Inspect labels, edge direction, bounds and escaped special characters after replacing the inherited SVG plugin.
10. Verify expected telemetry through authenticated Grafana and internal Prometheus scraping. The removed public metrics proxy must remain unavailable.

## Loss Tool acceptance walkthrough

Use a disposable complete fixture with one Loss, Environment, State group, traced entities, leaf Attack, Countermeasure and counter-attack, plus a shared node and a derived terminal. Keep one leaf without an authoritative UUID only while it is genuinely staged.

| Check | Procedure and expected result | SRS §6.5.10.22 |
|---|---|---|
| Production context | Open from Loss drawer and Control Panel; retain selected SoI and unrelated drawer drafts. Trace Coverage, auto-build/rebuild, findings and related-tool links remain available. Exercise ordinary Asset Loss/Goal generation and canonical DerivedAsset terminal association; dedicated DerivedAsset Loss/GSN spawning remains deferred under I-12. | .1–.2 |
| Transaction boundary | Edit leaf input, root rules and layout together; Commit awaits backend success and increments version once. Revert restores the committed graph and view. A rejected transaction preserves the draft. If the transaction succeeds but reload fails, distinguish committed/refresh-pending and require reconciliation before another submission. | .3 |
| Conflict | Open two copies at one tree version; commit one then the other. The stale copy receives a conflict without overwriting Core state. | .4 |
| Semantic validation | Reject illegal type links, cycles, duplicate edges and invalid SAND sequences. Verify the root Environment context AND is separate from State OR/SAND. | .5–.6 |
| Canvas | Inspect rounded compartment cards, gate text, non-overlap, local ELK worker, pan/zoom/fit/root/search/minimap and selection. A stale layout response must not replace a newer draft. | .7–.10 |
| Property menu | First section Node properties, second Attack metrics. Toggle local ID/UUID/provenance independently from metrics; inspect full stable IDs and the actual Core UUID. | .11–.12 |
| Staged identity | Create an Attack or Countermeasure. Before Commit, hide optional identity rows and still require “not yet committed”; after success require the returned authoritative UUID. | .13 |
| Root view | Change all four supported color channels, display selections, direction, position, viewport and folds; Commit/reopen restores them. Legacy JSON fixtures preserve snapshot/unknown fields. | .14–.16 |
| Folding | Right-click roll-up/down; require folded accent/count/continuation, preserved shared reachability and identical analytical values. | .17–.18 |
| Capacity | Exercise below/at/beyond node/depth/width thresholds. Warnings appear at 800/16/40; exact 1000/20/50 succeeds; overflow is atomic and recommends decomposition. Hidden/tailored nodes still count. | .19–.21 |
| Metrics | Run scalar and coherent scenario cases; leaf inputs only, branch findings, read-only parent/root values, explicit units/defaults/unknowns, correct paper-derived vectors and incomplete qualifiers. | .22–.25 |
| Decisions and paths | Tailoring, complete blocking and Allowed RV are edge-scoped with rationales. Exact count is separate from bounded routes, pages and truncation status. | .26–.27 |
| Exports | JSON, SVG, CSV and Markdown identify Loss/version/scope/completeness; exported visible SVG includes offscreen cards and fold markers; CSV user text cannot become formulas. | .28 |
| Product notices | Access notices without opening Loss, disconnect networking, inspect exact package versions/license text and matching ELK source archives. Confirm the build/package retains them. | .29–.30 |
| Regression tests | Run transferred domain cases, production adapter/backend cases and the original tools' replacement SVG exporter cases. | .31–.32 |

For the isolated FireSat UI fixture, `frontend/scripts/seed-loss-verification.mjs` only accepts `http://127.0.0.1:18089` with Backend environment `integration-verification`. It is an opt-in verifier fixture, not startup or deployment seeding. Load structural FireSat into that disposable database first.

Record the actual fixture, application origin, source revision, browser errors and outcomes. UI verification complements numerical and database tests; it does not replace them.

## Troubleshooting

| Symptom | Investigation |
|---|---|
| Preview refuses connection | Confirm the exact service process, host address and port. Do not confuse standalone prototype 4173 with SSTPA development 5199. |
| DISCONNECTED or login network error | Check `/api/auth/status`, Vite proxy target and the active Caddy port. Production direct access additionally requires the local CA trust configuration. |
| Empty Loss selector | Confirm current SoI contains a Loss; the structural FireSat package does not supply a prebuilt analysis. |
| Missing Trace Coverage | Inspect CURRENT HOLDS/TRANSPORTS/USES for the Loss Asset/State; rebuild is not a substitute for upstream trace data. |
| Commit conflict | Preserve/export the draft, reload current Core state and reconcile; do not remove the version precondition to force a save. |
| Tree capacity rejection | Read actual node/depth/width measurements; folding and tailoring do not lower stored graph capacity. Decompose the system. |
| Incomplete risk | Inspect missing inputs, scenario budget, shared-event correlation or stochastic assumptions; do not relabel a partial result as complete. |
| Reference search empty | Check the installed reference artifact and use the guarded reference loader for the intended test database. |
| SVG/license package failure | Run exporter/license tests and inspect the exact final lockfile, generated catalog paths and packaged source checksums. |

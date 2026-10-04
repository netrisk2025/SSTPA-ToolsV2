# SSTPA Tools Progress Log

This file records implementation checkpoints and verification status while the
application is completed against `SSTPA Tool SRS V7.md`.

## 2026-10-04 — Approved Goal Keeper production integration and colors

Replaced the old Goal Keeper tier display with the approved GSN v3 core SVG presentation. The alternate graph/actual Backend text is on-demand through View; the main canvas uses complete statements, canonical glyphs/arrows and undeveloped markers. Added the Loss-style six-type/four-channel color selector with theme defaults/reset and explicit Core presentation commit. Both tools share the locally bundled ELK factory; no runtime dependency was added. Core identities, authoring/evidence, ownership and SoI context remain authoritative. Legacy presentation envelopes are preserved additively.

Added final-state GSN Backend validation, legacy cross-scope expansion, display-ID/root/cycle guards and an exact root-view precondition for stale saves. Frozen UI drafts survive background refresh/root disappearance; commit/reload failures retain a clear reconciliation boundary. Updated SRS §6.5.11.27, I-20, architecture and verification procedures.

Final supported-host gate: frontend 312/312, standalone 173/173, Go 53 unit +17 database integration, vet/build/race, both native checks/releases, synthetic sustainment 17/17 +reference DB 6/6, FireSat 10/10 +2 loads/refusals 2/2. Build/lint/audit/license checks pass; the 10 pre-existing lint warnings remain. Production browser FireSat walkthrough and Loss shared-worker regression pass; no production data changed. Final installer verifies 571 checksums/130 license files and both native binaries. [GOALKEEPER-VERIFICATION.md](GOALKEEPER-VERIFICATION.md) records evidence, storyboard and unqualified native-runtime/Windows/authentic-reference scopes.

SBOM impact: jsdom 26.1.0 is a test-only dependency; existing elkjs 0.12.0 and its verified notices/sources are reused. Runtime production closure remains 93 npm packages. Native bundling used the documented watcher-capacity release-binary fallback; no deployment or operational approval is claimed.

## 2026-07-06 — Example Data: external FireSat package is now the only example; embedded exemplar removed

Populated the deployment with the external FireSat Example Data package and
removed the old embedded exemplar (product-owner directive):

- Re-ran `Example_Data/FireSat/load-example-data.sh` against the running
  stack (checksum-verified, collision-guarded, MERGE-idempotent): 467 nodes,
  33 Systems to Tier 8 under `CAP__1`. Acceptance queries green — zero
  duplicate HIDs, every System complete (Purpose/Environment/State/Function/
  Interface/Element) and reaching a Requirement, every Connection with ≥ 2
  participating Interfaces.
- Removed the embedded FS-namespaced exemplar from the application:
  `internal/api/example.go` deleted; startup seeding call removed from
  `cmd/sstpa-backend/main.go`; `GET /api/examples` and
  `POST /api/examples/reset` routes removed; gear-menu "Reset FireSat
  example" action and `api.examples`/`api.resetExample` client methods
  removed. Reset/reload is now performed outside the application with the
  idempotent loader (Example_Data/Skills.md Skills 4–5). I-13 amended;
  TESTING.md procedures updated.
- Deleted the 46 old exemplar nodes (`IsExampleData: true`, FS HID space)
  from the deployment database. One user-created node inside the FS space
  (`CM_FS1_2` "Standby_Timer", Creator boss, a 2026-07-04 verification
  leftover attached only to a deleted exemplar State) was preserved per
  Example_Data/Skills.md Skill 5 and flagged to the owner.

Verification: `go build ./... && go vet ./... && go test ./...` green;
`npm run build` clean; backend image rebuilt and restarted — no re-seed
after restart (0 IsExampleData nodes); live `/api/hierarchy` serves exactly
one example root (`CAP__1` FireSat, 33 Systems); `/api/examples` returns 404.

SBOM impact: none. No software applications or libraries were added.

## 2026-07-06 — Power-outage recovery check + Add-on Tool window/panel/layout fixes

Power-outage assessment (an agent session was interrupted mid-work): the
working tree held three uncommitted tracked changes — `CLAUDE.md` (replaced by
the Agent.md pointer, per the new project-navigation convention),
`frontend/src-tauri/src/lib.rs` (backend-URL auto-discovery from
`deploy/.env` / `SSTPA_DEPLOY_DIR`), and `frontend/src/api/client.ts` (launch
config attempted outside a detected Tauri shell; failures still resolve null).
All three are internally complete and coherent — no truncated or corrupted
files; `go build ./...`, `go test ./...`, `npm run build`, `oxlint`, and
`cargo check` (frontend shell) all pass. The lib.rs/client.ts pair is retained
as inherited work-in-progress.

Add-on Tool window and panel fixes:

- **Tool windows fit the viewport and resize from any edge** (`ToolShell.tsx`):
  initial size/position now clamp to the viewport (previously a window taller
  than the screen hid its bottom content with the only resize grip off-screen);
  full-width bottom edge, left edge, and right edge are now draggable resize
  handles alongside the bottom-right grip; window moves keep the header
  reachable; the window frame persists per tool per machine
  (`sstpa.toolwin.<toolId>`); the shell canvas keeps its scrollbar for content
  taller than the window.
- **All docked tool panels are width-adjustable**: new shared `ResizablePane`
  (`tools/shared.tsx`) with a drag handle on the panel's inner edge and
  per-panel persisted width (`sstpa.pane.<key>`). Replaced every fixed-width
  side panel across Navigator, Requirements, State, Flow, Trace, Reference,
  Context, Controls, Loss, Goal Keeper, Use-Case, Connection, Attack, and
  Admin (the Model Text Panel was already resizable).
- **Diagram layout persistence as views** (REQUIREMENTS-NOTES I-18): Navigator,
  State, and Requirements canvases now persist the user's node arrangement —
  new schema properties `NavigatorViewJSON` on `(:Project)` and
  `StateViewJSON`/`RequirementsViewJSON` on `(:System)` (embedded + docs
  schema mirrors), excluded from G2M translation (§3.7.2 tool-state JSON).
  Each tool has a "Save layout" control; saved positions restore via preset
  layout with a grid fallback for new nodes (same pattern as the Flow Tool).
  Flow, Use-Case, and Goal Keeper already persisted their layouts.
- **SysML/KerML → image direction verified** (no code change): every diagram
  is rendered from Core Data Model graph data; the SysML 2.0 / KerML 1.0 text
  is the G2M projection of that same graph. Model text is never derived from
  images, and layout JSON is never semantic (schema constraints +
  `model.go` `toolStateProps` exclusion verified).

Verification: `cd backend && go build ./... && go test ./...` (all pass);
`cd frontend && npm run build` (tsc + vite clean) and `npm run lint`
(warning count identical to pre-change baseline); schema JSON diffs limited
to the added Diagram Views property groups.

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Complete UI redesign: the "Instrument" design system (`ui-redesign` branch)

The Art Nouveau visual identity was removed end-to-end and replaced with a
minimalist system (docs/DESIGN.md; deviation recorded as REQUIREMENTS-NOTES
I-17). Highlights:

- `sstpa-default.css` rewritten: semantic tokens (`--sstpa-bg/surface/text/
  muted/accent/…`), Light + Dark styles, hairline-only elevation, no drafting
  grid/double borders/gold ornament. Token renames swept through all 28
  components/tools.
- Typography: IBM Plex Sans 400/500/600 replaces Source Sans 3 + Cormorant SC;
  JetBrains Mono retained for HIDs/model text. No display serif remains.
- Iconography: emoji glyphs replaced by an inline SVG set
  (`components/Icon.tsx`); tool manifests now reference glyph names. New
  control-loop `Mark` replaces the logo in all chrome; the heritage logo now
  appears only in the Product & License dialog.
- Node-type categorical palette re-derived and validated for CVD separation
  and surface contrast in both styles; `NodeTypeBadge` renders tinted chips.
- Cytoscape graph styling (Navigator/Requirements/State/Flow) now resolves
  design tokens at graph build time (`shared.uiToken()/graphTheme()`) — graphs
  follow the active style.
- New flat indigo control-loop app icon generated for both Tauri shells
  (icns/ico/png) plus favicons; startup launcher UI restyled with
  light/dark support.

Verification: `npm run build` (tsc + vite) and `npm run lint` clean;
`cargo check` clean for both shells; full stack exercised against the running
Docker backend with Playwright — login, main window (sections, entity cards,
badges, Data Drawer), Navigator/Requirements tool windows, gear menu, and the
launcher captured in light and dark styles.

## 2026-07-04 — All 17 Add-on Tools upgraded to SRS conformance

Every Add-on Tool was audited against its SRS section and rebuilt to production
quality on a shared tool infrastructure (`frontend/src/tools/shared.tsx`:
uniform loading/error/empty states, PNG+SVG diagram export, styled prompt).

- **Navigator** (§6.5.1): four modes incl. Clone Node / Clone with
  Requirements, schema-driven Association, Search/Locate, per-type visual
  encoding, viewport controls, legend, PNG/SVG export, stable in-place layout.
- **Requirements** (§6.5.2): creation, deletion with dependents, PARENTS +
  Verification management with backend validation, SVG export.
- **Reports** (§6.5.3): Controls-list CSV, cross-SoI-aware gap analysis,
  optional G2M SysML/KerML appendix.
- **Reference** (§6.5.4): hierarchy pane, clickable related items, independent
  framework/version filters, return-to-drawer.
- **State** (§6.5.5): parallel-transition-safe edits, real Context/Criteria
  filtering, Hazard/CM/Requirement association, SVG export.
- **Flow** (§6.5.6): container-scoped rendering, edge/flow-nature editing,
  Requirement/Countermeasure assignment, Feedback projection.
- **Asset Manager** (§6.5.7): relationship allocation, removal warnings, full
  table with sorting/column-visibility, Regime/Environment steps.
- **Context** (§6.5.8): Environment summary graph, Hazard management with
  reference clone, Loss allocation, Markdown report.
- **Trace** (§6.5.9): pre-commit summary, correct cell states, row/column
  badges, expanded validation, New Entity Mode, MD/JSON/CSV exports.
- **Loss** (§6.5.10) + backend: T5+ counter-attack auto-build tiers,
  snapshot-reconciliation findings, tree editing, metric bottom bar, RV report.
- **Goal Keeper** (§6.5.11): fixed root resolution, cycle/duplicate/uniqueness
  validation, richer evidence, path-to-root, layout JSON export.
- **Use-Case** (§6.5.12): Interface/Function creation, actor editing, draggable
  persisted diagram, consistent completeness.
- **Connection** (§6.5.13): already conformant, retained.
- **Message Center** (§6.5.14): fixed render-loop mark-read, sortable columns,
  keyboard navigation, per-user delete.
- **Admin** (§6.5.15): three-region layout, full roster, two-step ADMIN
  authorization, disenrollment wizard with retention.
- **Attack** (§6.5.16): in-tool reference clone, per-row actions, Hazard-borne
  attacks, criticality/assurance scope filter, MetricsJSON editor.
- **Controls** (§6.5.17): initial-baseline generation from NIST reference,
  nine-column table, multiple baselines, status-lifecycle gating.

Schema: added `(:GsnStrategy)-[:SUPPORTED_BY]->(:GsnGoal|:GsnSolution)`
(§6.5.11.7); widened Attack clone sources to AK_Tactic/EMB3D_Vulnerability
(§6.5.16.6, I-16). New interpretations I-14/I-15 (M2G subset), I-16.

Verification: full gate green — `go test ./...`, backend integration suite
(throwaway Neo4j), `tsc --noEmit`, `oxlint`, `npm run build`, both Tauri
`cargo check`, live Caddy/Neo4j stack; every tool driven and screenshotted in
a headless browser against the seeded FireSat project with zero page errors;
Nocturne dark style verified.

## 2026-07-04 — Production-readiness pass

Full-codebase audit against the SRS followed by fixes across every segment.

Backend (§3, §5):
- Closed a Cypher-injection vector in `deleteRelationship` (unknown relationship
  types are now rejected before interpolation).
- HID/uuid/UserName uniqueness enforced with database constraints (concurrent
  commits can no longer mint duplicate identities).
- Fixed protection-Requirement generation (§3.3.4.6.3): the previous `LIMIT 1`
  collapsed each batch to one Requirement and duplicated HIDs; now one
  Requirement per qualifying (entity, Asset) pair with distinct identities.
- Trace derivation recompute runs for every SoI whose trace edges moved,
  including scopeless commits and traced-entity deletions.
- Reference-clone notifications verify creation and roll back on missing mailbox
  (§5.6.6.8.1); Prometheus counters moved outside the managed transaction.
- Session tokens expire; `POST /api/auth/logout`, `GET /api/auth/status`, and
  `GET /api/auth/me` added; internal Neo4j URI no longer leaked from capability.
- `transferOwnership` commit op (§5.6.6.8.2); structured owner-change fields on
  notifications; per-user message deletion (§6.5.14.11); full Admin account
  lifecycle (§6.5.15: suspend/reinstate/disenroll-with-retention, two-step
  ADMIN authorization, roster counts).
- Model Translation API (§5.6.6.12, §3.7): G2M SysML/KerML projection, SSTPA
  Profile Library, M2G property-edit subset — see I-14/I-15.

Deploy/installer (§2, §5.7, §9):
- Removed the public `/metrics-proxy`; disabled Grafana anonymous access;
  compose requires explicit passwords.
- Portable, robust `load-reference-data.sh` (+ Windows `.ps1`).
- Installer redone: prerequisite checks, secrets never packaged, fresh
  per-install credentials, always-staged release binaries, uninstallers.
- Reference-data pipeline validated end to end (6,897 REF nodes loaded).

Startup/Frontend launch chain (§4):
- Fixed the dead 8543 backend port → Caddy 443 edge; health gate polls a
  proxied endpoint; first-run RootAdmin bootstrap; single sign-on handover to
  the GUI; CSP added to the Tauri webview.

GUI shell (§6.2–6.4):
- Data Drawer Add/Associate actions, safe drawer replacement, orphan
  assessment, staged-state clearing, keyboard-accessible dialogs.
- Main Panel schema-driven Add/Associate, Analysis section for all node types,
  error/retry states.
- Manifest-driven Branding-panel tools, working style switching (Nocturne dark
  style), Admin-hidden-from-users, per-tool Model Text Panel with highlighting
  and export.

Verification: `go test ./...`, backend integration suite (throwaway Neo4j:
auth, commit+trace derivation, ownership transfer, per-user message delete,
admin lifecycle, model translation) all green; `npm run build`; both Tauri
shells `cargo check`; live Docker stack exercised end to end with a seeded
FireSat project (trace inheritance and six protection Requirements verified,
Loss auto-build, G2M model text); GUI screenshotted via headless browser.

## 2026-07-04 — Loss Tool Integration

- Wired backend Loss Tool endpoints for attack-tree load, auto-build/rebuild,
  and bounded path enumeration.
- Scoped `[:AT_RELATES_TO]` deletes by `LossHID` in the commit pipeline and added
  Loss ownership/default-property validation for new attack-tree edges.
- Corrected attack-path enumeration so environment-only and other non-terminal
  leaves do not count as valid paths.
- Replaced the frontend Loss Tool scaffold with a working tool surface:
  Loss selection, trace coverage, tiered tree view, edge detail edits, path/RV
  analysis, metric definition editing, CSV export, and Markdown RV report export.
- Added backend unit tests for terminal path handling, Allowed RV classification,
  metric extraction, and TailoredOut path exclusion.

Verification:

- `cd backend && go test ./...`
- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Attack Tool Implementation

- Replaced the Attack Tool scaffold with a working SRS-shaped tool surface:
  entity roster, entity Attack associations, Attack creation, existing Attack
  association/removal, hierarchy management using `[:SUBORDINATE_TO]`, catalog
  view, asset-scope filtering based on CURRENT trace coverage, editable Attack
  details, `MetricsJSON` validation, `TARGETS_LOSS` scoping, and CSV/Markdown
  exports.
- Kept Attack Tool mutations on canonical Core Data (`(:Attack)`,
  `[:EXPLOITS]`, `[:SUBORDINATE_TO]`, `[:TARGETS_LOSS]`) and did not create
  Loss Tool-owned `[:AT_RELATES_TO]` edges.

Verification:

- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Goal Keeper Tool Implementation

- Replaced the Goal Keeper scaffold with a working GSN assurance-case tool:
  Asset/Loss/Root Goal structure selection, rooted GSN DAG display, evidence
  view, validation view, export view, search, GSN node editing, GSN node
  creation, existing-node linking, relationship removal, Solution evidence
  association, layout snapshot persistence, and Markdown/JSON exports.
- Uses canonical Core graph relationships: `[:SUPPORTED_BY]`,
  `[:IN_CONTEXT_OF]`, `[:HAS_VALIDATION]`, `[:HAS_VERIFICATION]`, and
  `[:HAS_LOSS]`.

Verification:

- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Use-Case Tool Implementation

- Replaced the Use-Case Tool scaffold with a working SysML-style Use Case tool:
  Use Case creation under Purpose, selection/search, actor list management,
  Interface and SystemFunction association/removal, inter-UseCase
  `[:INCLUDES_UC]` and `[:EXTENDS]` relationships with Extension Point capture,
  requirement allocation through participating Interfaces/Functions, validation,
  diagram snapshot persistence, and Markdown/JSON exports.
- Kept Requirements attached to participating `(:Interface)` and
  `(:SystemFunction)` nodes via `[:HAS_REQUIREMENT]`, matching the schema rule
  that Requirements are not directly related to `(:UseCase)`.

Verification:

- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Connection Tool Implementation

- Replaced the Connection Tool scaffold with a working graph-analysis tool:
  Connection creation, System ownership assignment/reassignment, Interface
  participant association/removal through `[:PARTICIPATES_IN]`, relationship
  edge-property editing, direct Connection requirements, selection/filter/display
  modes, validation, and Markdown/SysML/JSON exports.
- Implemented filters for owner System, System tier, OSI layer, directionality,
  participating Interface, and free-text Connection/participant search.

Verification:

- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Controls Tool Implementation

- Completed the missing `(:ControlsBaseline)` schema support in the embedded
  backend schema and mirrored docs schema, including `[:HAS_CONTROLS_BASELINE]`,
  categorization properties, analytical selection fields, `ControlsBaselineJSON`,
  lifecycle status, and active-baseline flag.
- Replaced the Controls Tool scaffold with a working table-first RMF baseline
  workflow: SoI baseline creation, C/I/A categorization, overlay capture, Cyber
  Resilience entries, Cyber Survivability Attribute entries with traceability,
  baseline control import/add/search, tailoring, mapping to Core
  `(:SecurityControl)` nodes, Requirement creation/allocation, Countermeasure
  creation/satisfaction/scope, validation, and CSV/KerML/JSON exports.

Verification:

- `cd backend && go test ./...`
- `cd frontend && npm run build`

SBOM impact: none. No software applications or libraries were added.

## 2026-07-04 — Installer Segment Implementation

- Added the `installer/` segment with package staging, optional Backend image
  build, optional Tauri bundle builds, optional Docker image archive capture,
  POSIX shell and Windows PowerShell install helpers, package manifests, and
  SHA-256 checksum generation.
- Added Tauri project ignore files and installer fallback behavior so package
  staging still emits release binaries on hosts where the Tauri CLI native
  bundler panics before bundling.
- Hardened the installer package manifest to report native bundle status per
  Tauri app and added a Linux inotify-capacity preflight so watcher-exhausted
  hosts use the release-binary fallback without a noisy CLI panic.
- Added validated Reference Data artifact packaging: the newest
  `sustainment/artifacts/sstpa-ref-data-*.tar.gz` is checksum-verified, staged
  under `payload/reference-data/`, recorded in `package.properties`, and surfaced
  by the install helpers with the load command.
- Updated Startup Software Frontend discovery so release-binary fallback
  packages launch the GUI from the installed `bundles/frontend/bin` directory.
- Updated `FloorPlan.md` for the new installer subdirectories and documented the
  installer path in README and architecture notes.
- Verified the lightweight package path with
  `./installer/scripts/build-package.sh --skip-tauri --skip-docker --version 0.1.0-test`.
  Verified the Tauri-enabled package path with
  `./installer/scripts/build-package.sh --skip-docker --version 0.1.0-tauri-smoke`.

Verification:

- `./installer/scripts/build-package.sh --skip-tauri --skip-docker --version 0.1.0-test`
- `./installer/scripts/build-package.sh --skip-docker --version 0.1.0-tauri-smoke`
- `cargo tauri build --no-bundle --ci` (observed host inotify instance exhaustion;
  release-binary fallback remains the supported package path on this host)
- Reference Data artifact verification through package staging:
  `sustainment/artifacts/sstpa-ref-data-2026-07-04-v1.tar.gz.sha256`
- `cd startup/src-tauri && cargo check`

SBOM impact: documented the Tauri CLI build tool version and the packaged
Reference Data artifact versions; container image tag entries were aligned to
`deploy/docker-compose.yml`.

## 2026-07-04 — SysML 2.0 / KerML 1.0 model display (G2M translator)

New standing directive: every model-displaying Add-on Tool except the Message
Center must display its model from SysML 2.0 / KerML 1.0-transformed data.

- Implemented the G2M translator (`backend/internal/model`): Core Data Model
  graph → SysML 2.0 / KerML 1.0 textual notation per §3.7.5/§3.7.6, plus the
  SSTPA Profile Library (§3.7.3). Deterministic and idempotent (§3.7.8):
  ordered by HID type-identifier then sequence; unrestricted names for HIDs
  and reserved words.
- Exposed `/api/model/sysml`, `/api/model/kerml`, `/api/model/profile`,
  `/api/model/validate`, `/api/model/commit` (§5.6.6.12); capability discovery
  advertises `model.translate.read` and `model.profile.read`.
- Wired the Model Text Panel (§6.4.2) to live G2M with SysML/KerML keyword
  highlighting. Verified in the running app (Requirements Tool shows the live
  SysML projection of the SoI). SysML notation sourced from the SysML_Vault.
- Corrected three tool manifests to match their SRS Model Text Panel sections
  (Reports, Reference, Context) so all model tools declare SysML/KerML.
- Fixed a pre-existing `handleRequirementsBySoI` Cypher bug (ORDER BY after an
  aggregating RETURN) surfaced during verification.
- Added G2M unit tests (determinism, SysML/KerML mappings, domain
  classification, unrestricted names). `go test ./internal/model/` passes.
- M2G text-commit deferred (read-only panel); recorded in REQUIREMENTS-NOTES
  M-4. Editing remains on the canvas/Data Drawer staged-commit path.

Verification:
- `cd backend && go test ./internal/model/ ./internal/schema/`
- Live G2M: `GET /api/model/sysml?scope=SOI&soi=SYS_1_0` returns valid SysML 2.0.
- Playwright: Model Text Panel renders highlighted SysML in the Requirements Tool.

SBOM impact: none (no new libraries; G2M is pure Go stdlib).

## 2026-07-04 — FireSat example data (§3.6) + Help data (§3.5)

- FireSat exemplar (`backend/internal/api/example.go`): a 3-tier-deep example
  Project (FireSat Capability → FireSat → Satellite Bus → Infrared Sensor) with
  environments, states + transitions, components, functions, interfaces, a
  connection, primary + derived assets, trace relationships, a hazard→control→
  countermeasure→attack chain, a Loss + root Goal, and requirements. Owned by
  "SSTPA Tools" (immutable ownership); IsExampleData/ExampleProject markers.
- Namespaced HID indices (FS1, FS1.1, FS1.1.1) partition the exemplar from the
  working Capability; HID grammar relaxed to accept alphanumeric index segments
  (REQUIREMENTS-NOTES I-13). Seeded on startup if absent.
- Reset endpoint (`POST /api/examples/reset`) + `GET /api/examples`; wired to
  the gear-menu "Reset FireSat example" action (§3.6).
- Help Data (`backend/internal/api/help.go`): 24-entry SSTPA terminology/field/
  tutorial catalog at `GET /api/help`, shown in the gear-menu "Hover help &
  definitions" dialog (§3.5, REQUIREMENTS-NOTES I-14).
- End-to-end verified on FireSat:
  - Navigator renders the full 3-tier hierarchy (Playwright shot 11).
  - G2M SysML/KerML projects every FireSat SoI including the deepest.
  - Loss Tool auto-build on LOS_FS1_1 produced an 8-node attack tree, 1 path:
    "Compromise FireSat Authenticity → Downlinking → Downlink Radio →
    RF Alert Spoofing → Digital Signature of Alerts [BLOCKED]" — the full
    trace→loss→attack-tree→path-analysis workflow working on real example data.

Verification:
- `cd backend && go test ./...` (all pass)
- Live: startup seeds FireSat; `POST /api/examples/reset` reloads; `/api/help`
  returns 24 entries; Loss auto-build + path enumeration succeed on FireSat.

SBOM impact: none.

## 2026-07-04 — External FireSat Example Data package (SRS §3.6.1)

- Created `Example_Data/` at the repository root for example-data projects
  managed outside the application (SRS §2, §3.6), with tailorable YAML source,
  build/validate/package scripts, and deployable Cypher artifacts.
- Built the packaged FireSat example project: 4 Tier-1 segments (Space,
  Command, Aviation, Ground), 33 Systems decomposed to Tier 8 along the Space
  Segment payload spine, 467 nodes, and 842 relationships. Every System carries
  Purpose, Environment, States with transitions, Functions, Interfaces,
  Requirements, a System-Element, and leaf Elements.
- Source of truth is YAML under `Example_Data/FireSat/model/`;
  `build_firesat.py` validates against `docs/schema/*.json` and emits an
  idempotent Cypher artifact packaged like Reference Data (`tar.gz` + SHA-256).
  `load-example-data.sh` mirrors `deploy/load-reference-data.sh` and guards
  against HID collisions with user-owned Core data.
- `Example_Data/FireSat/FireSat-Hierarchy.md` documents the hierarchy,
  communications map, and requirements flow-down; `dist/hierarchy-tree.txt`
  regenerates each build. Assets/traces, Use Cases, Losses, Attack Trees,
  Control Structures, and Countermeasures remain tutorial exercises on top of
  the structural package.

Verification:
- Loaded the artifact twice into a throwaway `neo4j:2026.05.0-community`
  container: 467 nodes both runs, zero duplicate HIDs, all 11 Connections have
  at least two participating Interfaces, and every System reaches at least one
  Requirement.
- Loaded into the running deploy stack via
  `Example_Data/FireSat/load-example-data.sh` with checksum verification,
  collision guard, and matching post-load count.

SBOM impact: none (no new runtime dependencies; builder uses the existing
sustainment Python environment).

## 2026-07-04 — Final verification & SBOM audit pass

- Ran full backend test suite (schema, model/G2M, api/loss) — all PASS; `go vet`
  clean.
- Comprehensive endpoint smoke: 20 API endpoint categories + `/metrics` +
  Grafana health all return HTTP 200 against seeded FireSat data.
- Telemetry confirmed live: Prometheus scrapes backend `/metrics`; Grafana
  served through Caddy; SSTPA custom metrics recorded.
- SBOM.md updated to audit grade: exact pinned versions for Go (8 direct, 92
  total), npm (23 direct listed, 181 total), Rust (Frontend 455 / Startup 419
  crates), Python, container images, fonts, and reference data sets; machine-
  readable manifest locations documented for full transitive audit.
- Added docs/VERIFICATION.md mapping each major SRS area to its verification
  method and result, plus known deferrals.
- All 12 build tasks complete. Application is functionally complete and running.

Verification:
- `cd backend && go vet ./... && go test ./...`
- 20/20 endpoint categories return 200; telemetry endpoints healthy.

SBOM impact: version detail expanded to audit grade; no new components.

## 2026-09-27 — Theme retune: Portfolio craft (parchment Light / bluish-grey Dark)

Product-owner redirect: keep dual Light/Dark (gear menu; `nocturne` stored
name) but restyle away from cool white/black "Instrument" toward a
turn-of-the-19th-century architect's portfolio.

Changes:
- `frontend/src/styles/sstpa-default.css`: retuned `:root` and
  `:root[data-sstpa-style="nocturne"]` surface/ink/accent/canvas tokens
  (Light parchment `#E8DCC8` / Dark bluish-grey `#1A2330`); warmer shadows;
  slightly softer radius (5/8); subtle inset double-line on `.sstpa-frame`.
- Bundled Libre Baskerville 400/700 (OFL-1.1) under
  `frontend/src/assets/fonts/`; `--sstpa-font-display` applied to branding
  wordmark, drawer/tool titles, dialog h2, login wordmark only. UI body
  remains IBM Plex Sans; HID mono unchanged. No Google Fonts CDN.
- `startup/ui/index.html`: aligned inline tokens with the same palette
  (trivial share).
- Docs: `DESIGN.md` rewritten for Portfolio identity; `REQUIREMENTS-NOTES`
  I-17 annotated with the 2026-09-27 redirect; `SBOM.md` lists Libre
  Baskerville; `Agent.md` design-language pointer updated.
- Demo screenshots (no git commit): parchment + bluish-grey chrome captures
  under `/tmp/sstpa-theme-demo/` (and box `/workspace/sstpa-theme-demo/`).

Verification:
- `cd frontend && npm run build` (and lint if run).
- Gear-menu Light/Dark switch still toggles `data-sstpa-style`.

SBOM impact: added Libre Baskerville (OFL-1.1, bundled woff2).

## 2026-10-04 — Approved Loss integration verified on the available Linux host

Before implementation, updated SRS §6.5.10.22 (32 verifiable requirements), architecture and interpretation I-19. Integrated the approved standalone prototype as the actual authenticated Loss Tool: ELK/React Flow compartment cards, full-DAG 1,000/depth-20/width-50 bounds, leaf inputs/root metric rules, coherent-scenario qualifiers, exact bounded route analysis, two-section identity/metric properties, root-owned palettes/layout and right-click folding. Stable local IDs remain distinct from actual Core UUID/HID assignment; imported identity/context cannot establish database authority. Prototype FireSat expansions remain test fixtures only.

Production integration retains Trace Coverage, auto-build/rebuild, reconciliation, canonical Attack/Countermeasure links, ordinary Asset Loss/Goal generation, derived terminal association and the optional model-text panel. Commits lock/version-check affected Loss roots, validate final graphs and preserve rejected drafts. Legacy envelopes, snapshots, metric direction and view settings migrate additively. Dedicated DerivedAsset spawning of its own Loss/GSN remains the pre-existing I-12 schema limitation, not a claimed retained feature.

Added the global offline Product & License viewer with exact frontend/font/ELK notice/source coverage, separately labeled from the broader product SBOM. Removed inherited GPLv3 `cytoscape-svg` and retained shared vector exports through an original serializer. Fixed host overlay stacking so menus/dialogs and the Core drawer remain reachable after repeated tool activation. Updated project FloorPlan, test/verification/metric documents and relevant local SSTPA developer WIKI pages. The local WIKI has no Git repository/remote; its files are maintained alongside the flagship rather than represented as a pushed WIKI commit.

Root causes resolved include missing optimistic tree guards, exponential/unqualified path counting, premature local-only save semantics, candidate edits lost on first association, untrusted imported context, ambiguous edge-ID concatenation, malformed saved views/cameras, false dirty state after initial layout, dirty close/SoI scope loss, legacy metric-direction rewriting, duplicate license-version React keys, native frontend embedding in fallback builds, and ordinary Asset-generated Loss NOT_BUILT lifecycle handling. Regression evidence is in `VERIFICATION.md` and the machine-readable reports below.

Verification against the frozen working tree based on `38a8a8b`:
- Go build/vet/unit PASS; race checks on API/model/schema PASS; **12/12** disposable Neo4j integration tests PASS. Tests cover identity/snapshot transactions, conflict/concurrency, limits/rollback, ordinary Asset/Loss/GsnGoal lifecycle, CURRENT coverage, shared-tree scoped links, reconciliation and rebuild.
- Frontend **179/179** tests across 13 files PASS (including 34 Core adapter and five shared SVG cases), TypeScript/Vite build PASS, npm audit 0 findings. Oxlint exits 0 with the same ten baseline Fast Refresh warnings and no new warnings.
- Both native release binaries built with `--locked --features tauri/custom-protocol`; backend Docker and installer builds PASS. Final audit verifies **130** notice/source files and **530** package checksum entries. `FINAL-PACKAGING-VERIFICATION.json` records package SHA-256 `e823fdf957b8b8a899b8844ba470ff7d6ce60eb6ae438e432d848e53ee717754`.
- Isolated browser smoke rendered all 17 tool entry points. Loss identity assignments, persisted four-channel colors/themes/direction, leaf/root calculations, roll-up invariance, dirty-close/SoI guards, stale revision 7/8 conflict, actual-State coverage, Core drawer/model text and global notices passed. Four Loss exports and a Navigator SVG downloaded and were inspected; screenshots and scope are in `BROWSER-VERIFICATION.json` and `verification-images/`.
- FireSat rebuilt and loaded twice: **467 nodes, 842 relationships, 33 Systems**, ten database assertions PASS, shipped archive checksum/semantic identity PASS (`FIRESAT-PACKAGE-VERIFICATION.json`).
- Offline sustainment synthetic normalization/refusal checks **17/17** and disposable Neo4j assertions **6/6** PASS (`verify-sustainment-offline.py`, `SUSTAINMENT-OFFLINE-VERIFICATION.json`). Authentic archived inputs/manifests are absent, so no authentic reference-data release is claimed or fabricated.

Qualification limits: Windows/native GUI execution was not available; the host CLI watcher prevented .deb/AppImage bundling, while the documented release-binary fallback passed. Package metadata explicitly skips unavailable authentic Reference Data and records that Docker images were built but not saved as an air-gap archive. Existing dedicated DerivedAsset, read-only M2G panel and native report-writer deferrals remain in REQUIREMENTS-NOTES. Browser smoke is not every operation of every tool. These qualifications are explicit, not unperformed checks labeled PASS.

SBOM impact: added `@xyflow/react` 12.12.0 and `elkjs` 0.12.0 production stack; added Vitest 5.0.3 development verification; removed `cytoscape-svg`. Bundled corresponding ELK/dependency/font notices and covered-source archives; existing product-wide inventory remains separately identified.

Final source review removed a trailing blank in the transferred identity fixture and added `.gitattributes` to preserve vendored notice/source bytes across platforms. Original third-party whitespace is intentionally retained and hash-verified; authored-source whitespace checks pass.

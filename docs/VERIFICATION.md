# SSTPA Tools — Verification record

This record separates the current Loss integration gate from historical evidence. SRS §6.5.10.22 and `LOSS-TOOL-ARCHITECTURE.md` were updated before integration implementation began on 2026-10-04. `TESTING.md` defines the procedures; a procedure or prototype approval is not a production PASS.

## Current integration verification — 2026-10-04

Integration status: **PASS for the executed available-Linux-host integration, build, browser and packaging checks, with explicit platform/data qualifications below**. This evidence is from the frozen 2026-10-04 working tree based on `38a8a8b34d48e6eb252e298b589b24250a094385`, before the integration commit. Automated suites, production browser walkthrough, native release binaries, Docker build and installer/source-notice verification passed. This is not a Windows-native qualification or an authentic reference-corpus release; those unavailable inputs/platforms and pre-existing deferred features are stated below. Recheck affected results after subsequent source changes.

### Pre-change baseline

The coordinating agent executed the following against the initially clean `38a8a8b34d48e6eb252e298b589b24250a094385` checkout before integration. These identify the starting condition and do not qualify changed code.

| Check | Baseline result |
|---|---|
| Backend `go build ./...`, `go vet ./...`, `go test ./...` | PASS |
| Frontend `npm run build` | PASS |
| Frontend `npm run lint` | PASS, 10 existing warnings, exit 0 |
| Frontend Tauri `cargo check` | PASS |
| Startup Tauri `cargo check` | PASS |

### Final supported-host gate

| Check | Required evidence | Current result |
|---|---|---|
| Backend build/vet/unit and race | All packages; race detector on API/model/schema | PASS: `go build ./...`, `go vet ./...`, `go test ./...`, `go test -race ./internal/api ./internal/model ./internal/schema`. |
| Backend integration | Throwaway Neo4j; authentication, Core/trace/ownership, Loss version guard, limits and rollback | PASS: 12/12 integration tests on disposable Neo4j, including concurrent writers, Asset/Loss/GSN lifecycle, scoped links/reconciliation and auto-build overflow rollback. |
| Frontend transferred/adapter tests | Numerical source vectors, graph/path/identity, view migration, storage validation, export/layout/performance | PASS: 179/179 tests across 13 files; focused adapter suite 34/34. `npx tsc -b` also PASS. |
| Frontend build/lint/dependency audit | Production bundle, exact warning count, resolved npm advisories | PASS on frozen frontend: Vite/TypeScript production build; lint 0 errors and the identical 10 baseline warnings; npm audit reports 0 vulnerabilities. |
| Frontend and Startup Cargo | Both native shell manifests | PASS: both `cargo build --release --locked --features tauri/custom-protocol` builds, embedding the production frontend. Native-window/Windows execution is outside this host qualification. |
| License/source audit | Final production dependency closure, matching source hashes, offline viewer and output files | PASS: 93 production dependency entries, three font families/seven files, ten matching ELK source archives and 130 packaged notice/source files; final lock/assets/native/installer checks passed. |
| Shared SVG regression | Full/viewport vectors for existing diagram tools; labels, bounds, XML escaping | PASS: 5/5 serializer cases (included in 179 tests); live Navigator export downloaded and parsed (350 XML elements, 27,967 bytes). Browser coverage is representative, not a separate export-file check for every tool. |
| FireSat/package verification | Current schema builder with isolated output; installer notices/source staging | FireSat PASS: 467 nodes, 842 relationships, 33 Systems, ten database assertions and shipped archive checksum/semantic identity. Final installer PASS with 530 checksum entries and required native-binary/source-notice checks. |
| Offline sustainment | Available archived data, isolated validation DB and reported artifact results | QUALIFIED: 17 synthetic pipeline/refusal checks and six disposable Neo4j assertions PASS. Authentic offline corpus/release qualification is BLOCKED by absent acquired archives/manifests; no authentic reference release was produced. |
| Live authenticated browser | Main shell, Loss/trace/commit/view/fold/properties, global licenses and representative tool regression | PASS for the recorded available-browser walkthrough: all 17 entry points, staged/persisted Loss behavior, Core drawer/model text, global local notices and downloaded Loss/Navigator exports. Scope and console-warning qualifications are in `BROWSER-VERIFICATION.json`. |
| Documentation and WIKI | Requirement traceability, current paths and results, no stale production claims | SRS/architecture updated before implementation; all 32 amendment requirements have procedures. Test guide, project FloorPlan and relevant developer WIKI pages updated. Final evidence reconciled; source paths/WIKI links resolve, 32 amendment IDs are unique with one SHALL each, and whitespace checks preserve SRS CRLF. |

### Executed automated evidence

The backend owner reported `GOCACHE=/tmp/sstpa-loss-go-cache go build ./...`, `go vet ./...`, `go test ./...` and `go test -race ./internal/api ./internal/model ./internal/schema` passing. `DOCKER_CONTEXT=default GOCACHE=/tmp/sstpa-loss-go-cache ./scripts/integration-test.sh` passed **12/12** tests against disposable Neo4j (final reported duration 6.332 s). Fifteen new Loss unit tests and six new transaction integration cases supplement the pre-existing suite. The new Loss transaction tests cover atomic identity assignment and snapshot updates, stale-version rejection after both Loss and other-tool edits, simultaneous writers, capacity rollback, malformed metric metadata, canonical deletion/reconciliation, and auto-build depth overflow without partial changes. `TestIntegrationAssetLossGoalCreationKeepsPendingTree` verifies ordinary Asset/Loss/GsnGoal creation in one transaction, NOT_BUILT/version-0 lifecycle before Environment assignment, rollback of invalid generation and validation/versioning of a tree created in that same transaction. `TestIntegrationLossCoverageReconciliationAndScopedLinks` verifies actual CURRENT State coverage, shared Core nodes across two trees, non-Loss mutation rejection, Loss-scoped unlink isolation, trace invalidation and rebuild that clears stale projections/snapshots while retaining TreeIsValid=false for an incomplete tree. Unit tests cover exact count saturation beyond int64, 10,000-route materialization bounds, complete-graph limits, root Environment/State separation, valid SAND ordering and leaf-only metric projections. This does not imply that every host UI action was exercised by an API test.

The documentation/adapter owner executed `npm test -- tests/loss/core-adapter.test.ts` (**34/34**), then `npm test` (**179/179**, **13 files**) and `npx tsc -b` on 2026-10-04; all exited 0. The adapter cases include distinct IDs containing edge delimiters, edits to newly linked authoritative candidates, imported Core context restoration, explicit legacy MetricDirection round-trips, partial palettes, malformed presentation/camera values, cycle rejection and world-center camera migration. The full suite includes five shared vector-export tests. The packaging owner repeated the full frozen-source suite at 179/179 and captured `FRONTEND-UNIT-RESULTS.json`; `FRONTEND-BUILD-VERIFICATION.json` records the final build, runtime versions, resolved-lock hash and emitted-asset hashes. `FRONTEND-LINT-RESULTS.json` and `NPM-AUDIT-RESULTS.json` record 0 lint errors/10 unchanged warnings and 0 known npm audit findings respectively. The whitespace check passed using `git -c core.whitespace=cr-at-eol diff --check`; the SRS retains its original CRLF format. Vendored notices preserve upstream bytes (including original whitespace) under `.gitattributes`; their integrity is checked by hashes rather than whitespace normalization.

### Observed authenticated browser evidence

The coordinator tested the integrated production Loss Tool against an isolated FireSat verification Core, using the guarded fixture in `frontend/scripts/seed-loss-verification.mjs` rather than adding prototype data to the user's database. The fixture requires the disposable `http://127.0.0.1:18089` API to declare `integration-verification`; it selects FireSat SoI `SYS_1.1.2_0` and the explicitly labeled authentic-report Loss. The application origin was `http://127.0.0.1:5199/` in the Codex in-app browser. `BROWSER-VERIFICATION.json` records the completed walkthrough and its scope; it does not assert that every operation of every existing tool or a native Windows/WebKit runtime was exercised.

| Observed behavior | Evidence / result | SRS §6.5.10.22 |
|---|---|---|
| Application tool entry points | All 17 tool entry points rendered actual tables/forms or appropriate empty states after lazy loading completed. PASS for entry-point smoke; this does not claim every operation in each tool was exercised. | .1–.2, .31–.32 |
| Trace Coverage | Both expected trace rows (2/2) showed their actual States. PASS. | .2 |
| Identity properties survive a session | Properties showed separate Node properties / Attack metrics; Node ID and authoritative UUID selections persisted at revision 5 after signing in again. PASS. | .11–.12, .15 |
| Staged identity becomes authoritative | A newly created Countermeasure retained its local Node ID while successful Commit supplied a real Core HID/UUID at revision 6. PASS. | .3, .12–.13 |
| Leaf inputs drive calculated root values | A child counter-attack with leaf metric inputs committed at revision 7; the root showed a complete calculated result. PASS for this fixture; independent numerical vectors are covered by automated tests. | .3, .22–.25 |
| Roll-up changes presentation only | Right-click roll-up hid two descendants, displayed the purple folded border, and preserved root metrics. PASS for the observed branch. Shared-descendant behavior is also covered by graph tests. | .17–.18 |
| Dirty close is guarded | Closing the host tool with pending edits retained the draft. PASS. | .3 |
| Dirty SoI scope is pinned | Changing the parent SoI while a root-name edit was pending retained the `SYS_1.1.2_0` workspace and draft explicitly. Revert then followed the parent `SYS_1.1_0` scope and displayed No Loss. PASS. | .1, .3 |
| Stale commit cannot overwrite newer Core | An external Core edit advanced revision 7 to 8. The revision-7 UI Commit was rejected; its message stated both versions and explicitly retained the draft. PASS. | .4 |
| Initial layout is not an analyst edit | After correcting boot ELK handling, opening the tree and using Fit did not enable Commit. PASS. | .3, .8, .15 |
| Palette and direction persistence | All four channels persisted and reloaded: font `#192d44`, box `#edcfc8`, line `#a95143`, border `#773b34`, with Nocturne theme and rightward layout. Both canvas themes and DOWN/RIGHT switching were observed. PASS. | .14–.15 |
| Global product license viewer | Opened the main Product & License surface, read packaged notices using local assets without external calls, and inspected ELK license/source entries. Notices continued to render with the API session unavailable. The fixed catalog search produced exactly the two ELK entries. PASS. | .29–.30 |
| Loss browser exports | JSON, SVG, CSV and Markdown files downloaded successfully and were inspected on disk; JSON retained 12-node RIGHT layout and Core metadata, and SVG parsed as XML. PASS for these observed artifacts. | .28 |
| Host overlays and Model Text | Core Data Drawer opened above active tools and cancelled cleanly; optional Model Text expanded with generated content. Global license dialogs remained accessible after repeated tool activation. PASS. | .1–.2, .29 |
| Integrated workspace sizing | Compressed host controls and corrected the collapsed Model Text Panel width; browser inspection confirmed the expanded canvas uses the available workspace. PASS for inspected viewport. | .1–.2, .7, .10 |

All four Loss export buttons produced actual browser downloads in `/home/netrisk/Downloads` without a console error. Although the in-app automation download-event wait timed out, filesystem inspection confirmed `attack-tree (2).json` (12 nodes, RIGHT layout, authoritative Core status/loadedVersion/envelope/findings), `attack-tree (2).svg` (valid XML with 288 elements), `attack-paths (1).csv` (3,254 bytes) and `loss-evidence (1).md` (13,333 bytes). This is observed browser export evidence in addition to the automated scope/escaping/serialization tests. The timeout was an observation-interface limitation, not a failed file download. A representative Navigator SVG additionally downloaded, parsed as XML with 350 elements and measured 27,967 bytes. All 17 tool entry points rendered after lazy loading. Final screenshots are saved as `verification-images/loss-tool.png` and `verification-images/product-licenses.png`. The final console review found no errors after the duplicate-key correction; the two historical duplicate-key warnings were from before the fix, and Cytoscape custom-wheel-sensitivity warnings are pre-existing. See the source/package qualification below.

### Example and sustainment evidence

`FIRESAT-PACKAGE-VERIFICATION.json` records a current-schema rebuild plus two idempotent loads into an isolated Neo4j container with no exposed ports. All ten assertions passed: 467 nodes, 842 relationships, 33 Systems, Tier 8 hierarchy, unique HIDs, immutable ownership, complete System structures, reachable Requirements, connected Interfaces and deliberately absent tutorial analysis nodes. The shipped FireSat archive matches its checksum and current rebuild semantics (excluding generated timestamps/comments).

`SUSTAINMENT-OFFLINE-VERIFICATION.json` records 17 passing synthetic normalization/transformation/refusal checks and six actual Neo4j assertions covering immutable reference data, cross-framework mappings, scoped uniqueness, quoted Unicode and nested source preservation. The authentic offline pipeline exited 1 as expected because no acquisition manifest or authentic framework archive is present in the configured paths. This is a data/provenance qualification limit: synthetic checks do not establish the full official corpus thresholds or an authentic reference-data release. No replacement provenance was invented or live deployment modified.

`LINT-BASELINE-VERIFICATION.json` compares the same installed oxlint/configuration against the archived baseline by file, rule, severity and exported symbol. Both exit 0 with the identical ten pre-existing Fast Refresh export-component warnings; no new warnings were introduced.

### Final packaging evidence

`FINAL-PACKAGING-VERIFICATION.json` and the refreshed `LICENSE-VERIFICATION.json` record the final frozen-source checks: 93 production npm dependencies, three fonts/seven hashed WOFF2 files, ten matching ELK source archives, 130 license assets identical in build output and embedded native resources, and 530 installer checksum entries. Both native release binaries, the local backend Docker image, installer generation and `verify-license-package.mjs --require-native` passed.

The verified package is `tmp/integration-package/sstpa-tools-0.1.0-linux-x86_64.tar.gz`, 80,316,689 bytes, SHA-256 `e823fdf957b8b8a899b8844ba470ff7d6ce60eb6ae438e432d848e53ee717754`. Package metadata records the baseline Git HEAD together with the current working-tree implementation. It contains documentation as staged; final archive-hash/evidence reports stay outside that archive to avoid self-reference and later evidence updates do not alter the tested binary payload.

The packaging audit found and corrected a native fallback issue: release binaries need `tauri/custom-protocol` to embed the built frontend. This host's native bundler hit its open-file watcher limit, so the documented release-binary fallback was exercised. Missing reference-data artifacts, unarchived Docker images and native bundle status are disclosed by the package manifest rather than labeled as verified contents.

### Evidence files

[Frontend build and asset hashes](FRONTEND-BUILD-VERIFICATION.json), [unit results](FRONTEND-UNIT-RESULTS.json), [lint results](FRONTEND-LINT-RESULTS.json), [baseline warning comparison](LINT-BASELINE-VERIFICATION.json) and [npm audit](NPM-AUDIT-RESULTS.json) retain the automated frontend record. [Final native/Docker/installer qualification](FINAL-PACKAGING-VERIFICATION.json) and [license/source audit](LICENSE-VERIFICATION.json) identify the tested payload and its checksums. [FireSat verification](FIRESAT-PACKAGE-VERIFICATION.json), [qualified offline sustainment](SUSTAINMENT-OFFLINE-VERIFICATION.json) and [browser walkthrough](BROWSER-VERIFICATION.json) retain the other executed results. [Loss canvas screenshot](verification-images/loss-tool.png) and [global license screenshot](verification-images/product-licenses.png) document the final integrated appearance.

### Requirement traceability

Each added SRS record contains its own verification method and observable procedure. The groups below connect executed tests and the browser walkthrough to those records. Qualification is limited to the evidence stated above: automated domain/transaction checks, inspection and the observed browser workflow. The known dedicated-DerivedAsset, reference-data and native-platform limitations are not converted into a blanket SRS completion claim.

| Amendment requirements | Evidence group |
|---|---|
| 6.5.10.22.1–.4 | Production API adapter, invocation/SoI preservation, awaited atomic Commit, stale-version conflict |
| .5–.6 | Typed scoped DAG and root Environment/State groups |
| .7–.10 | Card/canvas/browser interactions, worker layout, stale-response protection |
| .11–.16 | Two-section properties, actual UUID versus local ID, staged identity, palette/view/migration |
| .17–.21 | Fold projection, distinct marker, exact capacity thresholds, client/server rejection |
| .22–.27 | Leaf-only metrics, independent scalar/scenario vectors, qualifiers, edge decisions and bounded exact-count routes |
| .28 | JSON/SVG/CSV/Markdown scope, completeness, identity and escaping |
| .29–.30 | Global offline licenses, matching notices/source in distribution |
| .31–.32 | Transferred verification suite and existing-tool SVG export regression |

## Resolved integration findings

The integration review identified and corrected these root causes; evidence is supplied by the suites and browser record above:

| Root cause | Correction / regression evidence |
|---|---|
| Standalone save treated persistence as local and synchronous | Await actual Core Commit; retain rejected drafts, distinguish successful commit from failed reload, and reconcile before resubmission. |
| Ordinary Asset generation explicitly wrote a system-managed pending Loss status | Allow the compatible NOT_BUILT/version-0 creation lifecycle while validating any tree created in the same transaction; Asset/Loss/GSN atomicity and rollback integration regression PASS. |
| Tree-version preconditions were absent | Lock affected Loss roots and reject stale versions atomically; include concurrent transaction tests. |
| Legacy view/schema forms differ from the standalone DTO | Merge additive view state, preserve metadata and unknown fields, restore legacy node coordinates/folds/camera, and reject unsupported future versions. |
| Newly linked existing nodes were absent from the original tree baseline | Compare their staged property/metric edits with authoritative SoI candidates so Commit does not silently lose those edits. |
| Imported presentation context was mistaken for authority | Resolve Core identities and Asset/Environment/Criticality/Assurance context from the authenticated projection; ignore imported claims of database identity or Core validity. |
| Ambient SoI changes and tool closure could discard a staged canvas | Pin dirty workspace scope, guard close/unload and keep pending transaction scope stable. |
| Partial saved palettes, cyclic legacy graphs or malformed legacy camera centers could reach the renderer unchecked | Complete valid partial palettes, validate the graph before mount and reject nonfinite camera centers. Adapter regression cases PASS. |
| Legacy metric direction could be inferred incorrectly from OR optimization | Preserve explicit legacy definition metadata during a view-only round-trip; successive-save adapter cases PASS. |
| Edge IDs concatenated two arbitrary local IDs with an ambiguous separator | Encode the endpoint pair as a JSON tuple. Collision/isolated-update/reload regression PASS. |
| Initial ELK positioning was treated as an analyst edit | Establish the initial arranged baseline without dirtying it; observed open/Fit leaves Commit disabled. |
| Legacy camera center was interpreted as screen-space translation | Resolve the world center through the measured canvas before saving the resulting viewport; adapter migration test PASS. |
| Numerical completeness omitted Core reconciliation errors from evidence | Carry authoritative status/snapshot/findings into production exports and require explicit acknowledgement of unresolved findings; distinguish numerical completeness from Core validity. |
| Path enumeration and storage could hide combinatorial size | Compute exact counts independently, cap materialized routes, and disclose signed-int64 compatibility saturation. |
| Unbounded tool-window stacking eventually covered global menus/dialogs | Bound tool windows in the host stacking context and place the Core drawer above tools while menus/dialogs remain higher. Repeated activation, drawer cancel and global license access browser checks PASS. |
| License catalog entries keyed only by name/category collided across multiple package versions | Use a tuple including category, name, version and notice files; verify searched package details do not retain another version's content. |
| Existing host SVG plugin had unselected GPLv3 distribution obligations | Remove the dependency and verify the original full/viewport vector serializer, including XML escaping and shape/label fidelity. |

The executed tests and browser record supply the verification evidence; this root-cause table is not a substitute for those results.

## Historical evidence and superseded assumptions

The July 2026 checkpoints in `PROGRESS.md` record Go/schema/model/API checks, throwaway Neo4j integration, native Cargo checks, live tool/API smoke and installer staging. The 2026-07-06 checkpoint records the external FireSat package at 467 nodes/33 Systems and removal of embedded example seeding/reset endpoints. These historical results remain useful regression context, not proof of the October integration.

The earlier version of this summary contained stale or incorrect descriptions, corrected here:

- The removed FS-namespaced tree (`LOS_FS1_1`) and eight-node blocked path describe a historical fixture. Current external FireSat is `CAP__1`, SoI indexes 1–4, Tier 8; Assets/traces/Loss trees are authored separately.
- Startup does not seed FireSat and the gear menu does not reset it. `/api/examples` is removed. Example handling uses the external guarded package loader.
- A non-owner edit creates its audit notification; ownership transfer is a separate explicit transaction operation. Ordinary edits do not automatically transfer ownership.
- Grafana requires authentication. No public `/metrics-proxy` endpoint or anonymous dashboard access is promised. Metrics are scraped on the private network.
- Tool source line counts and compilation alone are not evidence of every UI behavior. “All 17 tools verified” refers only to the logged historical run; changed behavior must be exercised again.
- The old broad “all endpoints 200” claim included a removed examples endpoint and is not a current endpoint contract.

## Standing limitations

- The host Tauri CLI watcher hits “Too many open files”; the release-binary fallback passes with embedded assets, but no .deb/AppImage bundle execution or native GUI launch is claimed. Docker images were built locally and are not included as an air-gap image archive.
- Authentic offline reference-data corpus/release qualification is blocked by absent acquisition manifests and archived inputs. Synthetic sustainment checks pass; package metadata explicitly skips the missing reference payload.
- Dedicated `(:DerivedAsset)` Loss/GSN spawning is a pre-existing deferred schema feature (I-12): the old Loss Tool did not implement it and `HAS_LOSS`/`HAS_GOAL` only accept ordinary Asset sources. Integration supports canonical `DERIVED_FROM` terminal association and ordinary Asset generation; it does not claim a PASS for dedicated-label spawning.
- M2G text commit (§3.7.9): the host Model Text Panel is read-only; edits go through the canvas/Data Drawer Commit path (REQUIREMENTS-NOTES M-4).
- Native DOCX/PDF report writers: reports offer text/Markdown/HTML and browser print-to-PDF under I-11.
- Windows-native runtime validation (§2.1) requires a Windows host. Linux CI/development and cross-platform package staging do not establish that result (N-1).
- Scenario analysis may be explicitly incomplete at its configured budget or unsupported correlation; completeness status is part of correct behavior, not a silently waived test.

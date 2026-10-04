# Goal Keeper production integration

The owner approved the standalone GSN presentation for production on 2026-10-04, adding the Loss Tool's node-type color selector. The production `sstpa.goalkeeper` manifest now loads that presentation as the existing Goal Keeper tool. SRS §6.5.11.27 and interpretation I-20 govern this integration.

## What changed

The primary canvas uses the six GSN v3 core glyphs, complete 16 px statements at 100%, filled support arrows, hollow context arrows, A/J annotations and explicit undeveloped diamonds. Light/dark chrome follows SSTPA's Portfolio tokens. The outline and inspector are optional; the alternate graph and actual Backend G2M text open through View → SysML / KerML equivalent. The graph is argument scoped; the existing text translator remains SoI scoped, clearly labeled and read-only.

Node type colors uses the same native type selector and four channels as Loss: Font, Fill, Connector and Boundary. All six types have independent overrides, outgoing connectors use the source type's color, and Reset default colors restores theme defaults. User selections may lower contrast; the dialog reports contrast without preventing the owner's chosen palette. The canvas, model projection and whole-argument SVG use one renderer.

The locally bundled ELK engine handles automatic placement. Manual positions, pan/zoom, branch reading and colors are presentation data. Commit presentation saves them on the root `GoalStructure` property through the authenticated Core API. Rejected saves retain drafts. An exact expected-property check under a root lock rejects stale layout writes with HTTP 409. A successful commit followed by a failed reload is explicitly identified and prevents duplicate submission.

## Integration boundaries

- Core HIDs and UUIDs remain authoritative. Short GSN display IDs never become identity keys. Duplicate visible IDs are findings, rather than a reason to merge nodes.
- The pure GSN domain has no React, Zustand, filesystem, Tauri or API dependency. The host adapter converts canonical Core records and reconciles presentation state.
- Existing legacy view envelopes retain unknown fields and snapshots. An additive `goalKeeperView` version 1 carries positions, viewport, branch and palette. Malformed/future/misbound envelopes cannot be overwritten silently. Snapshot content cannot create semantic nodes or links.
- Asset/Loss roots, Core authoring, evidence references, ownership/authentication, SoI isolation and the Data Drawer remain production features. Dedicated DerivedAsset spawning and M2G editing retain their documented deferrals.
- The Backend serializes affected GSN semantic commits per SoI and compares final graphs with their pre-commit baselines. It rejects new/worsened illegal endpoints, duplicate logical links/display IDs, cycles and support into Asset-anchored roots. Invalid legacy graphs remain readable and incrementally repairable. Unlinked draft nodes are not treated as a completed rooted case; missing support/evidence remains an incompleteness finding.
- GSN v3 Part 1 §2 core notation is the conformance scope. Pattern, modular, confidence and dialectic extensions are not claimed. Structural validity is not approval or evidence sufficiency.

## Verification map

| SRS §6.5.11.27 | Evidence |
|---|---|
| .1–.2 glyphs and statements | Transferred geometry/renderer tests; six-symbol, long-statement, escaping and label vectors; FireSat browser inspection |
| .3 on-demand model view | Production UI tests, popup graph and actual Backend model text browser check |
| .4 layout and navigation | ELK vectors, standalone drag/viewport regressions, controlled production canvas tests and browser branch reading |
| .5 palettes | Six-type/four-channel color vectors, dialog input/reset/focus tests, Core round trip and SVG/projection tests |
| .6 atomic saves and draft protection | UI failure/reload/close/scope tests; real database stale-view/rollback/concurrency tests |
| .7 migration and identity | Core adapter tests for legacy/future/malformed/misbound views, identities, leaf API compatibility and snapshot isolation |
| .8 semantic validation | Domain rules and Backend final-state/SCC/duplicate/SoI/legacy-repair tests |
| .9 retained host functions | Core/Evidence/authoring UI tests, full existing suite and isolated browser smoke |
| .10 exports | Shared renderer/export vectors, working presentation JSON/Markdown/SVG and readable source references |
| .11 complete gate | `GOALKEEPER-VERIFICATION.md` and machine-readable results, recorded after the final source state |

## Reproducible FireSat browser fixture

The previous standalone example remains the source argument: `GoalKeeper/examples/firesat-vault/FireSat-Authentic-Reports`, source revision `5273f00fae5b907a19ef0aa1e8dc44950f228746`. Its Loss provenance is Attack Tree revision `8d7641d8e1fe5ef9fcbf7bb912dde4cdf922fc28`. The copied test fixture preserves those references and the illustrative status.

`frontend/scripts/seed-goalkeeper-verification.mjs` accepts only the explicitly guarded localhost API on port 18089 and requires Backend environment `integration-verification`, the structural FireSat package, and the existing isolated Loss fixture. It does not seed deployments. Execute from the frontend with Node after setting up that disposable database. Existing fixture records are reused; source display IDs can be assigned without replacing Core identities or views.

The production fixture has 18 GSN nodes, 17 GSN relationships, two evidence references, and five undeveloped claims. The Loss record supports source traceability. The Verification record explicitly describes a pending plan, not an executed test. No operational acceptance is implied.

The storyboard remains: establish Loss/Asset/scope → state the root claim → explain decomposition by four attack surfaces → record prototype route dispositions separately from operational evidence → mark the five unsupported claims undeveloped → collect real execution evidence and authority decisions before acceptance. The production integration changes how this argument is presented and committed, not the confidence justified by its source material.

# Loss Tool integration architecture

Design baseline: 2026-10-04, approved Attack Tree prototype integrated under SRS §6.5.10.22. This document was established before implementation. Verification status belongs to `VERIFICATION.md` and `PROGRESS.md`; design statements do not claim tests have passed.

## Runtime boundary

The existing `sstpa.loss` manifest and ToolShell mount the production Loss Tool. The host retains one React runtime, its SoI/authentication context, resizable tool panels, staged-edit conventions, design tokens and optional KerML Model Text Panel. The approved workspace adds React Flow custom cards and an ELK Layered worker; other tools retain their existing renderers. All assets are local, including fonts, worker code and licenses.

```
ToolShell / SoI / authenticated session
                 |
         production Loss adapter
          /
Backend API                 staged AttackTree DTO
  |                          /       |
Core graph + root state     graph   metrics    view
  |                                      /
Neo4j ACID Commit                 ELK worker   React Flow
```

The canvas is a projection of the authoritative Loss-scoped Core DAG. The adapter translates API DTOs into framework-independent node/edge/root objects. Graph validation, metric evaluation, path classification, export and layout modules do not query Neo4j or independently persist state. The browser/memory repository used by the standalone prototype is replaced by an awaited API transaction; it is not a production backing store.

Production operations remain available: Loss selection; current Trace Coverage; upstream auto-build/rebuild; snapshot reconciliation; semantic edge editing; canonical Attack/Countermeasure relations; ordinary Asset Loss/GSN generation, derived terminal association and cross-tool navigation. New structural entities are selected from existing Core data; Attack and Countermeasure creation uses Core commit operations. New Derived Assets are authored through Asset Manager and selected as terminal nodes in the Loss Tool. Existing Loss/Goal generation applies to ordinary `(:Asset)` nodes, including their AssetType classification; dedicated `(:DerivedAsset)` nodes do not generate their own Loss/GSN structures. The current schema permits `HAS_LOSS` and `HAS_GOAL` only from Asset, and the dedicated-label extension remains deferred under I-12. The old Loss Tool did not implement that spawning workflow, so integration does not claim to preserve or verify it. A candidate terminal resolves its canonical `DERIVED_FROM` relationship to the selected primary Asset (REQUIREMENTS-NOTES I-12); the obsolete SRS spelling `Countermeasure-[:DERIVES]->Asset` is not manufactured as an unsupported schema edge. Prototype FireSat expansions are test fixtures only and are not seeded into a user's database.

## Adapter and identity contract

| Domain value | Production authority |
|---|---|
| tree ID and root HID | Selected Core Loss HID, stable across open/reopen |
| local node ID | Root view `nodeIds` map keyed by Core HID or staged `$tempId`; one entry per distinct semantic element |
| authoritative UUID | Exact `uuid` returned by the Backend; null for staged nodes, never inferred from a HID, name or imported UUID |
| node HID/type/label | Core HID, type and properties; staged temporary IDs remain distinct until successful commit mapping |
| edge identity | Loss scope plus authoritative endpoints/relationship identity, independent of canvas coordinates |
| edge decisions | `LogicOperator`, `SANDSequence`, `TailoredOut`/reason, `CompleteBlock`/reason and Boolean `AllowedRV`/reason |
| raw leaf metrics | Existing `MetricsJSON`; terminal Asset/DerivedAsset input support is additive |
| event kind | `AttackEventKind` on Attack: hostile or stochastic; missing legacy value defaults to hostile |
| root metric rules | `MetricDefinitionsJSON`; adapter accepts legacy capitalized fields and approved metric-rule fields |
| root profile | New editable nullable `AnalysisProfileJSON`, excluded from G2M as analysis configuration |
| root presentation | `AttackTreeJSON.lossToolView` as described below |

Imported documents are proposals, not authority. Import resolves the same selected Loss and validates referenced Core identities against the loaded Backend graph. An imported `authoritativeUuid` cannot assert that a local node exists in Neo4j. New authorized entities receive their UUID/HID from the normal Backend transaction. Stable local IDs survive that mapping and appear separately from the source UUID in the Properties menu and inspector. A node without a Core UUID retains the exact `not yet committed` marker even when optional identity rows are hidden.

## Root persistence and concurrency

The production payload preserves the existing JSON envelope. The adapter merges this additive subsection rather than overwriting `AttackTreeJSON` with a standalone DTO:

```json
{
  "lossToolView": {
    "version": 1,
    "nodeIds": { "LOS_1_1": "tree-node-1" },
    "positions": { "tree-node-1": { "x": 0, "y": 0 } },
    "viewport": { "x": 0, "y": 0, "zoom": 1 },
    "direction": "DOWN",
    "collapsed": [],
    "selectedNodeProperties": [],
    "selectedProperties": [],
    "theme": "parchment",
    "nodeStyles": {}
  }
}
```

`nodeStyles` maps each supported node type to exactly font, box, line and border colors. Missing identity selections migrate to an empty list without changing metric selections or the existing viewport/layout. Legacy `schemaVersion: "1.0"` and `schema: "SSTPA-ATF-2.0"` forms remain readable. The legacy `layout` bridge and unknown extension keys survive, including snapshots, findings and version fields. Unsupported future view versions produce a compatibility error rather than a destructive downgrade.

A production Commit carries `toolId: "sstpa.loss"`, `soiHid`, staged operations and `lossPreconditions: [{lossHid, attackTreeVersion}]`. The Backend locks the affected Loss and compares the expected version before applying the proposal. Successful semantic or root-view commits increment the Loss version once. A mismatch rejects the transaction; the UI keeps the draft and explains that the current tree must be reloaded/reconciled. Backend-owned snapshots, findings and timestamps are refreshed under the existing reconciliation rules, never fabricated by a layout-only client change.

The UI awaits durable success before clearing staged state, then reloads the authoritative graph/root metadata. A successful transaction followed by failed reload is reported as committed with refresh pending, not a failed transaction; further submission waits for reconciliation of returned authoritative identities and version. Revert restores the committed semantic graph, view, rules and profile together. Duplicate submissions are disabled while pending. New layout jobs carry a generation identifier so delayed worker results cannot replace newer drafts.

## Structural and analytical contract

Loss-owned graph-changing routes validate the same typed DAG before acceptance; Loss Commit and auto-build/rebuild independently enforce the final graph. Canonical edits made through another authorized tool can invalidate a referenced Loss tree; they advance its revision and surface reconciliation errors instead of blocking unrelated Core work. A subsequent Loss edit or rebuild must restore the required structure and capacity. Count distinct semantic nodes including root, rolled-up and tailored nodes. Longest-path depth has root zero; width is the largest distinct-node count at a longest-path rank. Hard bounds are 1,000 / 20 / 50; warnings start inclusively at 800 / 16 / 40. Limit overflow rejects the entire operation with the recommendation to decompose the system into smaller trees, rather than truncating the graph.

The root's Environment connector is an unconditional AND context; its State group is OR or SAND. This is the explicit exception to uniform sibling operators. Other groups use one operator; SAND sequence is contiguous and zero-based. Environment does not create a successful path or raw metric contribution. Shared elements are represented once with multiple parents. Edge-scoped decisions remain independent even when their target is shared.

Legacy metric-definition arrays migrate by preserving each existing ID, formula, leaf default and threshold, then adding only absent approved catalog definitions with their explicit defaults. The initial profile remains scalar until the analyst opts into coherent scenario analysis. This migration supplies valid profile references without inventing or replacing legacy leaf inputs; the resulting root configuration is persisted through the normal staged Commit.

The root owns metric definitions and the analysis profile. Raw values are accepted on semantic leaves only. Legacy branch values remain stored and flagged but do not contribute. The deterministic approved engine computes all parent/root projections from the full graph, including rolled-up branches. The Backend validates and persists rules/profile/inputs; its path endpoint supplies explicitly labeled leaf-input metric projections. Edge caches or route pages are not a coherent scenario result and do not replace the shared evaluator.

The metric catalog covers:

- Resource inputs: monetary attack cost, technical ability, duration, noticeability, physical presence and breach of trust.
- Attacker benefit/detriment inputs: monetary/destructive rewards and configurable revenge, prestige, power or deterrence dimensions.
- Victim inputs: financial loss, safety/death/injury, mission disruption, environmental effects and additional named calibrated impacts.
- Event/opportunity inputs: random-event probability/frequency/duration, benefit ASE and encounter ASE, explicit actor/target counts, time horizon, recovery, threading and duty cycle.
- Derived outputs: resource feasibility, reciprocal difficulty, net desirability, propensity, victim pain, relative risk, encounter/occurrence/annualized occurrence, cumulative risk, annualized loss expectancy and time to a specified threshold.

Scalar rules use SUM, PRODUCT, MIN or MAX per AND/OR/SAND. Cost defaults SUM/MIN/SUM; success probability PRODUCT/MAX/PRODUCT with explicit independence assumptions. Threshold ABOVE/BELOW is strict and distinct from attacker optimization. Unknown values, blocked states and unbounded reciprocals remain typed statuses, never NaN/Infinity or misleading successful zero-cost scenarios.

Scenario mode retains whole OR alternatives and combines required AND/SAND vectors. Reusable ability uses MAX, consumed cost SUM and sequential time SUM; parallel duration may use MAX by rule. Resource utility curves yield feasibility as their geometric mean; difficulty is its reciprocal. Weighted benefit minus detriment is floored at zero; propensity is feasibility times desirability; relative risk is propensity times weighted victim pain. Encounter rate and horizon produce cumulative risk; annual occurrence times raw victim loss produces annual loss expectancy. Benefit and encounter ASE act once in their separate specified positions. Independence and units are explicit.

The scenario budget defaults to 256 and may be set from 1 through 5,000. More candidates, unsupported shared-leaf correlation or stochastic OR with differing consequences yields an incomplete result. An incomplete maximum is not certified as a global worst case. Scalar extrema are never combined into a fictitious coherent risk vector. Reference equations and worked vectors are retained in [LOSS-METRIC-METHOD.md](LOSS-METRIC-METHOD.md) and transferred into the production verification suite; the reference PDF itself is not distributed.

Route count and scenario count are different. Exact route count uses arbitrary-precision DAG dynamic programming. `AttackTreeJSON.pathCountExact` stores the server-owned decimal string and `pathCountSaturated` discloses when the compatibility `Loss.PathCount` integer is capped at signed-int64 maximum; the tree response exposes both. The paths response provides `totalExact` and `rvCountExact` separately from materialized `total` and truncation metadata. At most 10,000 routes are materialized deterministically and shown in pages of 100. Truncation is disclosed; no statistical sampling claim is made.

## View and interaction

The approved five-region workspace uses host parchment/nocturne tokens: identity/actions above, searchable outline or paths left, canvas center, selection inspector right, root analysis below. Rounded cards have centered labels and body properties. Gate names are edge text, not logical-symbol nodes. Card measurement accounts for selected identity and metric rows before ELK runs. The emitted local classic worker avoids network dependency; the host CSP permits same-origin workers.

Properties is divided into Node properties (Node ID, Authoritative UUID, Provenance) and Attack metrics. The inspector exposes full identifiers even when those rows are hidden on cards. Palette editing offers only font/box/line/border by type. The source type's line color colors outgoing connectors; textual analytical markers preserve meaning under color changes.

Right-click roll-up preserves the selected card and hides only descendant traversals reached through that folded parent. Descendants reachable through another expanded parent remain visible. A purple folded marker, hidden count and continuation stub expose omitted content; none is a semantic node or analytical blocker. Roll-down restores the presentation. Export scope explicitly distinguishes visible/folded and expanded graphs.

## Global notices and distribution

The main application Product & License surface exposes the approved browsable license viewer independently of the Loss Tool. The offline catalog is generated from the actual shipped dependency closure and bundled fonts; its scope is disclosed separately from broader Go/Rust/container/reference-data SBOM inventory. It contains exact package versions, source links, license texts, notices, and version-matched ELK covered-source archives. Local viewer links work without a network connection. Required materials are retained in Vite output, Tauri resources and installer staging; the proprietary product notice is separate from third-party terms.

A license audit checks the existing host dependencies as well as the imported stack; prototype approval is not evidence that pre-existing dependencies have acceptable distribution terms. Dependency/source manifests and checksums must reflect the final resolved host lockfile. No runtime CDN is introduced. The private reference PDF and scratch extracts are excluded.

The inherited `cytoscape-svg` GPLv3 plugin is removed from the shipped closure. An original serializer built against Cytoscape public APIs preserves vector full-scene/viewport exports for Navigator, State, Requirements and Flow. Regression tests cover labels, bounds and XML escaping; this change does not replace those tools' graph engines.

## Verification ownership

Transfer the prototype's independent numerical, graph, paths, identity, export, layout and capacity vectors into the host test runner. Replace standalone local-storage assertions with adapter/migration/commit tests while retaining pure DTO validation coverage. Add real transaction tests for version conflicts, ownership/tool authority, canonical relations, rejected overflow and rollback. Use isolated Neo4j fixtures; never replace the owner's Core data with prototype examples.

Full supported-host gate includes Go build/vet/unit/integration checks; frontend tests/build/lint and packaging checks; both Tauri Cargo checks; relevant Python example/sustainment and installer checks; live authenticated UI verification of Loss and main license access. Browser checks verify navigation, menus, staged identities, round-trip view, fold semantics and absence of page errors. Existing platform-specific deferrals remain explicitly disclosed; Linux evidence is not a Windows-native verification claim. Results and root-cause fixes are recorded before the requested commit/push.

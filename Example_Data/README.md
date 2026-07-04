# Example_Data — SSTPA Tools Example Projects (SRS §3.6)

Example Data consists of pre-defined projects users can open, modify as
part of a tutorial, and reset. Per SRS §2 it has **the same schema and
rules as Core System Data**, except it is created and Owned by
`SSTPA Tools` (owner email `tools@sstpa.example`) and ownership cannot
change. This directory manages that data **outside the application** so
it can be independently modified, tailored, and packaged for deployment.
Nothing here modifies the application itself.

## Layout

```
Example_Data/
  FireSat/
    model/               # tailorable YAML source of truth (edit these)
    build_firesat.py     # model → validated Cypher artifact
    load-example-data.sh # artifact → deployment Neo4j (guarded, idempotent)
    FireSat-Hierarchy.md # hierarchical description of the example
    dist/                # generated: .cypher, .tar.gz, .sha256, tree
```

## Workflow

```bash
cd Example_Data/FireSat
# 1. Edit model/*.yaml (structure below).
# 2. Rebuild — validates against docs/schema/*.json and packages:
python3 build_firesat.py            # needs PyYAML (sustainment env has it)
# 3. Load into the running deploy stack (idempotent, collision-guarded):
./load-example-data.sh dist/sstpa-example-firesat-<date>-v<n>.tar.gz
```

`build_firesat.py --tree` prints the hierarchy without writing files.
The `dist/` artifact set (tar.gz + .sha256) is the deployable unit — ship
it alongside the Reference Data artifact and load it the same way at
install time (the loader mirrors `deploy/load-reference-data.sh`).

## Identity choices (why these HIDs)

* The FireSat Project root is **`CAP__1`**, not `CAP__0`: the Backend
  always assigns `CAP__0` to the deployment's own Core project
  (`assignHID`, SRS §3.3.8), so the example must not occupy it.
* Tier-1 segments take SoI indexes **1–4**. Loaded at deployment time
  (before users create Systems) this is collision-free, and the Backend
  hands user Systems the next free index. Loading into a populated
  database is guarded: the loader aborts if any node in the claimed HID
  space has a Creator other than `SSTPA Tools`. To relocate the example,
  rebuild with `--tier1-base <N>` (and `--project-seq <N>` if needed).
* UUIDs are deterministic (UUIDv5 of the HID), and the load script uses
  `MERGE` on HID throughout — reloading the artifact is the "Reset"
  operation for an unmodified structure, and a `MATCH … DETACH DELETE`
  of the example HID space followed by a reload is a full reset.

## Model YAML reference

`model/00-project.yaml` holds the `project:` block (name, mission,
capability requirements) and the ordered `segments:` list. Each segment
file holds one recursive `system:` tree:

| Key | Meaning (graph rendering) |
|---|---|
| `purpose`, `environment`, `states` | one Purpose/Environment + States per System (`REALIZES`/`ACTS_IN`/`EXHIBITS`); states carry `sequence` and `transitions` (`TRANSITIONS_TO`) |
| `functions` | `HAS_FUNCTION`; `flows_to` (`FLOWS_TO_FUNCTION`), `flows_to_interface` (`FLOWS_TO_INTERFACE`), `allocated_to` element (`ALLOCATED_TO`) |
| `interfaces` | `HAS_INTERFACE`; `connects` functions (`CONNECTS`), `allocated_to`, `joins` a connection by global key (`PARTICIPATES_IN`, may cross SoI) |
| `connections` | `HAS_CONNECTION`, owned by this System; `key` is global so any interface in any file can join |
| `elements` | `HAS_ELEMENT` Components; give an element a nested `system:` to make it parent a child System (`PARENTS`, child SoI index per SRS §3.3.8.2) |
| `requirements` | on the system → attached to its Purpose; on functions/interfaces/elements/connections → attached to that entity (`HAS_REQUIREMENT`); `derives_from` global keys renders `(:Requirement)-[:PARENTS]->` flow-down; Orphan/Barren flags are computed |

The builder validates every relationship against
`docs/schema/relationships.json` and every enum (VMethod, Directionality,
LogicalLayer, …) against `docs/schema/node-properties.json`, and fails
loudly on unknown keys, duplicate HIDs, or dangling references. Note the
SRS-literal enum spellings (`"Layer2: Data Link"`, `"Layer 5 Session"`).

## Current examples

* **FireSat** — forest-fire detection and suppression capability;
  4 Tier-1 segments, 33 Systems, decomposition to Tier 8 on the Space
  Segment payload spine, 467 nodes / 842 relationships. See
  `FireSat/FireSat-Hierarchy.md`.

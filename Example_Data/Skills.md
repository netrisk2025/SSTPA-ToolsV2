# Skills — Example_Data workflows and procedures

Capabilities for working with SSTPA Tools Example Data (SRS §3.6). Read
`Agent.md` (rules) first; `README.md` holds the reference detail (YAML
model keys, identity rationale). Commands below are copy-paste ready from
this directory; the repository root contains a space, so keep paths quoted.

Prerequisites: Python 3 with PyYAML (the sustainment environment has it,
`sustainment/requirements.txt`), Docker, and for deployment loads a running
deploy stack (`cd ../deploy && docker compose up -d`) whose Neo4j password
is in `../deploy/.env` (`SSTPA_NEO4J_PASSWORD=...`) or exported in the
environment.

---

## Skill 1 — Understand an example's structure

1. Read `<example>/FireSat-Hierarchy.md` (or the equivalent for another
   example): full tree with HIDs and tiers, communications map,
   requirements flow-down, node inventory, and what is deliberately left
   out for tutorials.
2. Print the current tree straight from the model (no files written):

   ```bash
   cd FireSat && python3 build_firesat.py --tree
   ```

3. The graph semantics: same schema and rules as Core System Data
   (`docs/schema/node-properties.json`, `docs/schema/relationships.json`).
   Nodes are labeled `:SSTPA:<Type>`; HIDs follow SRS §3.3.8
   (`{TYPE}_{SoI index}_{sequence}`, child System index = parent Element
   index + "." + Element sequence). All nodes have Owner/Creator
   `SSTPA Tools` — that ownership is the marker that distinguishes
   Example Data from user Core data, and it must never change (SRS §2).
4. FireSat identity facts agents must not "fix": the Project root is
   `CAP__1` on purpose (`CAP__0` is reserved for the deployment's own
   Core project), and Tier-1 segments occupy SoI indexes 1–4.

## Skill 2 — Modify and rebuild an example

1. Edit the YAML under `<example>/model/` only (never `dist/`). The key
   reference table is in `README.md`.
2. Rebuild, validate, and package:

   ```bash
   cd FireSat && python3 build_firesat.py
   ```

   Success prints the script path, node/relationship/system counts, and
   max tier, then the packaged tar.gz. Output goes to `dist/`:
   `sstpa-example-firesat-load-<date>-v<n>.cypher`, the artifact
   `sstpa-example-firesat-<date>-v<n>.tar.gz`, its `.sha256` sidecar, and
   `hierarchy-tree.txt`. Re-running on the same day bumps `v<n>`.
3. `MODEL ERROR: ...` means the model violates the schema — an illegal
   relationship, a bad enum value, a duplicate HID/key, or a dangling
   reference (`joins`, `derives_from`, `allocated_to`, `flows_to*`,
   `connects`, state `transitions`). Fix the YAML, not the schema, and
   mind the SRS-literal enum spellings (`"Layer2: Data Link"`,
   `"Layer 5 Session"`).
4. A `WARN: connection ... has N participating interface(s)` means some
   Interface should still `joins:` that connection — usually intended to
   be ≥ 2.
5. If the structure changed, refresh the tree block in the example's
   hierarchy `.md` from `dist/hierarchy-tree.txt` and update its node
   inventory numbers from the build summary.

## Skill 3 — Verify an artifact before touching a shared database

Always run a rebuilt artifact through a throwaway Neo4j first (rule 4 in
`Agent.md`). Use the same image as the backend integration tests:

```bash
docker run -d --name sstpa-example-verify -e NEO4J_AUTH=neo4j/verify-pw \
  -p 127.0.0.1:17700:7687 neo4j:2026.05.0-community
until docker exec sstpa-example-verify cypher-shell -u neo4j -p verify-pw "RETURN 1;" \
  >/dev/null 2>&1; do sleep 2; done

docker cp FireSat/dist/sstpa-example-firesat-load-<date>-v<n>.cypher \
  sstpa-example-verify:/tmp/load.cypher
docker exec sstpa-example-verify cypher-shell -u neo4j -p verify-pw -f /tmp/load.cypher
# Run it twice: the final count must be identical (idempotency).
```

Minimum acceptance queries (run via
`docker exec sstpa-example-verify cypher-shell -u neo4j -p verify-pw --format plain "<query>"`),
with expected results:

```cypher
// 0 duplicate HIDs
MATCH (n:SSTPA) WITH n.HID AS h, count(*) AS c WHERE c > 1 RETURN count(*);

// final count of the load script equals its "Expected example node count" header

// every System is complete (0 rows)
MATCH (s:System) WHERE NOT (s)-[:REALIZES]->(:Purpose)
   OR NOT (s)-[:ACTS_IN]->(:Environment) OR NOT (s)-[:EXHIBITS]->(:State)
   OR NOT (s)-[:HAS_FUNCTION]->() OR NOT (s)-[:HAS_INTERFACE]->()
   OR NOT (s)-[:HAS_ELEMENT]->() RETURN s.HID, s.Name;

// every System reaches a Requirement (0 rows)
MATCH (s:System) WHERE NOT EXISTS {
  MATCH (s)-[:REALIZES|HAS_FUNCTION|HAS_INTERFACE|HAS_ELEMENT|HAS_CONNECTION]->()
        -[:HAS_REQUIREMENT]->(:Requirement) } RETURN s.HID, s.Name;

// every Connection has >= 2 participants
MATCH (c:Connection) OPTIONAL MATCH (i:Interface)-[:PARTICIPATES_IN]->(c)
RETURN c.HID, c.Name, count(i) ORDER BY count(i);
```

Tear down when done: `docker rm -f sstpa-example-verify`

## Skill 4 — Load an example into the deployment backend

```bash
cd FireSat
./load-example-data.sh dist/sstpa-example-firesat-<date>-v<n>.tar.gz [deploy-dir]
```

`deploy-dir` defaults to `../../deploy`. The script verifies the `.sha256`
sidecar (it must sit beside the tar.gz), runs a collision guard, executes
the Cypher via cypher-shell inside the compose `neo4j` container, and
compares the post-load count to the script header. It is idempotent —
safe to re-run.

Failure modes:

- `FAIL: SSTPA_NEO4J_PASSWORD ...` — export the password or point at a
  deploy dir with a `.env`.
- `FAIL: the neo4j service is not running` — `cd ../deploy && docker
  compose up -d` first.
- `FAIL: N user-owned node(s) already occupy the example HID space` —
  user Core data sits on the example's Tier-1 SoI indexes. Do NOT delete
  it and do NOT force the load; rebuild the example elsewhere (Skill 6)
  or stop and ask the Boss.

For a fresh deployment install, the intended order is: start the stack,
load Reference Data (`deploy/load-reference-data.sh`), then load Example
Data with this script — before any users create Systems, so the Backend
hands user data the next free SoI indexes. To package for deployment,
ship the `dist/*.tar.gz` + `.sha256` pair alongside the Reference Data
artifact (see `installer/`'s handling of reference data for the pattern).

## Skill 5 — Reset or remove a loaded example

- Reset of an **unmodified structure** (property drift only): just re-run
  Skill 4; MERGE restores all shipped property values.
- Full reset or removal (users added/renamed nodes): delete exactly the
  example-owned HID space, then reload (or stop after deleting, to
  remove). For FireSat with default indexes:

  ```cypher
  MATCH (n:SSTPA {Creator: 'SSTPA Tools'})
  WHERE n.SoIIndex = '' OR split(n.SoIIndex,'.')[0] IN ['1','2','3','4']
  DETACH DELETE n;
  ```

  The `Creator: 'SSTPA Tools'` filter is the safety line — never delete
  without it. User-created nodes inside the example's sub-graphs are
  user-owned and survive; if they must go too, that is a user decision —
  ask before widening the match.

## Skill 6 — Relocate the example's HID space

If the target database already has Core Systems on the default indexes,
rebuild with shifted identity and load that artifact instead:

```bash
python3 build_firesat.py --tier1-base 11 --project-seq 2
```

Tier-1 segments then occupy SoI 11–14 under root `CAP__2`; all child
indexes, HIDs, and deterministic UUIDs shift with them. The loader reads
the claimed indexes from the script header, so the guard adapts
automatically.

## Skill 7 — Add a new example project

1. New sub-directory beside `FireSat/` with the same layout: `model/`
   (a `00-project.yaml` with `project:` + `segments:`, one YAML per
   Tier-1 segment), a build script, a loader, a hierarchy `.md`.
2. Reuse `build_firesat.py` as the base — it is example-agnostic except
   for the `EXAMPLE_ID` constant (drives artifact names and the UUIDv5
   namespace) and its default paths. Keep deterministic UUIDs and MERGE-
   on-HID: they are what make reload-as-reset work.
3. Pick a Project sequence and Tier-1 base that no other example uses
   (FireSat holds `CAP__1` and SoI 1–4).
4. Follow SRS §3.6 intent: comprehensive over technically correct — every
   System should carry Purpose, Environment, States, Functions,
   Interfaces, Requirements, a System-Element, and leaf Elements.
5. Register it: `README.md` here (Current examples) and the repository
   `FloorPlan.md`. Verify per Skill 3 before any shared load.

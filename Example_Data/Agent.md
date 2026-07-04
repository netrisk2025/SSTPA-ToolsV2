Directive for Example_Data:

This directory holds SSTPA Tools Example Data (SRS §3.6) managed outside
the application. Read README.md before working here.

Rules:

1. The YAML files under `<example>/model/` are the single source of
   truth. Never hand-edit anything in `<example>/dist/` — regenerate it
   with the example's build script (e.g. `python3 build_firesat.py`).
2. Example Data is created and Owned by "SSTPA Tools" and ownership
   never changes. Do not stamp any other Owner/Creator on these nodes.
3. Do not modify the SSTPA Tools application (backend, frontend,
   startup, installer, deploy) to accommodate data changes made here;
   the data must conform to `docs/schema/*.json`, never the reverse.
4. After editing a model, rebuild, then verify the artifact loads into a
   throwaway Neo4j container before loading it into a shared deployment.
5. New example project = new sub-directory alongside FireSat with the
   same layout (model/, build script, loader, hierarchy .md); add it to
   README.md here and to the repository FloorPlan.md.

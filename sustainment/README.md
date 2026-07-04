# SSTPA Sustainment Environment (SRS §9)

Offline development-system tools that acquire, normalize, transform, validate,
and package Reference Framework data into a versioned Neo4j Cypher load
artifact for the SSTPA Backend. Never executed on a deployed SSTPA Tool system.

```
Acquisition → Normalize → Transform → Validate → Package
```

Each stage is an independently runnable CLI (SRS §9.6):

```bash
python -m sstpa_ref.acquire   --config config.yaml --output ref-archive/   [--dry-run]
python -m sstpa_ref.normalize --input ref-archive/<ver>/ --output inf/     [--dry-run]
python -m sstpa_ref.transform --input inf/ --output graph/                 [--dry-run]
python -m sstpa_ref.validate  --input graph/<script>.cypher --output validation/
python -m sstpa_ref.package   --input . --output artifacts/
python -m sstpa_ref.pipeline  --config config.yaml        # full run
```

All stages accept `--version` and return non-zero exit codes on failure.
Structured JSON logs are written to the configured log directory.

- Only **Acquisition** requires internet access (SRS §9.2 Stage 1); all later
  stages run offline against the local `ref-archive/`.
- **Validate** requires Docker (throwaway Neo4j container).
- License compliance per SRS §9.5: every source property is preserved
  verbatim in the node `RawData` field, and the generated Cypher header and
  Release Note carry the required MITRE/NIST attributions.

Setup:

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

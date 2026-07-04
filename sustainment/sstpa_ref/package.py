"""Stage 5 — Load Artifact Production (sstpa-ref-package, SRS §9.2).

Verifies VALIDATED: PASS, bundles the Cypher script plus all manifests and
reports into sstpa-ref-data-YYYY-MM-DD-vN.tar.gz with a .sha256 companion and
a Release Note carrying the §9.5 attributions.

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import hashlib
import json
import sys
import tarfile
from pathlib import Path

from .common import ATTRIBUTIONS, base_parser, setup_logging, utc_now_iso


def run(root: Path, out_dir: Path, log_dir: Path | None, dry_run: bool) -> int:
    log = setup_logging("package", log_dir)

    status_file = root / "validation" / "pipeline-status.txt"
    if not status_file.exists() or "VALIDATED: PASS" not in status_file.read_text():
        log.error("pipeline status is not VALIDATED: PASS — refusing to package (SRS §9.2 Stage 5)")
        return 1

    scripts = sorted((root / "graph").glob("sstpa-ref-load-*.cypher"))
    if not scripts:
        log.error("no cypher load script found")
        return 1
    script = scripts[-1]
    stamp = script.stem.replace("sstpa-ref-load-", "")

    archives = sorted((root / "ref-archive").glob("*/acquisition-manifest.json"))
    acq_manifest = archives[-1] if archives else None
    contents = [
        script,
        root / "inf" / "normalization-report.json",
        root / "graph" / "transform-report.json",
        root / "validation" / f"sstpa-ref-validate-report-{stamp}.json",
    ]
    if acq_manifest:
        contents.append(acq_manifest)

    missing = [str(p) for p in contents if not p.exists()]
    if missing:
        log.error(f"missing bundle members: {missing}")
        return 1

    if dry_run:
        log.info(f"would bundle {len(contents)} files into sstpa-ref-data-{stamp}.tar.gz")
        return 0

    out_dir.mkdir(parents=True, exist_ok=True)
    bundle = out_dir / f"sstpa-ref-data-{stamp}.tar.gz"
    with tarfile.open(bundle, "w:gz") as tar:
        for p in contents:
            arcname = p.name if p.name != "acquisition-manifest.json" else "acquisition-manifest.json"
            tar.add(p, arcname=arcname)

    digest = hashlib.sha256(bundle.read_bytes()).hexdigest()
    (out_dir / f"{bundle.name}.sha256").write_text(f"{digest}  {bundle.name}\n")

    # Release Note (§9.2 Stage 5 / §9.5).
    treport = json.loads((root / "graph" / "transform-report.json").read_text())
    vreport = json.loads((root / "validation" / f"sstpa-ref-validate-report-{stamp}.json").read_text())
    note_lines = [
        f"SSTPA Reference Data Release {stamp}",
        f"Generated: {utc_now_iso()}",
        "",
        "Contents (nodes/edges per source):",
    ]
    for src, c in treport["counts"].items():
        note_lines.append(f"  {src}: {c['nodes']} nodes, {c['edges']} edges")
    note_lines += ["", f"Validation: {vreport['status']} ({len(vreport['assertions'])} assertions)", ""]
    if acq_manifest:
        acq = json.loads(acq_manifest.read_text())
        note_lines.append("Source files:")
        for f in acq["files"]:
            note_lines.append(f"  {f['framework']} {f['version']} {f['file']} sha256={f['sha256']}")
        note_lines.append("")
    note_lines += ["Attributions:", ""]
    note_lines += [f"  {a}" for a in ATTRIBUTIONS]
    (out_dir / f"sstpa-ref-data-{stamp}-RELEASE-NOTE.txt").write_text("\n".join(note_lines) + "\n")

    log.info(f"artifact: {bundle} sha256={digest[:16]}…")
    print(bundle)
    return 0


def main() -> None:
    args = base_parser("package", __doc__.split("\n")[0]).parse_args()
    root = args.input or Path(".")
    out = args.output or (root / "artifacts")
    sys.exit(run(root, out, args.log_dir, args.dry_run))


if __name__ == "__main__":
    main()

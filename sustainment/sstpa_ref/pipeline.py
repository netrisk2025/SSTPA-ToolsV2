"""Pipeline runner (sstpa-ref-pipeline, SRS §9.6): invokes each stage in
order, halts on failure, and writes a pipeline execution record.

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import sys
from pathlib import Path

from . import acquire, normalize, package, transform, validate
from .common import base_parser, load_config, setup_logging, utc_now_iso, write_json


def main() -> None:
    p = base_parser("pipeline", __doc__.split("\n")[0])
    p.add_argument("--skip-acquire", action="store_true",
                   help="reuse the newest existing archive (offline mode)")
    args = p.parse_args()
    cfg = load_config(args.config)
    root = args.config.parent.resolve()
    log_dir = root / cfg.get("log_dir", "logs")
    log = setup_logging("pipeline", log_dir)
    record: dict = {"startedAt": utc_now_iso(), "stages": []}

    def stage(name: str, fn) -> None:
        log.info(f"stage {name} starting")
        rc = fn()
        record["stages"].append({"stage": name, "exitCode": rc, "at": utc_now_iso()})
        if rc != 0:
            record["result"] = f"FAILED at {name}"
            write_json(root / cfg.get("artifacts_dir", "artifacts") / "pipeline-record.json", record)
            log.error(f"stage {name} failed (exit {rc}); pipeline halted")
            sys.exit(rc)
        log.info(f"stage {name} complete")

    archive_root = root / cfg["archive_dir"]
    if not args.skip_acquire:
        stage("acquire", lambda: acquire.run(args.config, archive_root, log_dir, args.dry_run))
    archives = sorted(d for d in archive_root.glob("*-v*") if d.is_dir())
    if not archives:
        log.error("no archive available")
        sys.exit(1)
    archive = archives[-1]

    inf_dir = root / cfg["inf_dir"]
    graph_dir = root / cfg["graph_dir"]
    validation_dir = root / cfg["validation_dir"]
    artifacts_dir = root / cfg["artifacts_dir"]

    stage("normalize", lambda: normalize.run(archive, inf_dir, log_dir, args.dry_run))
    stage("transform", lambda: transform.run(inf_dir, graph_dir, log_dir, args.dry_run))
    scripts = sorted(graph_dir.glob("sstpa-ref-load-*.cypher"))
    stage("validate", lambda: validate.run(scripts[-1], validation_dir, args.config, log_dir, args.dry_run))
    stage("package", lambda: package.run(root, artifacts_dir, log_dir, args.dry_run))

    record["result"] = "SUCCESS"
    record["finishedAt"] = utc_now_iso()
    write_json(artifacts_dir / "pipeline-record.json", record)
    log.info("pipeline complete")


if __name__ == "__main__":
    main()

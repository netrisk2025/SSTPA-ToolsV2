"""Stage 1 — Acquisition (sstpa-ref-acquire, SRS §9.2).

Downloads authoritative source files from their canonical repositories into a
versioned archive directory with SHA-256 checksums and an Acquisition
Manifest. The ONLY stage that requires internet connectivity.

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from .common import base_parser, load_config, setup_logging, sha256_file, utc_now_iso, write_json


def raw_url(repo: str, ref: str, path: str) -> str:
    org_repo = repo.replace("https://github.com/", "").removesuffix(".git")
    return f"https://raw.githubusercontent.com/{org_repo}/{ref}/{path}"


def run(config_path: Path, output: Path | None, log_dir: Path | None, dry_run: bool) -> int:
    cfg = load_config(config_path)
    log = setup_logging("acquire", log_dir or Path(cfg.get("log_dir", "logs")))

    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    archive_root = output or Path(cfg["archive_dir"])
    # Version suffix vN: monotonically increasing within the calendar date (§9.4).
    n = 1
    while (archive_root / f"{date}-v{n}").exists():
        n += 1
    archive = archive_root / f"{date}-v{n}"

    manifest: dict = {
        "format": "SSTPA-Acquisition-Manifest-1.0",
        "acquisitionTimestamp": utc_now_iso(),
        "archiveVersion": f"{date}-v{n}",
        "files": [],
    }

    for name, src in cfg["sources"].items():
        ref = src.get("version_tag") or src.get("commit")
        for rel in src["files"]:
            url = raw_url(src["repo"], ref, rel)
            dest = archive / name / Path(rel).name
            log.info(f"fetch {url}")
            if dry_run:
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            req = urllib.request.Request(url, headers={"User-Agent": "sstpa-ref-acquire/1.0"})
            with urllib.request.urlopen(req, timeout=120) as resp, open(dest, "wb") as f:
                while chunk := resp.read(1 << 20):
                    f.write(chunk)
            digest = sha256_file(dest)
            manifest["files"].append(
                {
                    "framework": name,
                    "sourceUrl": url,
                    "repository": src["repo"],
                    "version": ref,
                    "file": str(dest.relative_to(archive)),
                    "sha256": digest,
                    "license": src["license"],
                    "acquiredAt": utc_now_iso(),
                }
            )
            log.info(f"acquired {dest.name} sha256={digest[:16]}…")

    if dry_run:
        log.info("dry-run complete; no files written")
        return 0

    # Completion condition (§9.2): all expected files present with checksums.
    expected = sum(len(s["files"]) for s in cfg["sources"].values())
    if len(manifest["files"]) != expected:
        log.error(f"expected {expected} files, acquired {len(manifest['files'])}")
        return 1

    write_json(archive / "acquisition-manifest.json", manifest)
    log.info(f"acquisition manifest written: {archive / 'acquisition-manifest.json'}")
    print(archive)  # stdout: archive path for the pipeline runner
    return 0


def main() -> None:
    args = base_parser("acquire", __doc__.split("\n")[0]).parse_args()
    sys.exit(run(args.config, args.output, args.log_dir, args.dry_run))


if __name__ == "__main__":
    main()

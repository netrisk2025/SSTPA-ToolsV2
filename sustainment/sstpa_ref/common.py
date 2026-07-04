"""Shared infrastructure for the SSTPA Sustainment pipeline (SRS §9.6):
CLI conventions (--input/--output/--version/--dry-run), structured JSON
logging, checksums, and config loading.

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

TOOL_VERSION = "1.0.0"


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "time": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "stage": record.name,
            "msg": record.getMessage(),
        }
        if record.__dict__.get("extra_data"):
            entry.update(record.__dict__["extra_data"])
        return json.dumps(entry)


def setup_logging(stage: str, log_dir: Path | None) -> logging.Logger:
    logger = logging.getLogger(stage)
    logger.setLevel(logging.INFO)
    stream = logging.StreamHandler(sys.stderr)
    stream.setFormatter(JsonLogFormatter())
    logger.addHandler(stream)
    if log_dir:
        log_dir.mkdir(parents=True, exist_ok=True)
        fh = logging.FileHandler(
            log_dir / f"{stage}-{datetime.now(timezone.utc):%Y%m%dT%H%M%S}.jsonl"
        )
        fh.setFormatter(JsonLogFormatter())
        logger.addHandler(fh)
    return logger


def base_parser(stage: str, description: str) -> argparse.ArgumentParser:
    """Standard CLI per SRS §9.6: --input, --output, --version, --dry-run."""
    p = argparse.ArgumentParser(prog=f"sstpa-ref-{stage}", description=description)
    p.add_argument("--input", type=Path, help="input path")
    p.add_argument("--output", type=Path, help="output path")
    p.add_argument("--config", type=Path, default=Path("config.yaml"), help="pipeline config YAML")
    p.add_argument("--log-dir", type=Path, help="structured log directory")
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="validate inputs and print expected actions without writing outputs",
    )
    p.add_argument("--version", action="version", version=f"%(prog)s {TOOL_VERSION}")
    return p


def load_config(path: Path) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def truncate(text: str | None, limit: int = 500) -> str | None:
    """ShortDescription derivation (SRS §3.4.1.3): first sentence, ≤limit."""
    if not text:
        return text
    first = text.split(". ")[0].strip()
    if len(first) > limit:
        first = first[: limit - 1]
    return first


# SRS §9.5 attribution statements — emitted in Cypher headers & release notes.
ATTRIBUTIONS = [
    "This product uses the MITRE ATT&CK framework. ATT&CK is a registered "
    "trademark and copyright of The MITRE Corporation. Licensed under CC BY 4.0.",
    "This product uses MITRE ATLAS. Copyright 2023-2026 The MITRE Corporation. "
    "Licensed under Apache 2.0.",
    "This product incorporates NIST SP 800-53 Rev 5 content. NIST-authored "
    "material is in the public domain. Attribution: National Institute of "
    "Standards and Technology, U.S. Department of Commerce.",
    "This product uses MITRE EMB3D. Copyright 2024 The MITRE Corporation. "
    "Licensed under Apache 2.0.",
]

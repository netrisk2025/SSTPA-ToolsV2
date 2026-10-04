"""Offline sustainment smoke checks using explicitly synthetic source fixtures.
This is NOT validation of an authentic Reference Data release. No acquisition,
live database mutation or release packaging is performed. Run from repo root.
"""

from pathlib import Path
import hashlib
import json
import logging
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "sustainment"))
from sstpa_ref import normalize, transform, package  # noqa: E402

OUT = ROOT / "tmp" / "offline-sustainment-check"
OUT.mkdir(parents=True, exist_ok=True)
checks = []


def check(name, predicate, detail=None):
    checks.append({"check": name, "passed": bool(predicate), "detail": detail})
    if not predicate:
        raise AssertionError(name)


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False))
    return path


log = logging.getLogger("offline-fixtures")
actor = {
    "type": "attack-pattern",
    "id": "attack-pattern--fixture",
    "name": "Analyst's quoted fixture; Ω",
    "description": "First sentence. Second sentence.",
    "external_references": [
        {"source_name": "mitre-attack", "external_id": "T-FIXTURE"}
    ],
    "kill_chain_phases": [{"phase_name": "fixture-tactic"}],
    "custom_preserved": {"nested": ["original", 42]},
}
tactic = {
    "type": "x-mitre-tactic",
    "id": "x-mitre-tactic--fixture",
    "name": "Fixture tactic",
    "x_mitre_shortname": "fixture-tactic",
    "external_references": [
        {"source_name": "mitre-attack", "external_id": "TA-FIXTURE"}
    ],
}
retired = {**actor, "id": "attack-pattern--retired", "x_mitre_deprecated": True}
attack, extra = normalize.normalize_attack(
    put("input/enterprise-attack-fixture.json", {"objects": [tactic, actor, retired]}),
    "enterprise",
    "synthetic",
    log,
)
check(
    "ATT&CK filters deprecated objects without discarding their audit record",
    len(attack["nodes"]) == 2 and len(extra["deprecated"]) == 1,
)
check(
    "ATT&CK preserves source RawData and tactic membership",
    json.loads(attack["nodes"][1]["raw_data"]) == actor
    and attack["edges"][0]["relationship_type"] == "AK_TACTIC_CONTAINS",
)

atlas_source = {
    "matrices": [
        {
            "tactics": [{"id": "AML.TA-FIXTURE", "name": "Fixture tactic"}],
            "techniques": [
                {
                    "id": "AML.T-FIXTURE",
                    "name": "Fixture technique",
                    "tactics": ["AML.TA-FIXTURE"],
                    "ATT&CK-reference": {
                        "id": "T-FIXTURE",
                        "url": "https://example.invalid/synthetic",
                    },
                }
            ],
        }
    ]
}
atlas, _ = normalize.normalize_atlas(
    put("input/atlas-fixture.yaml", atlas_source), "synthetic", log
)
check(
    "ATLAS preserves tactics and cross-framework mapping",
    len(atlas["nodes"]) == 2
    and any(e["relationship_type"] == "AT_MAPS_TO_ATTACK" for e in atlas["edges"]),
)

control = {
    "id": "ac-fixture",
    "title": "Fixture control",
    "parts": [
        {
            "name": "statement",
            "parts": [{"name": "item", "prose": "Nested statement survives."}],
        }
    ],
    "controls": [
        {
            "id": "ac-fixture.1",
            "title": "Fixture enhancement",
            "parts": [{"name": "statement", "prose": "Enhancement text."}],
        }
    ],
}
withdrawn = {
    "id": "ac-retired",
    "title": "Retired",
    "props": [{"name": "status", "value": "withdrawn"}],
}
nist, extra = normalize.normalize_nist(
    put(
        "input/nist-fixture.json",
        {
            "catalog": {
                "groups": [
                    {
                        "id": "ac",
                        "title": "Fixture family",
                        "controls": [control, withdrawn],
                    }
                ]
            }
        },
    ),
    "synthetic",
    log,
)
check(
    "NIST retains nested statements/enhancements and filters withdrawn controls",
    len(nist["nodes"]) == 3
    and extra["report"]["filtered"] == 1
    and "Nested statement survives." in nist["nodes"][1]["long_description"],
)

objects = [
    {
        "type": "vulnerability",
        "id": "vulnerability--fixture",
        "name": "Fixture vulnerability",
    },
    {
        "type": "course-of-action",
        "id": "course-of-action--fixture",
        "name": "Fixture mitigation",
    },
    {
        "type": "x-mitre-emb3d-property",
        "id": "x-mitre-emb3d-property--fixture",
        "name": "Fixture device",
    },
    {
        "type": "relationship",
        "id": "relationship--mitigates",
        "relationship_type": "mitigates",
        "source_ref": "course-of-action--fixture",
        "target_ref": "vulnerability--fixture",
    },
    {
        "type": "relationship",
        "id": "relationship--device",
        "relationship_type": "related-to",
        "source_ref": "vulnerability--fixture",
        "target_ref": "x-mitre-emb3d-property--fixture",
    },
]
emb3d, _ = normalize.normalize_emb3d(
    put("input/emb3d-fixture.json", {"objects": objects}), "synthetic", log
)
check(
    "EMB3D retains vulnerability/device/mitigation links",
    len(emb3d["nodes"]) == 3
    and {e["relationship_type"] for e in emb3d["edges"]}
    == {"EMB3D_MITIGATES", "EMB3D_RELATES_TO_DEVICE"},
)
for name, inf in [
    ("attack", attack),
    ("atlas", atlas),
    ("nist", nist),
    ("emb3d", emb3d),
]:
    put(f"inf/{name}.json", inf)
check(
    "Transform accepts the four synthetic normalized frameworks",
    transform.run(OUT / "inf", OUT / "graph", None, False) == 0,
)
script = sorted((OUT / "graph").glob("*.cypher"))[-1]
text = script.read_text()
check(
    "Cypher uses scoped MERGE, immutable reference flags and retained RawData",
    "MERGE (n:REF:" in text
    and "FrameworkVersion" in text
    and "n._ReadOnly = true" in text
    and "n.RawData =" in text
    and "Analyst\\'s" in text,
)
check(
    "Missing acquisition manifests are rejected",
    normalize.run(OUT / "missing-archive", OUT / "missing-inf", None, False) == 1,
)
check(
    "Missing normalized inputs are rejected",
    transform.run(OUT / "missing-inf", OUT / "missing-graph", None, False) == 1,
)
check(
    "Unvalidated synthetic data cannot be packaged as a release",
    package.run(OUT, OUT / "artifacts", None, False) == 1
    and not (OUT / "artifacts").exists(),
)

env = {**os.environ, "PYTHONPATH": str(ROOT / "sustainment")}
for stage in ["acquire", "normalize", "transform", "validate", "package", "pipeline"]:
    result = subprocess.run(
        [sys.executable, "-m", f"sstpa_ref.{stage}", "--version"],
        env=env,
        capture_output=True,
        text=True,
    )
    check(
        f"{stage} CLI imports and reports version offline",
        result.returncode == 0,
        result.stdout.strip(),
    )
# Run the real skip-acquire entry point with isolated outputs and the actual
# configured archive location. Missing data is an expected refusal, not PASS
# evidence for an authentic data release.
import yaml

config = yaml.safe_load((ROOT / "sustainment/config.yaml").read_text())
config["archive_dir"] = str(ROOT / "sustainment" / config["archive_dir"])
config_file = OUT / "config.yaml"
config_file.write_text(yaml.safe_dump(config))
missing = not Path(config["archive_dir"]).exists()
pipeline_exit = None
if missing:
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "sstpa_ref.pipeline",
            "--config",
            str(config_file),
            "--skip-acquire",
        ],
        env=env,
        capture_output=True,
        text=True,
    )
    pipeline_exit = result.returncode
    (OUT / "pipeline.log").write_text(result.stdout + result.stderr)
    check(
        "Offline pipeline refuses to invent missing reference archives",
        result.returncode == 1 and "no archive available" in result.stderr,
    )
report = {
    "status": (
        "PARTIAL - authentic archived sources unavailable"
        if missing
        else "FIXTURE CHECKS ONLY"
    ),
    "syntheticChecksPassed": all(c["passed"] for c in checks),
    "checks": checks,
    "authenticPipelineExitCode": pipeline_exit,
    "authenticArchivePresent": not missing,
    "authenticReleaseProduced": False,
    "fixtureCypher": str(script.relative_to(ROOT)),
    "fixtureSha256": hashlib.sha256(script.read_bytes()).hexdigest(),
    "scope": "Synthetic normalization/transform and refusal-path checks only. No official source downloads or live deployment changes. Full corpus thresholds and authentic release packaging remain unverified.",
}
(ROOT / "docs/SUSTAINMENT-OFFLINE-VERIFICATION.json").write_text(
    json.dumps(report, indent=2) + "\n"
)
print(
    json.dumps(
        {
            "checks": len(checks),
            "allPassed": report["syntheticChecksPassed"],
            "authenticReleaseProduced": False,
            "fixtureCypher": str(script),
        },
        indent=2,
    )
)

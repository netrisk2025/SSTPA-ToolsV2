"""Stage 4 — Validate (sstpa-ref-validate, SRS §9.2).

Executes the generated Cypher script against a throwaway Neo4j container and
runs the structural/content assertions of §9.2 Stage 4. Writes a Validation
Report and the pipeline status file (VALIDATED: PASS/FAIL).

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

from .common import base_parser, load_config, setup_logging, utc_now_iso, write_json

CONTAINER = "sstpa-ref-validate-neo4j"
PASSWORD = "sstpa-validate-pw"


def docker(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["docker", *args], capture_output=True, text=True, check=check)


def run(script: Path, out_dir: Path, config_path: Path, log_dir: Path | None, dry_run: bool) -> int:
    log = setup_logging("validate", log_dir)
    cfg = load_config(config_path) if config_path.exists() else {}
    vcfg = cfg.get("validate", {})
    image = vcfg.get("neo4j_image", "neo4j:2026.05.0-community")
    bolt = int(vcfg.get("bolt_port", 17687))
    http = int(vcfg.get("http_port", 17474))

    if not script.exists():
        log.error(f"cypher script not found: {script}")
        return 1
    if dry_run:
        log.info(f"would validate {script} against throwaway {image}")
        return 0

    from neo4j import GraphDatabase  # imported here so --dry-run works without the driver

    docker("rm", "-f", CONTAINER, check=False)
    log.info(f"starting throwaway Neo4j ({image})")
    docker(
        "run", "-d", "--name", CONTAINER,
        "-e", f"NEO4J_AUTH=neo4j/{PASSWORD}",
        "-p", f"{bolt}:7687", "-p", f"{http}:7474",
        image,
    )
    results: list[dict] = []
    status = "FAIL"
    try:
        driver = GraphDatabase.driver(f"bolt://localhost:{bolt}", auth=("neo4j", PASSWORD))
        deadline = time.time() + 180
        while True:
            try:
                driver.verify_connectivity()
                break
            except Exception:
                if time.time() > deadline:
                    raise RuntimeError("throwaway Neo4j did not start in 180 s")
                time.sleep(3)
        # Execute via cypher-shell inside the container: authoritative Cypher
        # statement parsing (semicolons inside string literals are handled).
        log.info("executing load script via cypher-shell")
        docker("cp", str(script), f"{CONTAINER}:/tmp/load.cypher")
        exec_res = subprocess.run(
            ["docker", "exec", CONTAINER, "cypher-shell",
             "-u", "neo4j", "-p", PASSWORD, "-f", "/tmp/load.cypher"],
            capture_output=True, text=True,
        )
        if exec_res.returncode != 0:
            raise RuntimeError(f"cypher-shell load failed: {exec_res.stderr[-2000:]}")
        log.info("load script executed")

        def assert_query(name: str, query: str, predicate, detail: str = ""):
            with driver.session() as session:
                value = session.run(query).single()[0]
            ok = predicate(value)
            results.append({"assertion": name, "value": value, "pass": bool(ok), "detail": detail})
            log.info(f"{'PASS' if ok else 'FAIL'}: {name} = {value}")
            return ok

        ok = True
        ok &= assert_query("AK_Technique count > 500",
            "MATCH (n:AK_Technique) RETURN count(n)", lambda v: v > 500)
        ok &= assert_query("AK_Tactic count >= 30",
            "MATCH (n:AK_Tactic) RETURN count(n)", lambda v: v >= 30)
        ok &= assert_query("AT_Technique count > 50",
            "MATCH (n:AT_Technique) RETURN count(n)", lambda v: v > 50)
        ok &= assert_query("NIST_Control count >= 900 (with enhancements)",
            "MATCH (n) WHERE n:NIST_Control OR n:NIST_Enhancement RETURN count(n)", lambda v: v >= 900)
        ok &= assert_query("AK_Technique all have ExternalID/Name/LongDescription",
            "MATCH (n:AK_Technique) WHERE n.ExternalID IS NULL OR n.Name IS NULL OR n.LongDescription IS NULL RETURN count(n)",
            lambda v: v == 0)
        ok &= assert_query("NIST_Control all have ExternalID/ControlID/LongDescription",
            "MATCH (n:NIST_Control) WHERE n.ExternalID IS NULL OR n.ControlID IS NULL OR n.LongDescription IS NULL RETURN count(n)",
            lambda v: v == 0)
        ok &= assert_query("AK_TACTIC_CONTAINS targets valid",
            "MATCH ()-[r:AK_TACTIC_CONTAINS]->(t) WHERE NOT t:AK_Technique RETURN count(r)", lambda v: v == 0)
        ok &= assert_query("AT_MAPS_TO_ATTACK targets exist",
            "MATCH ()-[r:AT_MAPS_TO_ATTACK]->(t) WHERE NOT t:AK_Technique RETURN count(r)", lambda v: v == 0)
        ok &= assert_query("zero nodes missing _ReadOnly=true",
            "MATCH (n:REF) WHERE coalesce(n._ReadOnly, false) = false RETURN count(n)", lambda v: v == 0)
        ok &= assert_query("zero nodes with null ExternalID or FrameworkVersion",
            "MATCH (n:REF) WHERE n.ExternalID IS NULL OR n.FrameworkVersion IS NULL RETURN count(n)", lambda v: v == 0)
        ok &= assert_query("no duplicate (ExternalID, FrameworkName, FrameworkVersion)",
            "MATCH (n:REF) WITH n.ExternalID AS e, n.FrameworkName AS f, n.FrameworkVersion AS v, count(*) AS c WHERE c > 1 RETURN count(*)",
            lambda v: v == 0)
        status = "PASS" if ok else "FAIL"
        driver.close()
    except Exception as exc:
        log.error(f"validation error: {exc}")
        results.append({"assertion": "execution", "pass": False, "detail": str(exc)})
    finally:
        docker("rm", "-f", CONTAINER, check=False)
        log.info("throwaway Neo4j removed")

    out_dir.mkdir(parents=True, exist_ok=True)
    stamp = script.stem.replace("sstpa-ref-load-", "")
    report_path = out_dir / f"sstpa-ref-validate-report-{stamp}.json"
    write_json(report_path, {
        "script": str(script),
        "validatedAt": utc_now_iso(),
        "status": status,
        "assertions": results,
    })
    (out_dir / "pipeline-status.txt").write_text(f"VALIDATED: {status}\n")
    log.info(f"VALIDATED: {status} — report {report_path}")
    return 0 if status == "PASS" else 1


def main() -> None:
    args = base_parser("validate", __doc__.split("\n")[0]).parse_args()
    if not args.input or not args.output:
        print("--input (cypher script) and --output (validation dir) required", file=sys.stderr)
        sys.exit(2)
    sys.exit(run(args.input, args.output, args.config, args.log_dir, args.dry_run))


if __name__ == "__main__":
    main()

"""Stage 3 — Transform (sstpa-ref-transform, SRS §9.2).

Converts INF JSON files into a Neo4j-compatible Cypher load script using MERGE
semantics keyed on (ExternalID, FrameworkName, FrameworkVersion), setting the
common Reference Framework Identity properties (SRS §3.4.5), marking every
node _ReadOnly and :REF, and creating all reference relationships. The script
header carries the SRS §9.5 attribution statements.

2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from .common import ATTRIBUTIONS, base_parser, setup_logging, utc_now_iso, write_json

FRAMEWORK_ROOTS = {
    ("ATT&CK", "enterprise"): "ATT_CK_Enterprise_19",
    ("ATT&CK", "ics"): "ATT_CK_ICS_19",
    ("ATT&CK", "mobile"): "ATT_CK_Mobile_19",
    ("ATLAS", None): "ATLAS_5",
    ("NIST SP 800-53", None): "NIST_800_53_R5",
    ("EMB3D", None): "EMB3D_21",
}

SOURCE_URIS = {
    "ATT&CK": "https://github.com/mitre-attack/attack-stix-data",
    "ATLAS": "https://github.com/mitre-atlas/atlas-data",
    "NIST SP 800-53": "https://github.com/usnistgov/oscal-content",
    "EMB3D": "https://github.com/mitre/emb3d",
}

# INF snake_case → SSTPA property names (SRS §3.4.1.3 / §3.4.2.3 / §3.4.3.3).
PROP_MAP = {
    "external_id": "ExternalID",
    "stix_id": "StixID",
    "stix_type": "StixType",
    "name": "Name",
    "short_description": "ShortDescription",
    "long_description": "LongDescription",
    "stix_created": "StixCreated",
    "stix_modified": "StixModified",
    "stix_version": "StixVersion",
    "is_deprecated": "IsDeprecated",
    "is_revoked": "IsRevoked",
    "platforms": "Platforms",
    "raw_data": "RawData",
    "is_subtechnique": "IsSubTechnique",
    "parent_technique_id": "ParentTechniqueID",
    "tactic_ids": "TacticIDs",
    "detection_text": "DetectionText",
    "permissions": "Permissions",
    "data_sources": "DataSources",
    "technique_maturity": "TechniqueMaturity",
    "short_name": "ShortName",
    "tactic_order": "TacticOrder",
    "aliases": "Aliases",
    "associated_groups": "AssociatedGroups",
    "software_type": "SoftwareType",
    "detection_strategy_type": "DetectionStrategyType",
    "analytic_type": "AnalyticType",
    "data_component_ref": "DataComponentRef",
    "attack_reference_id": "ATTACKReference_ID",
    "attack_reference_url": "ATTACKReference_URL",
    "ml_lifecycle_stages": "MLLifecycleStages",
    "mitigation_categories": "MitigationCategories",
    "incident_date": "IncidentDate",
    "incident_date_granularity": "IncidentDateGranularity",
    "reporter_name": "ReporterName",
    "referenced_technique_ids": "ReferencedTechniqueIDs",
    "control_id": "ControlID",
    "family_id": "FamilyID",
    "family_code": "FamilyCode",
    "supplemental_guidance": "SupplementalGuidance",
    "objectives": "Objectives",
    "baseline_impact": "BaselineImpact",
    "priority": "Priority",
    "related_controls": "RelatedControls",
    "parent_control_id": "ParentControlID",
}
SKIP_PROPS = {"sstpa_label", "is_enhancement", "is_withdrawn"}


def cy_str(v: str) -> str:
    return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"


def cy_value(v) -> str | None:
    if v is None:
        return None
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        return cy_str(v)
    if isinstance(v, list):
        items = [cy_value(x) for x in v if x is not None]
        return "[" + ", ".join(i for i in items if i is not None) + "]"
    return cy_str(json.dumps(v, ensure_ascii=False))


def emit_node(rec: dict, framework: str, version: str, domain: str | None, imported_at: str) -> str:
    label = rec["sstpa_label"]
    eid = rec.get("external_id") or rec.get("stix_id")
    sets = {
        "FrameworkName": cy_str(framework),
        "FrameworkVersion": cy_str(version),
        "FrameworkDomain": cy_str(domain or "n/a"),
        "ExternalType": cy_str(rec.get("stix_type") or label),
        "SourceURI": cy_str(SOURCE_URIS[framework]),
        "ImportedAt": f"datetime('{imported_at}')",
        "LastUpdated": f"datetime('{imported_at}')",
        "_ReadOnly": "true",
        "uuid": "coalesce(n.uuid, randomUUID())",
        "IsDeprecated": "coalesce(n.IsDeprecated, false)",
        "IsRevoked": "coalesce(n.IsRevoked, false)",
    }
    for k, v in rec.items():
        if k in SKIP_PROPS or v is None:
            continue
        prop = PROP_MAP.get(k)
        if not prop:
            continue
        val = cy_value(v)
        if val is not None:
            sets[prop] = val
    set_clause = ",\n    ".join(f"n.{p} = {v}" for p, v in sorted(sets.items()))
    return (
        f"MERGE (n:REF:{label} {{ExternalID: {cy_str(eid)}, "
        f"FrameworkName: {cy_str(framework)}, FrameworkVersion: {cy_str(version)}}})\n"
        f"SET {set_clause};"
    )


def emit_edge(edge: dict, framework: str, version: str) -> str:
    et = edge["relationship_type"]
    if "source_stix_id" in edge:
        skey, sval = "StixID", edge["source_stix_id"]
        tkey, tval = "StixID", edge["target_stix_id"]
    else:
        skey, sval = "ExternalID", edge["source_external_id"]
        tkey, tval = "ExternalID", edge["target_external_id"]
    # Cross-framework mapping (§3.4.2.4): target lives in ATT&CK, match by ExternalID.
    if et == "AT_MAPS_TO_ATTACK":
        return (
            f"MATCH (a:REF:AT_Technique {{ExternalID: {cy_str(sval)}, FrameworkName: 'ATLAS'}})\n"
            f"MATCH (b:REF:AK_Technique {{ExternalID: {cy_str(tval)}}})\n"
            f"MERGE (a)-[:AT_MAPS_TO_ATTACK]->(b);"
        )
    fw = cy_str(framework)
    return (
        f"MATCH (a:REF {{{skey}: {cy_str(sval)}, FrameworkName: {fw}}})\n"
        f"MATCH (b:REF {{{tkey}: {cy_str(tval)}, FrameworkName: {fw}}})\n"
        f"MERGE (a)-[:{et}]->(b);"
    )


def run(inf_dir: Path, out_dir: Path, log_dir: Path | None, dry_run: bool) -> int:
    log = setup_logging("transform", log_dir)
    inf_files = sorted(p for p in inf_dir.glob("*.json") if p.name != "normalization-report.json")
    if not inf_files:
        log.error(f"no INF files in {inf_dir}")
        return 1
    if dry_run:
        log.info(f"would transform {len(inf_files)} INF files")
        return 0

    now = datetime.now(timezone.utc)
    date = now.strftime("%Y-%m-%d")
    n = 1
    while (out_dir / f"sstpa-ref-load-{date}-v{n}.cypher").exists():
        n += 1
    script_path = out_dir / f"sstpa-ref-load-{date}-v{n}.cypher"
    imported_at = utc_now_iso()

    lines: list[str] = [
        f"// SSTPA Reference Graph Load Script v{n} — Generated {date}",
        f"// Source Manifest: {inf_dir}/../ref-archive acquisition-manifest.json",
        "//",
    ]
    lines += [f"// {a}" for a in ATTRIBUTIONS]
    lines.append("")

    counts: dict[str, dict[str, int]] = {}
    root_nodes_emitted: set[str] = set()
    edge_stmts: list[str] = []

    for path in inf_files:
        inf = json.loads(path.read_text())
        framework = inf["framework"]
        version = inf["version"]
        domain = inf.get("domain")
        root_label = FRAMEWORK_ROOTS.get((framework, domain)) or FRAMEWORK_ROOTS.get((framework, None))

        if root_label and root_label not in root_nodes_emitted:
            root_nodes_emitted.add(root_label)
            lines.append(
                f"MERGE (r:REF:{root_label} {{ExternalID: {cy_str(root_label)}, "
                f"FrameworkName: {cy_str(framework)}, FrameworkVersion: {cy_str(version)}}})\n"
                f"SET r.Name = {cy_str(framework + (' ' + domain if domain else ''))},\n"
                f"    r.IsFrameworkRoot = true,\n"
                f"    r.FrameworkDomain = {cy_str(domain or 'n/a')},\n"
                f"    r.SourceURI = {cy_str(SOURCE_URIS[framework])},\n"
                f"    r.ImportedAt = datetime('{imported_at}'),\n"
                f"    r._ReadOnly = true,\n"
                f"    r.uuid = coalesce(r.uuid, randomUUID());"
            )

        fw_counts = counts.setdefault(path.stem, {"nodes": 0, "edges": 0})
        for rec in inf["nodes"]:
            lines.append(emit_node(rec, framework, version, domain, imported_at))
            fw_counts["nodes"] += 1
            # Root CONTAINS for matrices / families / EMB3D items (§3.4.1.4, §3.4.3.4, §3.4.7).
            eid = rec.get("external_id") or rec.get("stix_id")
            if root_label and rec["sstpa_label"] in ("AK_Matrix", "NIST_Family", "EMB3D_Vulnerability", "EMB3D_CourseOfAction", "EMB3D_Device"):
                edge_stmts.append(
                    f"MATCH (r:REF:{root_label}), (n:REF {{ExternalID: {cy_str(eid)}, FrameworkName: {cy_str(framework)}}})\n"
                    f"MERGE (r)-[:CONTAINS]->(n);"
                )
        for edge in inf["edges"]:
            if edge.get("source_external_id") == "__ROOT__":
                edge_stmts.append(
                    f"MATCH (r:REF:{root_label}), (n:REF {{ExternalID: {cy_str(edge['target_external_id'])}, FrameworkName: {cy_str(framework)}}})\n"
                    f"MERGE (r)-[:AT_MATRIX_HAS_TACTIC]->(n);"
                )
            else:
                edge_stmts.append(emit_edge(edge, framework, version))
            fw_counts["edges"] += 1

    lines.append("\n// ---- Relationships ----\n")
    lines.extend(edge_stmts)

    # Count verification suffix (§9.2 Stage 3).
    total_nodes = sum(c["nodes"] for c in counts.values())
    lines.append("")
    lines.append(f"// Expected reference node count (excluding roots): {total_nodes}")
    lines.append("MATCH (n:REF) WHERE coalesce(n.IsFrameworkRoot, false) = false RETURN count(n) AS referenceNodes;")

    out_dir.mkdir(parents=True, exist_ok=True)
    script_path.write_text("\n".join(lines))
    report = {"script": str(script_path), "counts": counts, "generatedAt": imported_at}
    write_json(out_dir / "transform-report.json", report)
    log.info(f"wrote {script_path} ({total_nodes} nodes)")
    print(script_path)
    return 0


def main() -> None:
    args = base_parser("transform", __doc__.split("\n")[0]).parse_args()
    if not args.input or not args.output:
        print("--input (inf dir) and --output (graph dir) are required", file=sys.stderr)
        sys.exit(2)
    sys.exit(run(args.input, args.output, args.log_dir, args.dry_run))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the FireSat Example Data load artifact (SRS §3.6.1).

Reads the tailorable YAML model under model/, validates it against the
machine-readable schema extracts in docs/schema/, and emits an idempotent
Cypher load script packaged the same way as the Reference Data artifact
(tar.gz + .sha256 sidecar), loadable with load-example-data.sh.

The generator owns all bookkeeping the Backend would normally assign:
HIDs per SRS §3.3.8, deterministic UUIDs, ownership (Example Data is
created and Owned by "SSTPA Tools" per SRS §2 and ownership cannot
change), schema property defaults, and the Requirement Orphan/Barren
analytical flags.

Usage: python3 build_firesat.py [--tier1-base N] [--project-seq N]
                                [--no-package] [--tree]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tarfile
import uuid
from datetime import datetime, timezone
from pathlib import Path

import yaml

HERE = Path(__file__).resolve().parent
EXAMPLE_ID = "firesat"
PROJECT_LABEL = "Project"

# Example Data ownership (SRS §2: created and Owned by SSTPA Tools).
OWNER_NAME = "SSTPA Tools"
OWNER_EMAIL = "tools@sstpa.example"

HID_RE = re.compile(r"^([A-Z]{1,4})_([0-9]+(?:\.[0-9]+)*)?_([0-9]+)$")

# Relationship-property enums (validated against node-properties.json at load).
REL_PROP_KEYS = {
    "nature": "RelationshipNature",
    "physical_type": "PhysicalType",
    "layer": "LogicalLayer",
    "protocol": "Protocol",
    "directionality": "FlowDirectionality",
    "timing": "TimingClass",
    "security": "SecurityClass",
}


class ModelError(Exception):
    pass


class Raw(str):
    """A raw Cypher expression (not quoted when serialized)."""


def cy(v) -> str:
    if isinstance(v, Raw):
        return str(v)
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    s = str(v).replace("\\", "\\\\").replace("'", "\\'")
    return f"'{s}'"


def cy_map(props: dict) -> str:
    return "{" + ", ".join(f"{k}: {cy(v)}" for k, v in props.items()) + "}"


class Schema:
    """Schema extracts from docs/schema used for validation."""

    def __init__(self, schema_dir: Path):
        npf = json.loads((schema_dir / "node-properties.json").read_text())
        rel = json.loads((schema_dir / "relationships.json").read_text())
        self.version = npf["schemaVersion"]
        self.prefixes = {n["label"]: n["hidPrefix"] for n in rel["nodeLabels"]}
        self.allowed_rels: set[tuple[str, str, str]] = set()
        for r in rel["relationships"]:
            srcs = r["source"] if isinstance(r["source"], list) else [r["source"]]
            tgts = r["target"] if isinstance(r["target"], list) else [r["target"]]
            for s in srcs:
                for t in tgts:
                    self.allowed_rels.add((r["type"], s, t))
        # Per-label property defaults and enum values (common + type groups).
        self.defaults: dict[str, dict] = {}
        self.enums: dict[str, list[str]] = {}
        common = []
        for g in npf.get("commonPropertyGroups", []):
            common.extend(g.get("properties", []))
        for label, nt in npf["nodeTypes"].items():
            props = list(common)
            for g in nt.get("propertyGroups", []):
                # Relationship-property groups are not node properties.
                if "Relationship Properties" in g.get("groupName", ""):
                    for p in g.get("properties", []):
                        if p.get("enumValues"):
                            self.enums.setdefault(p["name"], p["enumValues"])
                    continue
                props.extend(g.get("properties", []))
            d = {}
            for p in props:
                if p.get("enumValues"):
                    self.enums.setdefault(p["name"], p["enumValues"])
                v = p.get("default")
                if v in (None, "N/A", "Null"):
                    continue
                if p.get("type") == "Boolean":
                    v = v == "True"
                elif p.get("type") == "Integer":
                    v = int(v)
                d[p["name"]] = v
            self.defaults[label] = d

    def check_rel(self, rtype: str, src_label: str, dst_label: str, ctx: str):
        if (rtype, src_label, dst_label) not in self.allowed_rels:
            raise ModelError(
                f"{ctx}: relationship (:{src_label})-[:{rtype}]->(:{dst_label}) "
                f"is not defined in docs/schema/relationships.json"
            )

    def check_enum(self, prop: str, value, ctx: str):
        if value is None:
            return
        allowed = self.enums.get(prop)
        if allowed and value not in allowed:
            raise ModelError(f"{ctx}: {prop}={value!r} not in {allowed}")


class Builder:
    def __init__(self, schema: Schema, stamp: str):
        self.schema = schema
        self.stamp = stamp  # localdatetime literal for Created/LastTouch
        self.nodes: list[dict] = []          # {label, hid, props}
        self.rels: list[tuple] = []          # (src_hid, type, dst_hid, props|None)
        self.hids: set[str] = set()
        self.seq: dict[tuple[str, str], int] = {}   # (soi, prefix) -> last seq
        self.req_keys: dict[str, str] = {}          # global requirement key -> hid
        self.conn_keys: dict[str, str] = {}         # global connection key -> hid
        self.conn_participants: dict[str, int] = {}
        self.req_children: dict[str, int] = {}      # parent req hid -> child count
        self.req_nodes: dict[str, dict] = {}        # req hid -> props (for flags)
        self.deferred_joins: list[tuple] = []       # (if_hid, conn_key, props, ctx)
        self.deferred_derives: list[tuple] = []     # (parent_key, child_hid, ctx)
        self.system_indexes: list[str] = []
        self.tree_lines: list[str] = []

    # -- identity ---------------------------------------------------------
    def next_seq(self, soi: str, prefix: str) -> int:
        k = (soi, prefix)
        self.seq[k] = self.seq.get(k, 0) + 1
        return self.seq[k]

    def make_node(self, label: str, soi: str, seq: int, name: str,
                  extra: dict | None = None) -> str:
        prefix = self.schema.prefixes[label]
        hid = f"{prefix}_{soi}_{seq}"
        if not HID_RE.match(hid):
            raise ModelError(f"generated invalid HID {hid!r}")
        if hid in self.hids:
            raise ModelError(f"duplicate HID {hid!r}")
        self.hids.add(hid)
        # Schema defaults first, then the identity block (which must win:
        # the common ID group carries a Name default of "New").
        props = dict(self.schema.defaults.get(label, {}))
        props.update({
            "uuid": str(uuid.uuid5(uuid.NAMESPACE_URL,
                                   f"sstpa-example://{EXAMPLE_ID}/{hid}")),
            "TypeName": label,
            "Name": name,
            "Owner": OWNER_NAME,
            "OwnerEmail": OWNER_EMAIL,
            "Creator": OWNER_NAME,
            "CreatorEmail": OWNER_EMAIL,
            "VersionID": self.schema.version,
            "SoIIndex": soi,
            "Sequence": seq,
            "Created": Raw(f"localdatetime('{self.stamp}')"),
            "LastTouch": Raw(f"localdatetime('{self.stamp}')"),
        })
        for k, v in (extra or {}).items():
            if v is not None:
                props[k] = v
        self.nodes.append({"label": label, "hid": hid, "props": props})
        return hid

    def relate(self, src: tuple[str, str], rtype: str, dst: tuple[str, str],
               props: dict | None = None, ctx: str = ""):
        (src_label, src_hid), (dst_label, dst_hid) = src, dst
        self.schema.check_rel(rtype, src_label, dst_label, ctx or src_hid)
        self.rels.append((src_hid, rtype, dst_hid, props))

    # -- model ------------------------------------------------------------
    def descs(self, d: dict) -> dict:
        return {"ShortDescription": d.get("short"), "LongDescription": d.get("long")}

    def build_requirement(self, rdef: dict, soi: str, bearer: tuple[str, str],
                          via: str, ctx: str) -> str:
        """Create a Requirement and attach it to its bearer via HAS_REQUIREMENT."""
        self.schema.check_enum("VMethod", rdef.get("method"), ctx)
        seq = self.next_seq(soi, self.schema.prefixes["Requirement"])
        # Orphan: no bearer other than (:Purpose) (backend requirements.go).
        orphan = bearer[0] == "Purpose"
        hid = self.make_node("Requirement", soi, seq, rdef["name"], {
            **self.descs(rdef),
            "RStatement": rdef["statement"],
            "VMethod": rdef.get("method"),
            "VStatement": rdef.get("verification"),
            "Orphan": orphan,
            "Barren": True,  # recomputed in finalize() once PARENTS links exist
        })
        self.req_nodes[hid] = self.nodes[-1]["props"]
        self.relate(bearer, via, ("Requirement", hid), ctx=ctx)
        if rdef.get("key"):
            if rdef["key"] in self.req_keys:
                raise ModelError(f"{ctx}: duplicate requirement key {rdef['key']!r}")
            self.req_keys[rdef["key"]] = hid
        for parent_key in rdef.get("derives_from", []) or []:
            self.deferred_derives.append((parent_key, hid, ctx))
        return hid

    def build_system(self, sysdef: dict, index: str, tier: int,
                     parent: tuple[str, str], parent_rel: str):
        name = sysdef["name"]
        ctx = f"system {name!r} (SoI {index})"
        self.system_indexes.append(index)
        self.tree_lines.append(
            f"{'  ' * tier}- [T{tier}] {name} (SYS_{index}_0)")
        mission = sysdef.get("mission", {})
        sys_hid = self.make_node("System", index, 0, name, {
            **self.descs(sysdef),
            "MissionAction": mission.get("action"),
            "MissionMeans": mission.get("means"),
            "MissionContribution": mission.get("contribution"),
        })
        sys_ref = ("System", sys_hid)
        self.relate(parent, parent_rel, sys_ref, ctx=ctx)

        # Purpose / Environment / States (§3.3.7: one of each minimum).
        p = sysdef.get("purpose", {})
        pur_hid = self.make_node("Purpose", index,
                                 self.next_seq(index, "PUR"),
                                 p.get("name", f"{name} Purpose"), self.descs(p))
        self.relate(sys_ref, "REALIZES", ("Purpose", pur_hid), ctx=ctx)

        e = sysdef.get("environment", {})
        env_hid = self.make_node("Environment", index,
                                 self.next_seq(index, "ENV"),
                                 e.get("name", f"{name} Environment"),
                                 {**self.descs(e), "Context": e.get("context")})
        self.relate(sys_ref, "ACTS_IN", ("Environment", env_hid), ctx=ctx)

        state_hids: dict[str, str] = {}
        states = sysdef.get("states") or [{"name": "Off", "sequence": 0},
                                          {"name": "Operate", "sequence": 1}]
        for st in states:
            st_hid = self.make_node("State", index, self.next_seq(index, "ST"),
                                    st["name"], {**self.descs(st),
                                                 "StateSequence": st.get("sequence")})
            state_hids[st["name"]] = st_hid
            self.relate(sys_ref, "EXHIBITS", ("State", st_hid), ctx=ctx)
        for st in states:
            for tr in st.get("transitions", []) or []:
                if tr["to"] not in state_hids:
                    raise ModelError(f"{ctx}: transition to unknown state {tr['to']!r}")
                kind = tr.get("kind", "FUNCTIONAL")
                self.schema.check_enum("TransitionKind", kind, ctx)
                self.relate(("State", state_hids[st["name"]]), "TRANSITIONS_TO",
                            ("State", state_hids[tr["to"]]),
                            {"TransitionKind": kind, "Trigger": tr.get("trigger"),
                             "GuardCondition": tr.get("guard")}, ctx=ctx)

        # Elements (leaf Components, or Components that PARENT child Systems).
        el_hids: dict[str, str] = {}
        child_systems: list[tuple[dict, str]] = []
        for el in sysdef.get("elements", []) or []:
            el_seq = self.next_seq(index, "EL")
            el_hid = self.make_node("Component", index, el_seq, el["name"], {
                **self.descs(el),
                "TechnologyType": el.get("technology"),
                "DeploymentContext": el.get("deployment"),
            })
            el_hids[el.get("key", el["name"])] = el_hid
            self.relate(sys_ref, "HAS_ELEMENT", ("Component", el_hid), ctx=ctx)
            for rdef in el.get("requirements", []) or []:
                self.build_requirement(rdef, index, ("Component", el_hid),
                                       "HAS_REQUIREMENT", ctx)
            if el.get("system"):
                child_index = f"{index}.{el_seq}"
                child_systems.append((el["system"], child_index, el_hid))
            else:
                self.tree_lines.append(
                    f"{'  ' * (tier + 1)}- [T{tier + 1}] {el['name']} "
                    f"(EL_{index}_{el_seq}, leaf Element)")

        # Functions.
        fun_hids: dict[str, str] = {}
        for f in sysdef.get("functions", []) or []:
            f_hid = self.make_node("SystemFunction", index,
                                   self.next_seq(index, "FUN"),
                                   f["name"], self.descs(f))
            fun_hids[f.get("key", f["name"])] = f_hid
            self.relate(sys_ref, "HAS_FUNCTION", ("SystemFunction", f_hid), ctx=ctx)
            if f.get("allocated_to"):
                if f["allocated_to"] not in el_hids:
                    raise ModelError(f"{ctx}: function {f['name']!r} allocated to "
                                     f"unknown element {f['allocated_to']!r}")
                self.relate(("SystemFunction", f_hid), "ALLOCATED_TO",
                            ("Component", el_hids[f["allocated_to"]]), ctx=ctx)
            for rdef in f.get("requirements", []) or []:
                self.build_requirement(rdef, index, ("SystemFunction", f_hid),
                                       "HAS_REQUIREMENT", ctx)
        for f in sysdef.get("functions", []) or []:
            f_hid = fun_hids[f.get("key", f["name"])]
            for tgt in f.get("flows_to", []) or []:
                if tgt not in fun_hids:
                    raise ModelError(f"{ctx}: flows_to unknown function {tgt!r}")
                self.relate(("SystemFunction", f_hid), "FLOWS_TO_FUNCTION",
                            ("SystemFunction", fun_hids[tgt]), ctx=ctx)

        # Connections owned by this System.
        for c in sysdef.get("connections", []) or []:
            self.schema.check_enum("Directionality", c.get("directionality"), ctx)
            c_hid = self.make_node("Connection", index,
                                   self.next_seq(index, "CNN"), c["name"], {
                **self.descs(c),
                "Connection_Description": c.get("rationale"),
                "ConnectionType": c.get("type"),
                "OSILayer": c.get("osi_layer"),
                "Protocol": c.get("protocol"),
                "Directionality": c.get("directionality"),
                "TimingClass": c.get("timing"),
                "SecurityClass": c.get("security"),
                "PayloadDescription": c.get("payload"),
            })
            self.relate(sys_ref, "HAS_CONNECTION", ("Connection", c_hid), ctx=ctx)
            key = c.get("key")
            if key:
                if key in self.conn_keys:
                    raise ModelError(f"{ctx}: duplicate connection key {key!r}")
                self.conn_keys[key] = c_hid
                self.conn_participants.setdefault(key, 0)
            for rdef in c.get("requirements", []) or []:
                self.build_requirement(rdef, index, ("Connection", c_hid),
                                       "HAS_REQUIREMENT", ctx)

        # Interfaces.
        if_hids: dict[str, str] = {}
        for i in sysdef.get("interfaces", []) or []:
            i_hid = self.make_node("Interface", index,
                                   self.next_seq(index, "INT"),
                                   i["name"], self.descs(i))
            if_hids[i.get("key", i["name"])] = i_hid
            self.relate(sys_ref, "HAS_INTERFACE", ("Interface", i_hid), ctx=ctx)
            for tgt in i.get("connects", []) or []:
                if tgt not in fun_hids:
                    raise ModelError(f"{ctx}: interface {i['name']!r} connects "
                                     f"unknown function {tgt!r}")
                self.relate(("Interface", i_hid), "CONNECTS",
                            ("SystemFunction", fun_hids[tgt]), ctx=ctx)
            if i.get("allocated_to"):
                if i["allocated_to"] not in el_hids:
                    raise ModelError(f"{ctx}: interface {i['name']!r} allocated to "
                                     f"unknown element {i['allocated_to']!r}")
                self.relate(("Interface", i_hid), "ALLOCATED_TO",
                            ("Component", el_hids[i["allocated_to"]]), ctx=ctx)
            joins = i.get("joins") or []
            if isinstance(joins, dict):
                joins = [joins]
            for j in joins:
                props = {}
                for yk, pk in REL_PROP_KEYS.items():
                    if j.get(yk) is not None:
                        self.schema.check_enum(pk, j[yk], ctx)
                        props[pk] = j[yk]
                self.deferred_joins.append((i_hid, j["connection"], props, ctx))
            for rdef in i.get("requirements", []) or []:
                self.build_requirement(rdef, index, ("Interface", i_hid),
                                       "HAS_REQUIREMENT", ctx)

        # Function → Interface flows (interfaces now exist).
        for f in sysdef.get("functions", []) or []:
            f_hid = fun_hids[f.get("key", f["name"])]
            for tgt in f.get("flows_to_interface", []) or []:
                if tgt not in if_hids:
                    raise ModelError(f"{ctx}: flows_to_interface unknown "
                                     f"interface {tgt!r}")
                self.relate(("SystemFunction", f_hid), "FLOWS_TO_INTERFACE",
                            ("Interface", if_hids[tgt]), ctx=ctx)

        # System-level requirements live under the Purpose (§3.3.7).
        for rdef in sysdef.get("requirements", []) or []:
            self.build_requirement(rdef, index, ("Purpose", pur_hid),
                                   "HAS_REQUIREMENT", ctx)

        # Recurse into child Systems: (:Component)-[:PARENTS]->(:System).
        for child_def, child_index, el_hid in child_systems:
            self.build_system(child_def, child_index, tier + 1,
                              ("Component", el_hid), "PARENTS")

    def build_project(self, pdef: dict, project_seq: int) -> tuple[str, str]:
        name = pdef["name"]
        mission = pdef.get("mission", {})
        hid = self.make_node(PROJECT_LABEL, "", project_seq, name, {
            **self.descs(pdef),
            "MissionAction": mission.get("action"),
            "MissionMeans": mission.get("means"),
            "MissionContribution": mission.get("contribution"),
        })
        self.tree_lines.append(f"- [T0] {name} ({hid}, Project root)")
        for rdef in pdef.get("requirements", []) or []:
            self.build_requirement(rdef, "", (PROJECT_LABEL, hid),
                                   "HAS_REQUIREMENT", f"project {name!r}")
        return name, hid

    # -- finalize ---------------------------------------------------------
    def finalize(self):
        for if_hid, conn_key, props, ctx in self.deferred_joins:
            if conn_key not in self.conn_keys:
                raise ModelError(f"{ctx}: joins unknown connection {conn_key!r}")
            self.relate(("Interface", if_hid), "PARTICIPATES_IN",
                        ("Connection", self.conn_keys[conn_key]), props, ctx=ctx)
            self.conn_participants[conn_key] += 1
        for parent_key, child_hid, ctx in self.deferred_derives:
            if parent_key not in self.req_keys:
                raise ModelError(f"{ctx}: derives_from unknown requirement "
                                 f"key {parent_key!r}")
            parent_hid = self.req_keys[parent_key]
            self.relate(("Requirement", parent_hid), "PARENTS",
                        ("Requirement", child_hid), ctx=ctx)
            self.req_children[parent_hid] = self.req_children.get(parent_hid, 0) + 1
        # Barren: no child Requirement and no Verification (§3.3.4.7).
        for hid, props in self.req_nodes.items():
            props["Barren"] = self.req_children.get(hid, 0) == 0
        for key, n in sorted(self.conn_participants.items()):
            if n < 2:
                print(f"WARN: connection {key!r} has {n} participating "
                      f"interface(s); expected at least 2", file=sys.stderr)

    def max_tier(self) -> int:
        return max(idx.count(".") + 1 for idx in self.system_indexes)


def emit_cypher(b: Builder, project_name: str, tier1: list[str],
                generated: str) -> str:
    lines = [
        f"// SSTPA Example Data Load Script — {project_name} (SRS §3.6.1)",
        f"// Generated {generated} by Example_Data/FireSat/build_firesat.py",
        f"// Owner/Creator: {OWNER_NAME} <{OWNER_EMAIL}> (SRS §2: Example Data",
        "// ownership cannot change). Idempotent: MERGE on HID.",
        f"// Tier-1 SoI indexes: {' '.join(tier1)}",
        f"// Project root HID: {b.nodes[0]['hid']}",
        f"// Expected example node count: {len(b.nodes)}",
        "",
    ]
    for n in b.nodes:
        lines.append(f"MERGE (n:SSTPA:{n['label']} {{HID: {cy(n['hid'])}}})\n"
                     f"SET n += {cy_map(n['props'])};")
    lines.append("\n// ---- Relationships ----\n")
    for src, rtype, dst, props in b.rels:
        stmt = (f"MATCH (a:SSTPA {{HID: {cy(src)}}}), "
                f"(b:SSTPA {{HID: {cy(dst)}}})\n"
                f"MERGE (a)-[r:{rtype}]->(b)")
        clean = {k: v for k, v in (props or {}).items() if v is not None}
        if clean:
            stmt += f"\nSET r += {cy_map(clean)}"
        lines.append(stmt + ";")
    lines += [
        "",
        f"// Expected example node count: {len(b.nodes)}",
        f"MATCH (n:SSTPA {{Creator: {cy(OWNER_NAME)}}})",
        f"WHERE n.SoIIndex = '' OR split(n.SoIIndex, '.')[0] IN "
        f"[{', '.join(cy(t) for t in tier1)}]",
        "RETURN count(n) AS exampleNodes;",
    ]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--model-dir", type=Path, default=HERE / "model")
    ap.add_argument("--out-dir", type=Path, default=HERE / "dist")
    ap.add_argument("--schema-dir", type=Path,
                    default=HERE.parent.parent / "docs" / "schema")
    ap.add_argument("--tier1-base", type=int, default=1,
                    help="SoI index of the first Tier-1 System (default 1)")
    ap.add_argument("--project-seq", type=int, default=1,
                    help="Project HID sequence (default 1; CAP__0 is reserved "
                         "for the deployment's own Core project)")
    ap.add_argument("--no-package", action="store_true",
                    help="write the .cypher only, skip tar.gz + sha256")
    ap.add_argument("--tree", action="store_true",
                    help="print the hierarchy tree and exit (no files written)")
    args = ap.parse_args()

    schema = Schema(args.schema_dir)
    now = datetime.now(timezone.utc)
    stamp = now.strftime("%Y-%m-%dT%H:%M:%S")
    b = Builder(schema, stamp)

    root = yaml.safe_load((args.model_dir / "00-project.yaml").read_text())
    project_name, _ = b.build_project(root["project"], args.project_seq)
    tier1: list[str] = []
    for i, seg_file in enumerate(root["segments"]):
        seg = yaml.safe_load((args.model_dir / seg_file).read_text())
        index = str(args.tier1_base + i)
        tier1.append(index)
        b.build_system(seg["system"], index, 1,
                       (PROJECT_LABEL, b.nodes[0]["hid"]), "HAS_SYSTEM")
    b.finalize()

    tree = "\n".join(b.tree_lines)
    if args.tree:
        print(tree)
        return 0

    args.out_dir.mkdir(parents=True, exist_ok=True)
    date = now.strftime("%Y-%m-%d")
    n = 1
    while (args.out_dir / f"sstpa-example-{EXAMPLE_ID}-load-{date}-v{n}.cypher").exists():
        n += 1
    script = args.out_dir / f"sstpa-example-{EXAMPLE_ID}-load-{date}-v{n}.cypher"
    script.write_text(emit_cypher(b, project_name, tier1, f"{date} v{n}") + "\n")
    (args.out_dir / "hierarchy-tree.txt").write_text(tree + "\n")

    by_label: dict[str, int] = {}
    for node in b.nodes:
        by_label[node["label"]] = by_label.get(node["label"], 0) + 1
    print(f"wrote {script}")
    print(f"  nodes: {len(b.nodes)}  relationships: {len(b.rels)}  "
          f"systems: {by_label.get('System', 0)}  max tier: {b.max_tier()}")
    print("  " + ", ".join(f"{k}={v}" for k, v in sorted(by_label.items())))

    if not args.no_package:
        artifact = args.out_dir / f"sstpa-example-{EXAMPLE_ID}-{date}-v{n}.tar.gz"
        with tarfile.open(artifact, "w:gz") as tf:
            tf.add(script, arcname=script.name)
        digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
        (artifact.parent / f"{artifact.name}.sha256").write_text(
            f"{digest}  {artifact.name}\n")
        print(f"packaged {artifact}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except ModelError as e:
        print(f"MODEL ERROR: {e}", file=sys.stderr)
        sys.exit(1)

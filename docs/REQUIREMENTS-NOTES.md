# Requirements Notes — Deviations, Risks, and Interpretations

Per SRS §1.1, "Should" statements are treated as SHALL unless justification is given,
and "Will" statements likely not to occur require notification and explanation. This
file is that record. Items needing the owner's decision are marked **[NEEDS DECISION]**.

## Interpretations (best-judgement calls on gaps/contradictions)

| # | SRS ref | Issue | Interpretation taken |
|---|---|---|---|
| I-1 | §5.3 / §5.5 vs §5.7.4 | §5.3/§5.5 say to group reverse proxy + Grafana in "the same container" and DB + non-user-facing apps in "a single container", but §5.7.4's authoritative compose topology runs each named image as its own service. | Followed §5.7.4 (one service per image, standard for the named images). The "container" statements are honored as network/zone groupings: user-facing (edge) vs non-user-facing (backend). |
| I-2 | §3.4.1.1 | SRS baselines ATT&CK v19.1, ATLAS v5.4, NIST 5.2.0 with exact counts. Availability at acquisition time may differ. | Sustainment acquires the SRS-named versions when published; otherwise the latest published version is acquired and recorded in the acquisition manifest. Counts validated against the actual bundle rather than hard-coded SRS figures. |
| I-3 | §3.2 | Password stored as SHA-384 hash (no salt specified). | Implemented exactly as specified (unsalted SHA-384), consistent with §2/§4 note that security features are placeholders for enterprise security post-MVP. Flagged for post-MVP hardening. |
| I-4 | §1.2.2 / §3.3.3 | SRS names `(:ControlsBaseline)` (HID prefix CBL) only in the ID table and Controls Tool section, not in §3.3.3 canonical labels. | Treated as a canonical label used by the Controls Tool (§6.5.17); included in schema. |
| I-5 | §3.3.8 | HID format shown as `{TYPE}*{INDEX}*{SEQUENCE}` in one place and `SYS_1.2.3_0` in the example. | Underscore form (`TYPE_INDEX_SEQUENCE`) is canonical; the asterisk form is a Markdown escaping artifact. |
| I-6 | §3.2 | GsnGoal HID prefix listed as "G" under "GsnGoa G" (typo). | Prefix `G` for GsnGoal. GsnAssumption listed as "Assumption ASM" → prefix `ASM`. |
| I-7 | §5.6.6.1 | "The API SHALL use HTTPS" while TLS terminates at Caddy (§5.4). | TLS terminates at Caddy; Caddy→backend is internal HTTP on the private Docker network, per §5's own layout diagram. |
| I-8 | §1.2 vs §3.3.10/§3.3.4.6.2/§3.3.4.6.3 | §1.2 prose lists "Integrity" among the Security Attributes, but the Asset Assurances property group, the criticality/assurance inheritance rules, and the protection-requirement labels all consistently omit Integrity. | Implemented per the consistent normative sections: assurance set is Confidentiality, Availability, Authenticity, NonRepudiation, Certifiable, Privacy, Trustworthy (no Integrity property on Asset). |
| I-9 | §3.3.3.1 / §3.3.4.2 | "One Default (:Purpose) node SHALL be created when a new (:System) is created"; a System SHALL have ≥1 Purpose/Environment/State. §3.3.7 spells this out only for creation-from-Component. | Backend auto-creates default (:Purpose), (:Environment), (:State) (and links) for every (:System) created through the commit pipeline as well. |
| I-10 | §3.3.4.7 vs §6.5.3.8 | Orphan/Barren definitions conflict: §3.3.4.7 says Orphan = no bearer other than Purpose, Barren = no child AND no VERIFIED_BY; §6.5.3.8 says Orphan = no parent Requirement, Barren = no child OR no non-Purpose HAS_REQUIREMENT. | The Gap Analysis report (the only place authorized to SET the flags per §6.5.3.8) computes and persists per §6.5.3.8. The Requirements Tool displays live analysis per §3.3.4.7 without persisting. Both are shown in the report for transparency. |
| I-11 | §6.5.3.6/§6.5.3.7 | Reports "SHALL be in text, markdown, MS Word or PDF format". | Implemented: plain text, Markdown, and HTML (opens in MS Word; print-to-PDF via the browser dialog). Native .docx/.pdf writers deferred to keep §2 minimum-complexity; the "or" in the requirement is read as offering a subset. |
| I-12 | §6.5.7.10/§6.5.7.12 vs §3.3.3 | The Asset Manager requires (:MasterRegime) and (:Asset)-[:DERIVED_FROM]->(:Asset), neither present in the §3.3.3/§3.3.4 canonical model (§3.7.6 does name a "Derives" profile assoc). | Added to the machine-readable schema: MasterRegime label (HID prefix MREG, not translated) and DERIVED_FROM (Asset→Asset, DerivedAsset→Asset). MasterRegime nodes are project-global templates, not SoI members. |
| I-13 | §6.5.17 / §9.6 | The SRS calls for CREF/CNSSI/Cyber Survivability material as Reference Data but does not provide a committed machine-readable source in this repository. | Controls Tool captures Cyber Resilience and Cyber Survivability selections in `ControlsBaselineJSON`; immutable Reference Graph import is limited to the validated machine-readable bundles present in Sustainment (ATT&CK, ATLAS, NIST 800-53, EMB3D) until an authorized CREF/CNSSI source bundle is provided. |

## Will-statement / feasibility notifications

| # | SRS ref | Notification |
|---|---|---|
| N-1 | §2.1 | Air-gapped Windows 11 Enterprise operation: development and CI run on Linux (§8); Windows installer produced but Windows-native validation requires a Windows host — cannot be exercised on this development system. |
| N-2 | §9.2 Stage 1 | Acquisition requires internet; performed on this development system and archived so all later stages run offline. |

## Deferred items requiring permission (none yet)

(Empty — any "Should" proposed for omission will be recorded here before deferral.)

## Model-Display Directive (SysML 2.0 / KerML 1.0)

Per the standing directive (2026-07-04): every model-displaying Add-on Tool
except the Message Center SHALL display its model from SysML 2.0 / KerML 1.0
transformed data.

| # | Ref | Interpretation taken |
|---|---|---|
| M-1 | §3.7, §6.4.2 | Implemented the G2M translator (graph → SysML 2.0 / KerML 1.0 textual notation) and exposed it at `/api/model/{sysml,kerml,profile}`. Every tool whose manifest declares `ModelTextLanguages` renders live G2M output in its Model Text Panel (§6.4.2) with keyword highlighting. This is the concrete SysML/KerML model-display surface. The graph remains authoritative (§3.7.1); the panel is a read-only projection. |
| M-2 | §6.5.3.9, §6.5.4.16, §6.5.8.16 | Corrected three tool manifests whose `ModelTextLanguages` did not match their SRS Model Text Panel sections: Reports → [SYSML, KERML], Reference → [KERML], Context → [SYSML, KERML]. All model tools now display SysML/KerML. |
| M-3 | Navigator (§6.5.1), Admin (§6.5.15), Message Center (§6.5.14) | These declare no Model Text Panel: Navigator performs hierarchy navigation (not model display), Admin manages users, Message Center is explicitly exempt. No SysML/KerML surface required. |
| M-4 | §3.7.9 M2G | M2G (text → staged graph mutations) text-commit is not enabled in this version; the Model Text Panel is read-only. Editing is performed through the tool canvases and Data Drawer, which is the authoritative staged-commit path. `/api/model/validate` returns an empty change set and `/api/model/commit` returns 501 so tools degrade gracefully. Recorded as a deferred capability. |

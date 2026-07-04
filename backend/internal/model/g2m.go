// G2M translator (SRS §3.7.8): deterministic projection of one SoI sub-graph
// into a SysML 2.0 "System Model" package and a KerML 1.0 "Security
// Analysis" package (§3.7.4), per the §3.7.5/§3.7.6 mapping tables.
//
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.
package model

import (
	"fmt"
	"sort"
	"strings"

	"github.com/netrisk2025/SSTPA-ToolsV2/backend/internal/schema"
)

// sysmlKeyword maps SYSML-domain labels to their construct and annotation
// (SRS §3.7.5 Table 1).
var sysmlKeyword = map[string]struct{ kw, note string }{
	"Project":          {"package", "#capability"},
	"Sandbox":          {"package", "#sandbox"},
	"System":           {"part", "#system"},
	"Component":        {"part", "#element"},
	"Environment":      {"part", "#environment"},
	"Interface":        {"port", ""},
	"SystemFunction":   {"action", ""},
	"State":            {"state", ""},
	"Purpose":          {"concern", "#purpose"},
	"Constraint":       {"constraint", ""},
	"Requirement":      {"requirement", ""},
	"Verification":     {"verification", ""},
	"Validation":       {"verification", "#validation"},
	"UseCase":          {"use case", ""},
	"FunctionalFlow":   {"view", ""},
	"Connection":       {"connection", ""},
	"Perspective":      {"", ""}, // structural container only, not emitted (§3.7.5)
}

// ownershipRels drive SysML nesting membership (SRS §3.7.6 Table 1, row 1).
var ownershipRels = map[string]bool{
	"HAS_SYSTEM": true, "HAS_INTERFACE": true, "HAS_FUNCTION": true,
	"HAS_ELEMENT": true, "HAS_CONNECTION": true, "HAS_ASSET": true,
	"EXHIBITS": true, "REALIZES": true, "HAS_REQUIREMENT": true,
	"HAS_CONSTRAINT": true, "HAS_USECASE": true, "HAS_VALIDATION": true,
	"HAS_FUNCTIONAL_FLOW": true, "VERIFIED_BY": true,
}

// kermlAssoc maps KERML-domain relationship types to their Profile assocs
// (SRS §3.7.6 Table 2).
var kermlAssoc = map[string]string{
	"HOLDS": "Holds", "TRANSPORTS": "Transports", "USES": "Uses",
	"VALID_IN": "ValidIn", "HAS_LOSS": "HasLoss", "HAS_GOAL": "HasGoal",
	"HAS_REGIME": "HasRegime", "DERIVES": "Derives",
	"HAS_ENVIRONMENT": "LossEnvironment",
	"THREATENS":       "Threatens", "VIOLATES": "Violates", "USES_ATTACK": "UsesAttack",
	"EXPLOITS": "Exploits", "DEFEATS": "Defeats", "BLOCKS": "Blocks",
	"SUBORDINATE_TO": "SubordinateTo", "TARGETS_LOSS": "TargetsLoss",
	"ENFORCES": "Enforces", "MITIGATES": "Mitigates", "SATISFIES": "Satisfies",
	"APPLIES_TO_FUNCTION": "AppliesTo", "APPLIES_TO_INTERFACE": "AppliesTo",
	"APPLIES_TO_ELEMENT": "AppliesTo", "APPLIES_TO_STATE": "AppliesTo",
	"APPLIES_TO_FEEDBACK": "AppliesTo",
	"SUPPORTED_BY":        "SupportedBy", "IN_CONTEXT_OF": "InContextOf",
	"HAS_VERIFICATION": "SolutionEvidence", "HAS_HAZARD": "HasHazard",
	"GENERATES": "Generates", "COMMANDS": "Commands", "CAUSES": "Causes",
	"PRODUCES": "Produces", "INFORMS": "Informs", "TUNES": "Tunes",
	"IMPLEMENTS": "Implements",
}

// kermlClassifier maps KERML-domain labels to Profile classifiers (§3.7.5
// Table 2).
var kermlClassifier = map[string]string{
	"Asset": "Asset", "DerivedAsset": "DerivedAsset", "Regime": "Regime",
	"Hazard": "Hazard", "Loss": "Loss", "Attack": "Attack",
	"Countermeasure": "Countermeasure", "SecurityControl": "SecurityControl",
	"GsnGoal": "GsnGoal", "GsnStrategy": "GsnStrategy",
	"GsnContext": "GsnContext", "GsnAssumption": "GsnAssumption",
	"GsnJustification": "GsnJustification", "GsnSolution": "GsnSolution",
	"ControlAlgorithm": "ControlAlgorithm", "ControlledProcess": "ControlledProcess",
	"ControlAction": "ControlAction", "ProcessModel": "ProcessModel",
	"Feedback": "Feedback", "ControlsBaseline": "ControlsBaseline",
}

// domainOf classifies a label into SYSML / KERML / none using the schema,
// with the §3.7.5 special cases.
func domainOf(sch *schema.Schema, label string) string {
	switch label {
	case "Security", "ControlStructure":
		return "KERML" // packages in the analysis domain (§3.7.5 Table 2)
	case "Perspective":
		return "" // structural container only
	}
	if _, ok := kermlClassifier[label]; ok {
		return "KERML"
	}
	if _, ok := sysmlKeyword[label]; ok {
		return "SYSML"
	}
	if nt, ok := sch.NodeTypes[label]; ok {
		return nt.ModelDomain
	}
	return ""
}

// EmitSoI renders both packages for one SoI (SRS §3.7.4): the SysML System
// Model followed by the KerML Security Analysis.
func EmitSoI(sch *schema.Schema, g *Graph, schemaVersion string) (sysml, kerml string) {
	return emitSysML(sch, g, schemaVersion), emitKerML(sch, g, schemaVersion)
}

type emitCtx struct {
	sch      *schema.Schema
	byHID    map[string]Node
	children map[string][]string // owner HID → owned HIDs (SYSML nesting)
	owned    map[string]bool     // HIDs owned by some SYSML parent
	relsFrom map[string][]Rel
	g        *Graph
}

func newEmitCtx(sch *schema.Schema, g *Graph) *emitCtx {
	ctx := &emitCtx{
		sch:      sch,
		byHID:    map[string]Node{},
		children: map[string][]string{},
		owned:    map[string]bool{},
		relsFrom: map[string][]Rel{},
		g:        g,
	}
	sortNodes(g.Nodes)
	sortRels(g.Rels)
	for _, n := range g.Nodes {
		ctx.byHID[n.HID] = n
	}
	for _, r := range g.Rels {
		ctx.relsFrom[r.Source] = append(ctx.relsFrom[r.Source], r)
		if ownershipRels[r.Type] {
			src, sok := ctx.byHID[r.Source]
			tgt, tok := ctx.byHID[r.Target]
			// Only SYSML-domain parents nest SYSML-domain children.
			if sok && tok &&
				domainOf(sch, src.Label) == "SYSML" &&
				domainOf(sch, tgt.Label) == "SYSML" &&
				!ctx.owned[r.Target] {
				ctx.children[r.Source] = append(ctx.children[r.Source], r.Target)
				ctx.owned[r.Target] = true
			}
		}
	}
	for hid := range ctx.children {
		kids := ctx.children[hid]
		sort.Slice(kids, func(i, j int) bool { return hidLess(kids[i], kids[j]) })
		ctx.children[hid] = kids
	}
	return ctx
}

func emitSysML(sch *schema.Schema, g *Graph, schemaVersion string) string {
	ctx := newEmitCtx(sch, g)
	w := &writer{}

	pkgName := strings.TrimSpace(g.SoIName) + " System Model"
	w.open("package %s %s", shortName(g.SoIHID+".SM"), quoteName(pkgName))
	w.line("#sstpa { schemaVersion = %q }", schemaVersion)

	// Roots: SYSML nodes not owned by another SYSML node, System first.
	var roots []Node
	for _, n := range g.Nodes {
		if domainOf(sch, n.Label) == "SYSML" && !ctx.owned[n.HID] && sysmlKeyword[n.Label].kw != "" {
			roots = append(roots, n)
		}
	}
	sortNodes(roots)
	for _, n := range roots {
		emitSysMLNode(w, ctx, n)
	}

	// Cross-cutting SYSML relationships (§3.7.6 Table 1) at package level.
	emitSysMLRelationships(w, ctx)

	w.close()
	return w.String()
}

func emitSysMLNode(w *writer, ctx *emitCtx, n Node) {
	spec := sysmlKeyword[n.Label]
	if spec.kw == "" {
		return
	}
	head := fmt.Sprintf("%s %s %s", spec.kw, shortName(n.HID), quoteName(nodeName(n)))
	if spec.note != "" {
		head += " " + spec.note
	}

	body := bodyLines(ctx, n, "attribute")
	kids := ctx.children[n.HID]

	if len(body) == 0 && len(kids) == 0 {
		w.line("%s;", head)
		return
	}
	w.open("%s", head)
	for _, l := range body {
		w.line("%s", l)
	}
	for _, kid := range kids {
		emitSysMLNode(w, ctx, ctx.byHID[kid])
	}
	w.close()
}

// bodyLines: docs, #externalref annotations, then attributes.
func bodyLines(ctx *emitCtx, n Node, attrKw string) []string {
	var out []string
	out = append(out, docLines(n)...)
	for _, r := range ctx.relsFrom[n.HID] {
		if r.Type == "REFERENCES" {
			out = append(out, fmt.Sprintf(
				"#externalref { framework = %q; externalId = %q; sourceUri = %q; }",
				r.RefFramework, r.RefExternalID, r.RefSourceURI))
		}
	}
	out = append(out, emitProps(ctx.sch, n, attrKw)...)
	return out
}

func emitSysMLRelationships(w *writer, ctx *emitCtx) {
	for _, r := range ctx.g.Rels {
		src, sok := ctx.byHID[r.Source]
		tgt, tok := ctx.byHID[r.Target]
		if !sok || !tok {
			continue
		}
		sh, th := shortNameRef(r.Source), shortNameRef(r.Target)
		switch r.Type {
		case "TRANSITIONS_TO":
			// transition first <source> then <target> (§3.7.6).
			w.open("transition first %s then %s", sh, th)
			for _, k := range sortedKeys(r.Props) {
				if strings.HasPrefix(k, "Trace") {
					continue
				}
				if v := r.Props[k]; v != nil {
					w.line("attribute %s = %s;", quoteName(k), literal(v))
				}
			}
			w.close()
		case "ALLOCATED_TO":
			w.line("allocate %s to %s;", sh, th)
		case "FLOWS_TO_FUNCTION", "FLOWS_TO_INTERFACE":
			w.open("succession flow %s then %s", sh, th)
			for _, k := range sortedKeys(r.Props) {
				if v := r.Props[k]; v != nil {
					w.line("attribute %s = %s;", quoteName(k), literal(v))
				}
			}
			w.close()
		case "PARTICIPATES_IN":
			// Interface participates in Connection: connection end binding.
			w.line("binding %s = %s; // participates in", th, sh)
		case "CONNECTS":
			w.line("binding %s = %s; // boundary realization", sh, th)
		case "PARENTS":
			if src.Label == "Requirement" && tgt.Label == "Requirement" {
				w.line("dependency %s to %s #parents;", sh, th)
			}
		case "INCLUDES":
			if src.Label == "UseCase" {
				w.line("perform %s; // in %s", th, sh)
			}
		case "INVOLVES":
			w.line("dependency %s to %s #involves;", sh, th)
		case "INCLUDES_UC":
			w.line("include use case %s; // in %s", th, sh)
		case "EXTENDS":
			ext, _ := r.Props["ExtensionPoint"].(string)
			w.line("use case %s specializes %s #extend(extensionPoint = %q);", sh, th, ext)
		case "VERIFIED_BY":
			w.line("verify %s; // objective of %s", sh, th)
		case "CONTAINS":
			if src.Label == "FunctionalFlow" {
				w.line("expose %s; // in view %s", th, sh)
			}
		}
	}
}

func shortNameRef(hid string) string {
	return "'" + strings.NewReplacer("\\", "\\\\", "'", "\\'").Replace(hid) + "'"
}

func sortedKeys(m map[string]any) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func emitKerML(sch *schema.Schema, g *Graph, schemaVersion string) string {
	ctx := newEmitCtx(sch, g)
	w := &writer{}

	pkgName := strings.TrimSpace(g.SoIName) + " Security Analysis"
	w.open("package %s %s", shortName(g.SoIHID+".SA"), quoteName(pkgName))
	w.line("#sstpa { schemaVersion = %q }", schemaVersion)
	w.line("import %s::*;", quoteName(strings.TrimSpace(g.SoIName)+" System Model"))
	w.line("import 'SSTPA Profile'::*;")

	// Security package nests controls and countermeasures (§3.7.6 Table 2).
	securityMembers := map[string]bool{}
	var securityNodes []Node
	for _, r := range ctx.g.Rels {
		if r.Type == "HAS_CONTROL" || r.Type == "HAS_COUNTERMEASURE" {
			if src, ok := ctx.byHID[r.Source]; ok && src.Label == "Security" {
				securityMembers[r.Target] = true
			}
		}
	}
	for _, n := range g.Nodes {
		if n.Label == "Security" {
			securityNodes = append(securityNodes, n)
		}
	}

	emitFeature := func(n Node) {
		cls := kermlClassifier[n.Label]
		head := fmt.Sprintf("feature %s %s : %s", shortName(n.HID), quoteName(nodeName(n)), cls)
		body := bodyLines(ctx, n, "feature")
		if len(body) == 0 {
			w.line("%s;", head)
			return
		}
		w.open("%s", head)
		for _, l := range body {
			w.line("%s", l)
		}
		w.close()
	}

	// Control Structure packages contain their STPA role features (§3.7.5).
	csMembers := map[string]string{} // member HID → owning CS HID
	for _, r := range ctx.g.Rels {
		if src, ok := ctx.byHID[r.Source]; ok && src.Label == "ControlStructure" {
			if _, isRole := kermlClassifier[ctx.byHID[r.Target].Label]; isRole {
				csMembers[r.Target] = r.Source
			}
		}
	}

	// 1. Free-standing KERML features (not Security members, not CS members).
	for _, n := range g.Nodes {
		if _, ok := kermlClassifier[n.Label]; !ok {
			continue
		}
		if securityMembers[n.HID] {
			continue
		}
		if _, inCS := csMembers[n.HID]; inCS {
			continue
		}
		emitFeature(n)
	}

	// 2. Security packages.
	for _, sec := range securityNodes {
		w.open("package %s 'Security'", shortName(sec.HID))
		for _, l := range bodyLines(ctx, sec, "feature") {
			w.line("%s", l)
		}
		var members []string
		for hid := range securityMembers {
			members = append(members, hid)
		}
		sort.Slice(members, func(i, j int) bool { return hidLess(members[i], members[j]) })
		for _, hid := range members {
			if n, ok := ctx.byHID[hid]; ok {
				emitFeature(n)
			}
		}
		w.close()
	}

	// 3. Control Structure packages.
	var csNodes []Node
	for _, n := range g.Nodes {
		if n.Label == "ControlStructure" {
			csNodes = append(csNodes, n)
		}
	}
	for _, cs := range csNodes {
		w.open("package %s %s", shortName(cs.HID), quoteName(nodeName(cs)))
		for _, l := range bodyLines(ctx, cs, "feature") {
			w.line("%s", l)
		}
		var members []string
		for hid, owner := range csMembers {
			if owner == cs.HID {
				members = append(members, hid)
			}
		}
		sort.Slice(members, func(i, j int) bool { return hidLess(members[i], members[j]) })
		for _, hid := range members {
			if n, ok := ctx.byHID[hid]; ok {
				emitFeature(n)
			}
		}
		w.close()
	}

	// 4. Connectors for KERML-domain relationships (§3.7.6 Table 2).
	for _, r := range ctx.g.Rels {
		if r.Type == "AT_RELATES_TO" {
			emitAtConnector(w, r)
			continue
		}
		assoc, ok := kermlAssoc[r.Type]
		if !ok {
			continue
		}
		if _, sok := ctx.byHID[r.Source]; !sok {
			continue
		}
		if _, tok := ctx.byHID[r.Target]; !tok {
			continue
		}
		// CURRENT trace relationships only (§3.7.2).
		if status, has := r.Props["TraceStatus"].(string); has && status != "CURRENT" {
			continue
		}
		props := connectorProps(r)
		if len(props) == 0 {
			w.line("connector : %s ( %s, %s );", assoc, shortNameRef(r.Source), shortNameRef(r.Target))
			continue
		}
		w.open("connector : %s ( %s, %s )", assoc, shortNameRef(r.Source), shortNameRef(r.Target))
		for _, l := range props {
			w.line("%s", l)
		}
		w.close()
	}

	w.close()
	return w.String()
}

// emitAtConnector renders an Attack Tree edge as an AtAnd/AtOr/AtSand
// connector (§3.7.6 Table 2; D-8).
func emitAtConnector(w *writer, r Rel) {
	logic, _ := r.Props["LogicOperator"].(string)
	assoc := map[string]string{"AND": "AtAnd", "OR": "AtOr", "SAND": "AtSand"}[logic]
	if assoc == "" {
		assoc = "AtOr"
	}
	w.open("connector : %s ( %s, %s )", assoc, shortNameRef(r.Source), shortNameRef(r.Target))
	for _, l := range connectorProps(r) {
		w.line("%s", l)
	}
	w.close()
}

func connectorProps(r Rel) []string {
	var out []string
	for _, k := range sortedKeys(r.Props) {
		v := r.Props[k]
		if v == nil || k == "Lossuuid" {
			continue
		}
		if s, ok := v.(string); ok && s == "" {
			continue
		}
		if b, ok := v.(bool); ok && !b {
			continue // omit false flags (defaults, §3.7.7)
		}
		out = append(out, fmt.Sprintf("feature %s = %s;", quoteName(k), literal(v)))
	}
	return out
}

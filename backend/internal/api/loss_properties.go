package api

import (
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"strings"
)

var lossColor = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)
var metricIdentifier = regexp.MustCompile(`^[A-Za-z][A-Za-z0-9_]*$`)

func unsafeLossKey(s string) bool {
	switch s {
	case "__proto__", "prototype", "constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__":
		return true
	}
	return false
}
func number(v any) (float64, bool) {
	n, ok := v.(float64)
	return n, ok && !math.IsNaN(n) && !math.IsInf(n, 0)
}
func getMetricField(m map[string]any, keys ...string) any {
	for _, key := range keys {
		if v, ok := m[key]; ok {
			return v
		}
	}
	return nil
}
func metricID(m map[string]any) string {
	return str2s(getMetricField(m, "id", "metricName", "MetricName"))
}
func metricOperation(v any) bool {
	switch v {
	case "SUM", "PRODUCT", "MIN", "MAX":
		return true
	}
	return false
}
func probabilityMetric(id string) bool {
	switch id {
	case "RandomEventProbability", "BenefitASE", "EncounterASE", "AttackProbability":
		return true
	}
	return false
}
func derivedMetric(id string) bool {
	switch id {
	case "AttackFeasibility", "AttackDifficulty", "AttackerBenefit", "AttackerDetrimentValue", "AttackerNetBenefit", "PainFactor", "Propensity", "RelativeRisk", "EncounterRate", "EffectiveEncounters", "RateOfOccurrence", "ARO", "CumulativeRisk", "ALE", "TimeToRiskThreshold", "OpportunityFraction":
		return true
	}
	return false
}

func validateLossView(value any) error {
	if value == nil {
		return nil
	}
	v, ok := value.(map[string]any)
	if !ok {
		return fmt.Errorf("lossToolView must be an object")
	}
	if version, ok := number(v["version"]); !ok || version != 1 {
		return fmt.Errorf("unsupported lossToolView version; use a compatible Loss Tool")
	}
	if ids, exists := v["nodeIds"]; exists {
		m, ok := ids.(map[string]any)
		if !ok {
			return fmt.Errorf("lossToolView.nodeIds must be an object")
		}
		seen := map[string]bool{}
		for key, value := range m {
			id, ok := value.(string)
			if !ok || strings.TrimSpace(id) == "" || unsafeLossKey(id) || unsafeLossKey(key) || seen[id] {
				return fmt.Errorf("tree-local node IDs must be safe and unique")
			}
			seen[id] = true
		}
	}
	if positions, exists := v["positions"]; exists {
		m, ok := positions.(map[string]any)
		if !ok {
			return fmt.Errorf("positions must be an object")
		}
		for key, value := range m {
			p, ok := value.(map[string]any)
			if !ok || unsafeLossKey(key) {
				return fmt.Errorf("invalid position")
			}
			for _, axis := range []string{"x", "y"} {
				if _, ok := number(p[axis]); !ok {
					return fmt.Errorf("invalid position %s", axis)
				}
			}
		}
	}
	if viewport, exists := v["viewport"]; exists {
		m, ok := viewport.(map[string]any)
		if !ok {
			return fmt.Errorf("invalid viewport")
		}
		for _, axis := range []string{"x", "y", "zoom"} {
			if _, ok := number(m[axis]); !ok {
				return fmt.Errorf("invalid viewport %s", axis)
			}
		}
		z, _ := number(m["zoom"])
		if z < 0.02 || z > 3 {
			return fmt.Errorf("viewport zoom must be between 0.02 and 3")
		}
	}
	for _, key := range []string{"collapsed", "selectedProperties", "selectedNodeProperties"} {
		if value, exists := v[key]; exists {
			values, ok := value.([]any)
			if !ok {
				return fmt.Errorf("%s must be an array", key)
			}
			for _, x := range values {
				id, ok := x.(string)
				if !ok || unsafeLossKey(id) {
					return fmt.Errorf("invalid %s value", key)
				}
				if key == "selectedNodeProperties" && id != "nodeId" && id != "authoritativeUuid" && id != "provenance" {
					return fmt.Errorf("unknown node property %s", id)
				}
			}
		}
	}
	if direction, exists := v["direction"]; exists && direction != "DOWN" && direction != "RIGHT" {
		return fmt.Errorf("invalid layout direction")
	}
	if theme, exists := v["theme"]; exists && theme != "parchment" && theme != "nocturne" {
		return fmt.Errorf("invalid Loss theme")
	}
	if styles, exists := v["nodeStyles"]; exists {
		m, ok := styles.(map[string]any)
		if !ok {
			return fmt.Errorf("nodeStyles must be an object")
		}
		for _, value := range m {
			style, ok := value.(map[string]any)
			if !ok {
				return fmt.Errorf("invalid node style")
			}
			for _, channel := range []string{"font", "box", "line", "border"} {
				if !lossColor.MatchString(str2s(style[channel])) {
					return fmt.Errorf("invalid %s color; use six-digit hex", channel)
				}
			}
		}
	}
	return nil
}

func validateMetricDefinitions(value any) error {
	rules, ok := value.([]any)
	if !ok || len(rules) == 0 {
		return fmt.Errorf("MetricDefinitionsJSON requires a nonempty array")
	}
	seen := map[string]bool{}
	for _, value := range rules {
		r, ok := value.(map[string]any)
		if !ok {
			return fmt.Errorf("invalid metric definition")
		}
		id := metricID(r)
		if !metricIdentifier.MatchString(id) || unsafeLossKey(id) || derivedMetric(id) || seen[id] {
			return fmt.Errorf("metric IDs must be safe, unique, and not calculated property names")
		}
		seen[id] = true
		for _, keys := range [][]string{{"and", "andFormula", "ANDFormula"}, {"or", "orFormula", "ORFormula"}, {"sand", "sandFormula", "SANDFormula"}} {
			if !metricOperation(getMetricField(r, keys...)) {
				return fmt.Errorf("%s has an invalid %s operation", id, keys[0])
			}
		}
		if _, modern := r["id"]; modern {
			if strings.TrimSpace(str2s(r["label"])) == "" {
				return fmt.Errorf("%s needs a label", id)
			}
			if _, ok := r["unit"].(string); !ok {
				return fmt.Errorf("%s needs a unit string", id)
			}
		}
		low, hasLow := number(r["min"])
		high, hasHigh := number(r["max"])
		if (r["min"] != nil && !hasLow) || (r["max"] != nil && !hasHigh) || (hasLow && hasHigh && low > high) {
			return fmt.Errorf("%s has an invalid domain", id)
		}
		def := getMetricField(r, "defaultValue", "leafDefault", "LeafDefault")
		if def != nil {
			n, ok := number(def)
			if !ok || (hasLow && n < low) || (hasHigh && n > high) || (probabilityMetric(id) && (n < 0 || n > 1)) {
				return fmt.Errorf("%s default is outside its domain", id)
			}
			if b, _ := r["boolean"].(bool); b && n != 0 && n != 1 {
				return fmt.Errorf("%s Boolean default must be zero or one", id)
			}
		}
		if threshold := getMetricField(r, "threshold", "acceptanceThreshold", "AcceptanceThreshold"); threshold != nil {
			if _, ok := number(threshold); !ok {
				return fmt.Errorf("invalid %s threshold", id)
			}
			direction := getMetricField(r, "thresholdDirection", "ThresholdDirection")
			if direction != "ABOVE" && direction != "BELOW" {
				return fmt.Errorf("invalid %s threshold direction", id)
			}
		}
	}
	return nil
}

// Input JSON remains shared Core engineering data. Values for metrics absent
// from a particular Loss configuration are retained, but that Loss ignores them.
func validateMetricInputs(value any) error {
	values, ok := value.(map[string]any)
	if !ok {
		return fmt.Errorf("MetricsJSON must be an object")
	}
	for key, v := range values {
		if !metricIdentifier.MatchString(key) || unsafeLossKey(key) || derivedMetric(key) {
			return fmt.Errorf("invalid leaf metric %s", key)
		}
		if v == nil {
			continue
		}
		if _, ok := v.(bool); ok {
			continue
		}
		n, ok := number(v)
		if !ok || (probabilityMetric(key) && (n < 0 || n > 1)) {
			return fmt.Errorf("%s must be a finite metric input within its domain", key)
		}
	}
	return nil
}

func validateAnalysisProfile(value any) error {
	p, ok := value.(map[string]any)
	if !ok {
		return fmt.Errorf("AnalysisProfileJSON must be an object")
	}
	if p["mode"] != "scenario" && p["mode"] != "scalar" {
		return fmt.Errorf("invalid analysis mode")
	}
	cap, ok := number(p["scenarioCap"])
	if !ok || cap < 1 || cap > 5000 || cap != math.Trunc(cap) {
		return fmt.Errorf("scenarioCap must be an integer from 1 to 5000")
	}
	for _, id := range []string{"encountersPerYear", "years", "riskThreshold", "targets", "adversaryPopulation", "recoveryHours", "attackThreads", "dutyCycle"} {
		if n, ok := number(p[id]); !ok || n < 0 {
			return fmt.Errorf("%s must be nonnegative", id)
		}
	}
	for _, id := range []string{"years", "riskThreshold", "targets"} {
		n, _ := number(p[id])
		if n <= 0 {
			return fmt.Errorf("%s must be positive", id)
		}
	}
	threads, _ := number(p["attackThreads"])
	duty, _ := number(p["dutyCycle"])
	if threads < 1 || duty > 1 {
		return fmt.Errorf("attackThreads must be at least one and dutyCycle at most one")
	}
	if p["encounterMode"] != "fixed" && p["encounterMode"] != "single-shot" && p["encounterMode"] != "recurring" {
		return fmt.Errorf("invalid encounter mode")
	}
	if _, ok := p["independentRandomEvents"].(bool); !ok {
		return fmt.Errorf("random-event independence must be explicit")
	}
	if strings.TrimSpace(str2s(p["actorName"])) == "" || strings.TrimSpace(str2s(p["victimName"])) == "" {
		return fmt.Errorf("actor and victim names required")
	}
	capabilities, ok := p["booleanCapabilities"].(map[string]any)
	if !ok {
		return fmt.Errorf("Boolean capabilities required")
	}
	for _, v := range capabilities {
		if _, ok := v.(bool); !ok {
			return fmt.Errorf("invalid Boolean capability")
		}
	}
	utilities, ok := p["utilities"].(map[string]any)
	if !ok {
		return fmt.Errorf("utility curves required")
	}
	for id, value := range utilities {
		curve, ok := value.([]any)
		if !ok || len(curve) < 2 {
			return fmt.Errorf("%s utility needs at least two points", id)
		}
		previous := math.Inf(-1)
		for _, value := range curve {
			point, ok := value.(map[string]any)
			if !ok {
				return fmt.Errorf("invalid utility point")
			}
			x, xok := number(point["value"])
			y, yok := number(point["utility"])
			if !xok || !yok || x <= previous || y < 0 {
				return fmt.Errorf("invalid utility curve %s", id)
			}
			previous = x
		}
	}
	for _, key := range []string{"benefitWeights", "painWeights", "detrimentWeights"} {
		weights, ok := p[key].(map[string]any)
		if !ok {
			return fmt.Errorf("%s required", key)
		}
		if key == "detrimentWeights" && len(weights) == 0 {
			continue
		}
		sum := 0.0
		for id, v := range weights {
			n, ok := number(v)
			if !ok || n < 0 || utilities[id] == nil {
				return fmt.Errorf("invalid %s entry %s", key, id)
			}
			sum += n
		}
		if math.Abs(sum-1) > 1e-9 {
			return fmt.Errorf("%s must sum to one", key)
		}
	}
	resources, ok := p["resourceMetrics"].([]any)
	if !ok || len(resources) == 0 {
		return fmt.Errorf("resource metrics required")
	}
	seen := map[string]bool{}
	for _, value := range resources {
		id, ok := value.(string)
		if !ok || seen[id] || utilities[id] == nil {
			return fmt.Errorf("resource metrics must be distinct with utility curves")
		}
		seen[id] = true
	}
	return nil
}

func castLossJSON(name string, value any) (any, error) {
	var raw string
	switch v := value.(type) {
	case string:
		raw = v
	default:
		return nil, fmt.Errorf("%s must be serialized JSON", name)
	}
	if len(raw) > 12_000_000 {
		return nil, fmt.Errorf("%s exceeds the 12 MB envelope. %s", name, lossDecompositionAdvice)
	}
	var parsed any
	if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
		return nil, fmt.Errorf("%s is invalid JSON: %w", name, err)
	}
	if parsed == nil {
		return raw, nil
	}
	var err error
	switch name {
	case "MetricDefinitionsJSON":
		err = validateMetricDefinitions(parsed)
	case "AnalysisProfileJSON":
		err = validateAnalysisProfile(parsed)
	case "MetricsJSON":
		err = validateMetricInputs(parsed)
	case "AttackTreeJSON":
		doc, ok := parsed.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("AttackTreeJSON must be an object")
		}
		err = validateLossView(doc["lossToolView"])
	}
	return raw, err
}

// Validate cross-references and metric domains against the selected Loss. A
// shared node may carry additional inputs used by a different Loss definition.
func validateLossAnalysis(props map[string]any, nodes []atNode, edges []atEdge) error {
	raw := str2s(props["MetricDefinitionsJSON"])
	if raw == "" || raw == "null" {
		return nil
	}
	var definitions []map[string]any
	if err := json.Unmarshal([]byte(raw), &definitions); err != nil {
		return fmt.Errorf("invalid stored metric definitions")
	}
	rules := map[string]map[string]any{}
	for _, r := range definitions {
		rules[metricID(r)] = r
	}
	if raw := str2s(props["AnalysisProfileJSON"]); raw != "" && raw != "null" {
		var p map[string]any
		if err := json.Unmarshal([]byte(raw), &p); err != nil {
			return err
		}
		if err := validateAnalysisProfile(p); err != nil {
			return err
		}
		if p["mode"] == "scenario" {
			for _, id := range []string{"AttackTime", "RandomEventProbability", "RandomEventDuration", "RandomEventFrequency", "BenefitASE", "EncounterASE", "VictimFinancialLoss"} {
				if rules[id] == nil {
					return fmt.Errorf("scenario analysis requires metric %s", id)
				}
			}
		}
		utilities, _ := p["utilities"].(map[string]any)
		pain, _ := p["painWeights"].(map[string]any)
		resources := map[string]bool{}
		for _, value := range p["resourceMetrics"].([]any) {
			resources[value.(string)] = true
		}
		ascending := map[string]bool{}
		for _, key := range []string{"benefitWeights", "painWeights", "detrimentWeights"} {
			for id := range p[key].(map[string]any) {
				ascending[id] = true
			}
		}
		for id, value := range utilities {
			if rules[id] == nil {
				return fmt.Errorf("utility references undefined metric %s", id)
			}
			prior := 0.0
			for i, value := range value.([]any) {
				point := value.(map[string]any)
				y, _ := number(point["utility"])
				if _, impact := pain[id]; !impact && y > 1 {
					return fmt.Errorf("non-impact utility %s exceeds one", id)
				}
				if i > 0 && ((resources[id] && y > prior) || (ascending[id] && y < prior)) {
					return fmt.Errorf("utility %s is not monotonic for its role", id)
				}
				prior = y
			}
		}
		for id := range p["booleanCapabilities"].(map[string]any) {
			if rules[id] == nil || rules[id]["boolean"] != true {
				return fmt.Errorf("Boolean capability %s lacks a Boolean metric", id)
			}
		}
	}
	parents := map[string]bool{}
	for _, e := range edges {
		parents[e.SourceHID] = true
	}
	for _, n := range nodes {
		if parents[n.HID] {
			continue
		}
		raw := str2s(n.Props["MetricsJSON"])
		if raw == "" || raw == "null" {
			continue
		}
		var inputs map[string]any
		if err := json.Unmarshal([]byte(raw), &inputs); err != nil {
			return fmt.Errorf("invalid metrics on %s", n.HID)
		}
		for id, value := range inputs {
			r, defined := rules[id]
			if !defined || value == nil {
				continue
			}
			if b, ok := value.(bool); ok {
				if r["boolean"] != true {
					return fmt.Errorf("%s %s is numeric, not Boolean", n.HID, id)
				}
				value = float64(0)
				if b {
					value = float64(1)
				}
			}
			v, ok := number(value)
			low, hasLow := number(r["min"])
			high, hasHigh := number(r["max"])
			if !ok || (hasLow && v < low) || (hasHigh && v > high) || (r["boolean"] == true && v != 0 && v != 1) || (probabilityMetric(id) && (v < 0 || v > 1)) {
				return fmt.Errorf("%s %s is outside its declared metric domain", n.HID, id)
			}
		}
	}
	return nil
}

import type {
  AnalysisProfile,
  AttackTree,
  Gate,
  MetricInputs,
  MetricOperation,
  MetricRule,
  UtilityPoint,
} from "./types";

export interface MetricScenario {
  id: string;
  leafIds: string[];
  values: Record<string, number | null>;
  complete: boolean;
}
export interface NodeMetricResult {
  values: Record<string, number | null>;
  scalarValues: Record<string, number | null>;
  scenarios: MetricScenario[];
  complete: boolean;
  selectedScenarioId: string | null;
  status: "complete" | "incomplete" | "blocked" | "invalid";
  warnings: string[];
  thresholds: Record<string, boolean | null>;
}
export interface MetricResult {
  byNode: Record<string, NodeMetricResult>;
  root: NodeMetricResult;
  complete: boolean;
  warnings: string[];
  scenarioCount: number;
}
const DERIVED = [
  "AttackFeasibility",
  "AttackDifficulty",
  "AttackerBenefit",
  "AttackerDetrimentValue",
  "AttackerNetBenefit",
  "PainFactor",
  "Propensity",
  "RelativeRisk",
  "EncounterRate",
  "EffectiveEncounters",
  "RateOfOccurrence",
  "ARO",
  "CumulativeRisk",
  "ALE",
  "TimeToRiskThreshold",
  "OpportunityFraction",
];
export const derivedMetricNames = DERIVED;
/** Stable roles used directly by the reference-analysis equations; labels remain editable. */
export const scenarioDependencyIds = [
  "AttackTime",
  "RandomEventProbability",
  "RandomEventDuration",
  "RandomEventFrequency",
  "BenefitASE",
  "EncounterASE",
  "VictimFinancialLoss",
] as const;
const OPS: MetricOperation[] = ["SUM", "PRODUCT", "MIN", "MAX"];
const unsafeKeys = new Set([
  ...Object.getOwnPropertyNames(Object.prototype),
  "prototype",
]);
const finite = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);
const product = (a: number[]) => a.reduce((x, y) => x * y, 1);

function rule(
  id: string,
  label: string,
  unit: string,
  and: MetricOperation,
  or: MetricOperation,
  sand: MetricOperation,
  defaultValue: number | null,
  min = 0,
  max?: number,
  boolean = false,
): MetricRule {
  return {
    id,
    label,
    unit,
    and,
    or,
    sand,
    defaultValue,
    min,
    ...(max === undefined ? {} : { max }),
    ...(boolean ? { boolean: true } : {}),
  };
}
const DEFAULT_RULES: MetricRule[] = [
  rule("AttackCost", "Attack cost", "USD", "SUM", "MIN", "SUM", null),
  rule(
    "TechnicalAbility",
    "Technical ability",
    "rating 0–100",
    "MAX",
    "MIN",
    "MAX",
    null,
    0,
    100,
  ),
  rule("AttackTime", "Attack time", "hours", "MAX", "MIN", "SUM", null),
  {
    ...rule(
      "Noticeability",
      "Noticeability",
      "rating 0–1",
      "MAX",
      "MIN",
      "MAX",
      null,
      0,
      1,
    ),
    description:
      "MAX is a prototype rating convention; this is not an independent-event detection probability.",
  },
  rule(
    "PhysicalPresenceRequired",
    "Physical presence required",
    "boolean",
    "MAX",
    "MIN",
    "MAX",
    0,
    0,
    1,
    true,
  ),
  rule(
    "BreachOfTrustRequired",
    "Breach of trust required",
    "boolean",
    "MAX",
    "MIN",
    "MAX",
    0,
    0,
    1,
    true,
  ),
  rule(
    "AttackerMoneyGain",
    "Attacker monetary gain",
    "USD",
    "SUM",
    "MAX",
    "SUM",
    null,
  ),
  rule(
    "AttackerDestructionGain",
    "Destruction benefit",
    "rating 0–10",
    "MAX",
    "MAX",
    "MAX",
    0,
    0,
    10,
  ),
  rule(
    "AttackerDetriment",
    "Attacker detriment",
    "rating 0–1",
    "MAX",
    "MIN",
    "MAX",
    0,
    0,
    1,
  ),
  rule(
    "VictimFinancialLoss",
    "Victim financial loss",
    "USD",
    "SUM",
    "MAX",
    "SUM",
    null,
  ),
  rule(
    "VictimSafetyImpact",
    "Victim safety impact",
    "rating",
    "MAX",
    "MAX",
    "MAX",
    0,
  ),
  rule(
    "VictimMissionImpact",
    "Victim mission impact",
    "rating",
    "MAX",
    "MAX",
    "MAX",
    0,
  ),
  rule(
    "RandomEventProbability",
    "Random-event prerequisite probability",
    "probability",
    "PRODUCT",
    "MAX",
    "PRODUCT",
    1,
    0,
    1,
  ),
  rule(
    "RandomEventDuration",
    "Random-event duration",
    "hours",
    "MIN",
    "MAX",
    "MIN",
    0,
  ),
  rule(
    "RandomEventFrequency",
    "Random-event frequency",
    "events/year",
    "MIN",
    "MAX",
    "MIN",
    0,
  ),
  rule(
    "BenefitASE",
    "Benefit-based attack success efficiency",
    "probability",
    "PRODUCT",
    "MAX",
    "PRODUCT",
    1,
    0,
    1,
  ),
  rule(
    "EncounterASE",
    "Encounter-based attack success efficiency",
    "probability",
    "PRODUCT",
    "MAX",
    "PRODUCT",
    1,
    0,
    1,
  ),
  {
    ...rule(
      "AttackProbability",
      "SSTPA attack probability",
      "probability",
      "PRODUCT",
      "MAX",
      "PRODUCT",
      1,
      0,
      1,
    ),
    description:
      "PRODUCT assumes conditionally independent step successes; OR MAX is an attacker-choice bound, not a union probability.",
  },
];
const DEFAULT_PROFILE: AnalysisProfile = {
  mode: "scenario",
  scenarioCap: 256,
  actorName: "Illustrative capable adversary",
  victimName: "FireSat mission operator",
  utilities: {
    AttackCost: [
      { value: 0, utility: 1 },
      { value: 100000, utility: 0 },
    ],
    TechnicalAbility: [
      { value: 0, utility: 1 },
      { value: 100, utility: 0 },
    ],
    Noticeability: [
      { value: 0, utility: 1 },
      { value: 1, utility: 0 },
    ],
    AttackerMoneyGain: [
      { value: 0, utility: 0 },
      { value: 1000000, utility: 1 },
    ],
    AttackerDestructionGain: [
      { value: 0, utility: 0 },
      { value: 10, utility: 1 },
    ],
    AttackerDetriment: [
      { value: 0, utility: 0 },
      { value: 1, utility: 1 },
    ],
    VictimFinancialLoss: [
      { value: 0, utility: 0 },
      { value: 10000000, utility: 1 },
    ],
    VictimSafetyImpact: [
      { value: 0, utility: 0 },
      { value: 1, utility: 1 },
    ],
    VictimMissionImpact: [
      { value: 0, utility: 0 },
      { value: 1, utility: 1 },
    ],
  },
  resourceMetrics: ["AttackCost", "TechnicalAbility", "Noticeability"],
  benefitWeights: { AttackerMoneyGain: 0.8, AttackerDestructionGain: 0.2 },
  detrimentWeights: { AttackerDetriment: 1 },
  painWeights: {
    VictimFinancialLoss: 0.6,
    VictimSafetyImpact: 0.1,
    VictimMissionImpact: 0.3,
  },
  booleanCapabilities: {
    PhysicalPresenceRequired: true,
    BreachOfTrustRequired: false,
  },
  encountersPerYear: 10,
  years: 1,
  riskThreshold: 1,
  targets: 1,
  adversaryPopulation: 10,
  recoveryHours: 24,
  attackThreads: 1,
  dutyCycle: 0.25,
  encounterMode: "fixed",
  independentRandomEvents: false,
};

export function defaultMetricRules(): MetricRule[] {
  return structuredClone(DEFAULT_RULES);
}
export function defaultAnalysisProfile(): AnalysisProfile {
  return structuredClone(DEFAULT_PROFILE);
}

export function validateMetricConfiguration(
  rules: MetricRule[],
  profile: AnalysisProfile,
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(rules) || !rules.length)
    return ["At least one metric definition is required."];
  const names = new Set<string>();
  for (const r of rules) {
    if (
      !r ||
      typeof r.id !== "string" ||
      !/^[A-Za-z][A-Za-z0-9_]*$/.test(r.id) ||
      unsafeKeys.has(r.id)
    ) {
      errors.push("Metric IDs must be safe alphanumeric identifiers.");
      continue;
    }
    if (names.has(r.id)) errors.push(`Duplicate metric ${r.id}.`);
    names.add(r.id);
    if (DERIVED.includes(r.id))
      errors.push(`${r.id} is reserved for a calculated property.`);
    if (
      typeof r.label !== "string" ||
      !r.label.trim() ||
      typeof r.unit !== "string"
    )
      errors.push(`${r.id}: label and unit are required.`);
    for (const gate of ["and", "or", "sand"] as const)
      if (!OPS.includes(r[gate]))
        errors.push(`${r.id}: unknown ${gate} operation.`);
    if (r.defaultValue !== null && !finite(r.defaultValue))
      errors.push(`${r.id}: default must be a finite number or null.`);
    if (
      (r.min !== undefined && !finite(r.min)) ||
      (r.max !== undefined && !finite(r.max))
    )
      errors.push(`${r.id}: invalid domain.`);
    if (r.min !== undefined && r.max !== undefined && r.min > r.max)
      errors.push(`${r.id}: minimum exceeds maximum.`);
    if (
      [
        "RandomEventProbability",
        "BenefitASE",
        "EncounterASE",
        "AttackProbability",
      ].includes(r.id) &&
      r.defaultValue !== null &&
      finite(r.defaultValue) &&
      (r.defaultValue < 0 || r.defaultValue > 1)
    )
      errors.push(`${r.id}: probability default must be in [0,1].`);
    if (
      r.defaultValue !== null &&
      finite(r.defaultValue) &&
      ((r.min !== undefined && r.defaultValue < r.min) ||
        (r.max !== undefined && r.defaultValue > r.max))
    )
      errors.push(`${r.id}: default outside domain.`);
    if (
      r.boolean &&
      r.defaultValue !== null &&
      r.defaultValue !== 0 &&
      r.defaultValue !== 1
    )
      errors.push(`${r.id}: Boolean default must be 0 or 1.`);
    if (
      r.threshold !== undefined &&
      (!finite(r.threshold) ||
        !["ABOVE", "BELOW"].includes(r.thresholdDirection ?? ""))
    )
      errors.push(
        `${r.id}: threshold needs a finite value and ABOVE/BELOW direction.`,
      );
  }
  if (!profile || typeof profile !== "object")
    return [...errors, "Analysis profile is required."];
  if (!["scenario", "scalar"].includes(profile.mode))
    errors.push("Unknown metric analysis mode.");
  if (profile.mode === "scenario")
    for (const id of scenarioDependencyIds)
      if (!names.has(id))
        errors.push(
          `Scenario analysis requires built-in metric ID ${id}; change its label instead of deleting or renaming its ID.`,
        );
  if (
    !Number.isInteger(profile.scenarioCap) ||
    profile.scenarioCap < 1 ||
    profile.scenarioCap > 5000
  )
    errors.push("Scenario cap must be an integer from 1 to 5000.");
  if (!profile.utilities || typeof profile.utilities !== "object")
    errors.push("Utility curves are required.");
  else
    for (const [id, curve] of Object.entries(profile.utilities)) {
      if (!names.has(id))
        errors.push(`Utility references undefined metric ${id}.`);
      if (!Array.isArray(curve) || curve.length < 2) {
        errors.push(`${id}: utility needs at least two points.`);
        continue;
      }
      curve.forEach((p, i) => {
        if (
          !p ||
          !finite(p.value) ||
          !finite(p.utility) ||
          p.utility < 0 ||
          (i > 0 && p.value <= curve[i - 1]?.value)
        )
          errors.push(
            `${id}: utility points must have finite increasing inputs and nonnegative outputs.`,
          );
        if (!Object.hasOwn(profile.painWeights ?? {}, id) && p?.utility > 1)
          errors.push(`${id}: non-impact utility exceeds 1.`);
      });
    }
  for (const id of Array.isArray(profile.resourceMetrics)
    ? profile.resourceMetrics
    : []) {
    const curve = profile.utilities?.[id];
    if (
      Array.isArray(curve) &&
      curve.some((point, i) => i > 0 && point?.utility > curve[i - 1]?.utility)
    )
      errors.push(`${id}: resource utility must be monotone nonincreasing.`);
  }
  for (const id of [
    ...Object.keys(profile.benefitWeights ?? {}),
    ...Object.keys(profile.detrimentWeights ?? {}),
    ...Object.keys(profile.painWeights ?? {}),
  ]) {
    const curve = profile.utilities?.[id];
    if (
      Array.isArray(curve) &&
      curve.some((point, i) => i > 0 && point?.utility < curve[i - 1]?.utility)
    )
      errors.push(
        `${id}: benefit/detriment/impact utility must be monotone nondecreasing.`,
      );
  }
  const weights = (
    values: Record<string, number>,
    label: string,
    allowEmpty = false,
  ) => {
    if (!values || typeof values !== "object") {
      errors.push(`${label} weights required.`);
      return;
    }
    const entries = Object.entries(values);
    if (!entries.length && allowEmpty) return;
    if (
      !entries.length ||
      entries.some(([, w]) => !finite(w) || w < 0) ||
      Math.abs(entries.reduce((s, [, w]) => s + w, 0) - 1) > 1e-9
    )
      errors.push(`${label} weights must be nonnegative and sum to 1.`);
    for (const [id] of entries)
      if (!names.has(id) || !profile.utilities?.[id])
        errors.push(
          `${label} references metric ${id} without a definition and utility.`,
        );
  };
  weights(profile.benefitWeights, "Benefit");
  weights(profile.painWeights, "Victim impact");
  weights(profile.detrimentWeights, "Detriment", true);
  if (
    !Array.isArray(profile.resourceMetrics) ||
    !profile.resourceMetrics.length ||
    new Set(profile.resourceMetrics).size !== profile.resourceMetrics.length
  )
    errors.push("Distinct resource metrics are required.");
  else
    for (const id of profile.resourceMetrics)
      if (!names.has(id) || !profile.utilities?.[id])
        errors.push(`Resource ${id} needs a definition and utility.`);
  if (
    !profile.booleanCapabilities ||
    typeof profile.booleanCapabilities !== "object"
  )
    errors.push("Boolean capability mapping is required.");
  else
    for (const [id, value] of Object.entries(profile.booleanCapabilities))
      if (
        typeof value !== "boolean" ||
        !rules.some((r) => r.id === id && r.boolean)
      )
        errors.push(`Boolean capability ${id} is invalid.`);
  for (const id of [
    "encountersPerYear",
    "years",
    "riskThreshold",
    "targets",
    "adversaryPopulation",
    "recoveryHours",
    "attackThreads",
    "dutyCycle",
  ] as const)
    if (!finite(profile[id]) || profile[id] < 0)
      errors.push(`${id} must be finite and nonnegative.`);
  if (
    profile.targets <= 0 ||
    profile.attackThreads < 1 ||
    profile.dutyCycle > 1 ||
    profile.riskThreshold <= 0 ||
    profile.years <= 0
  )
    errors.push(
      "Targets/horizon/threshold must be positive; threads >=1; duty cycle <=1.",
    );
  if (!["fixed", "single-shot", "recurring"].includes(profile.encounterMode))
    errors.push("Invalid encounter model.");
  if (typeof profile.independentRandomEvents !== "boolean")
    errors.push("Random-event independence must be explicit.");
  if (
    typeof profile.actorName !== "string" ||
    !profile.actorName.trim() ||
    typeof profile.victimName !== "string" ||
    !profile.victimName.trim()
  )
    errors.push("Actor and victim names are required.");
  return errors;
}

/** Endpoint clamping and piecewise-linear interpolation; validated curves only. */
export function utility(value: number, points: UtilityPoint[]): number {
  if (value <= points[0].value) return points[0].utility;
  for (let i = 1; i < points.length; i++)
    if (value <= points[i].value) {
      const a = points[i - 1],
        b = points[i];
      return (
        a.utility +
        ((b.utility - a.utility) * (value - a.value)) / (b.value - a.value)
      );
    }
  return points[points.length - 1].utility;
}
export function probabilityUnion(probabilities: number[]): number {
  if (probabilities.some((p) => !finite(p) || p < 0 || p > 1))
    throw new Error("Probability outside [0,1].");
  return 1 - product(probabilities.map((p) => 1 - p));
}
function aggregate(
  values: (number | null)[],
  op: MetricOperation,
): number | null {
  if (!values.length || values.some((v) => v === null)) return null;
  const numbers = values as number[];
  const value =
    op === "SUM"
      ? numbers.reduce((a, b) => a + b, 0)
      : op === "PRODUCT"
        ? product(numbers)
        : op === "MIN"
          ? Math.min(...numbers)
          : Math.max(...numbers);
  return Number.isFinite(value) ? value : null;
}

/** Derive paper metrics from one coherent scenario. Config and raw inputs must already be validated. */
export function deriveScenario(
  raw: Record<string, number | null>,
  p: AnalysisProfile,
): Record<string, number | null> {
  const out: Record<string, number | null> = { ...raw };
  const get = (id: string, fallback: number | null = null) =>
    Object.hasOwn(raw, id) ? raw[id] : fallback;
  const meanInputs = p.resourceMetrics.map((id) =>
    get(id) === null ? null : utility(get(id)!, p.utilities[id]),
  );
  for (const id of p.resourceMetrics)
    out[`Utility_${id}`] =
      get(id) === null ? null : utility(get(id)!, p.utilities[id]);
  let feasibility = meanInputs.some((n) => n === null)
    ? null
    : Math.pow(product(meanInputs as number[]), 1 / meanInputs.length);
  for (const [id, has] of Object.entries(p.booleanCapabilities))
    if (get(id) !== null && get(id) !== 0 && !has) feasibility = 0;
  const weighted = (
    weights: Record<string, number>,
    factor: number | null = 1,
  ): number | null => {
    const terms = Object.entries(weights)
      .filter(([, weight]) => weight > 0)
      .map(([id, weight]) => {
        const input = get(id);
        return input === null || factor === null
          ? null
          : weight * utility(input * factor, p.utilities[id]);
      });
    return terms.some((v) => v === null)
      ? null
      : (terms as number[]).reduce((a, b) => a + b, 0);
  };
  const benefit = weighted(p.benefitWeights, get("BenefitASE", 1));
  const detriment = weighted(p.detrimentWeights);
  const net =
    benefit === null || detriment === null
      ? null
      : Math.max(0, benefit - detriment);
  const pain = weighted(p.painWeights);
  const prop = feasibility === null || net === null ? null : feasibility * net;
  let rate: number | null = p.encountersPerYear;
  if (p.encounterMode === "single-shot")
    rate = p.adversaryPopulation / p.targets / p.years;
  if (p.encounterMode === "recurring") {
    const time = get("AttackTime");
    rate =
      time === null || time + p.recoveryHours <= 0
        ? null
        : ((p.adversaryPopulation * p.attackThreads * p.dutyCycle) /
            ((time + p.recoveryHours) * p.targets)) *
          8760;
  }
  const eventP = get("RandomEventProbability", 1),
    duration = get("RandomEventDuration", 0),
    frequency = get("RandomEventFrequency", 0);
  // A duration/frequency pair defines the opportunity instead of applying the same event probability twice.
  const window =
    duration === null || frequency === null
      ? null
      : duration > 0 && frequency > 0
        ? Math.min(1, (duration * frequency) / 8760)
        : eventP;
  const encounterASE = get("EncounterASE", 1);
  const effective =
    rate === null || encounterASE === null || window === null
      ? null
      : rate * encounterASE * window;
  const aro = prop === null || effective === null ? null : prop * effective;
  const relative = prop === null || pain === null ? null : prop * pain;
  const risk = aro === null || pain === null ? null : aro * p.years * pain;
  Object.assign(out, {
    AttackFeasibility: feasibility,
    AttackDifficulty:
      feasibility === null || feasibility === 0 ? null : 1 / feasibility,
    AttackerBenefit: benefit,
    AttackerDetrimentValue: detriment,
    AttackerNetBenefit: net,
    PainFactor: pain,
    Propensity: prop,
    RelativeRisk: relative,
    EncounterRate: rate,
    EffectiveEncounters: effective,
    RateOfOccurrence: aro,
    ARO: aro,
    CumulativeRisk: risk,
    ALE:
      aro === null || get("VictimFinancialLoss") === null
        ? null
        : aro * get("VictimFinancialLoss")!,
    TimeToRiskThreshold:
      aro === null || pain === null || aro * pain <= 0
        ? null
        : p.riskThreshold / (aro * pain),
    OpportunityFraction: window,
  });
  for (const id of Object.keys(p.painWeights))
    out[`ALE_${id}`] = aro === null || get(id) === null ? null : aro * get(id)!;
  for (const [id, val] of Object.entries(out))
    if (val !== null && !Number.isFinite(val)) out[id] = null;
  return out;
}

/** Pure stochastic assessment: probability per declared exposure, not adversary desirability. */
function deriveStochastic(
  raw: Record<string, number | null>,
  p: AnalysisProfile,
): Record<string, number | null> {
  const values = deriveScenario(raw, p),
    probability = raw.RandomEventProbability ?? null;
  values.Propensity = probability;
  values.AttackFeasibility = null;
  values.AttackDifficulty = null;
  values.RelativeRisk =
    probability === null || values.PainFactor === null
      ? null
      : probability * values.PainFactor;
  values.EncounterRate = p.encountersPerYear;
  values.EffectiveEncounters = p.encountersPerYear;
  values.OpportunityFraction = 1;
  values.ARO = probability === null ? null : probability * p.encountersPerYear;
  values.RateOfOccurrence = values.ARO;
  values.CumulativeRisk =
    values.ARO === null || values.PainFactor === null
      ? null
      : values.ARO * p.years * values.PainFactor;
  values.ALE =
    values.ARO === null || raw.VictimFinancialLoss === null
      ? null
      : values.ARO * raw.VictimFinancialLoss;
  for (const metric of Object.keys(p.painWeights))
    values[`ALE_${metric}`] =
      values.ARO === null || raw[metric] === null
        ? null
        : values.ARO * raw[metric];
  values.TimeToRiskThreshold =
    values.ARO === null ||
    values.PainFactor === null ||
    values.ARO * values.PainFactor <= 0
      ? null
      : p.riskThreshold / (values.ARO * values.PainFactor);
  for (const [id, value] of Object.entries(values))
    if (value !== null && !Number.isFinite(value)) values[id] = null;
  return values;
}

export function validateLeafMetrics(
  inputs: MetricInputs,
  rules: MetricRule[],
): string[] {
  const errors: string[] = [];
  for (const [id, input] of Object.entries(inputs)) {
    const r = rules.find((rule) => rule.id === id);
    if (!r) {
      errors.push(`Undefined metric ${id}.`);
      continue;
    }
    if (input === null) continue;
    if (typeof input === "boolean" && !r.boolean) {
      errors.push(`${id} is numeric, not Boolean.`);
      continue;
    }
    const value = typeof input === "boolean" ? Number(input) : input;
    if (
      !finite(value) ||
      (r.min !== undefined && value < r.min) ||
      (r.max !== undefined && value > r.max) ||
      (r.boolean && value !== 0 && value !== 1)
    )
      errors.push(`${id} is outside its declared domain.`);
    if (
      (id === "RandomEventProbability" ||
        id === "BenefitASE" ||
        id === "EncounterASE" ||
        id === "AttackProbability") &&
      (value < 0 || value > 1)
    )
      errors.push(`${id} must be in [0,1].`);
  }
  return errors;
}

export function evaluateMetrics(tree: AttackTree): MetricResult {
  const rules = tree.root.MetricDefinitionsJSON,
    p = tree.root.AnalysisProfileJSON;
  const issues = validateMetricConfiguration(rules, p),
    byNode: Record<string, NodeMetricResult> = Object.create(null);
  const emptyValues = () =>
    Object.fromEntries(
      [
        ...(Array.isArray(rules)
          ? rules.filter((r) => r && typeof r.id === "string").map((r) => r.id)
          : []),
        ...DERIVED,
      ].map((k) => [k, null]),
    );
  const empty = (
    warnings: string[],
    status: NodeMetricResult["status"] = "invalid",
  ): NodeMetricResult => ({
    values: emptyValues(),
    scalarValues: emptyValues(),
    scenarios: [],
    complete: status === "blocked",
    selectedScenarioId: null,
    status,
    warnings,
    thresholds: {},
  });
  if (issues.length) {
    const root = empty(issues);
    return {
      byNode: { [tree.rootId]: root },
      root,
      complete: false,
      warnings: issues,
      scenarioCount: 0,
    };
  }
  const nodes = new Map(tree.nodes.map((n) => [n.id, n]));
  const children = new Map<string, typeof tree.edges>();
  for (const edge of tree.edges) {
    const group = children.get(edge.source) ?? [];
    group.push(edge);
    children.set(edge.source, group);
  }
  const visiting = new Set<string>();
  let combinations = 0;
  const allWarnings = new Set<string>();
  const visit = (id: string): NodeMetricResult => {
    if (byNode[id]) return byNode[id];
    if (visiting.has(id))
      return empty([`Cycle at ${id}; metrics not evaluated.`]);
    const node = nodes.get(id);
    if (!node) return empty([`Missing node ${id}.`]);
    visiting.add(id);
    const original = (children.get(id) ?? []).filter(
        (e) =>
          !(id === tree.rootId && nodes.get(e.target)?.type === "Environment"),
      ),
      active = original.filter((e) => !e.tailoredOut),
      warnings: string[] = [];
    let scenarios: MetricScenario[] = [],
      complete = true,
      scalar: Record<string, number | null> = {};
    if (!original.length) {
      if (!["Attack", "Asset"].includes(node.type)) {
        visiting.delete(id);
        return (byNode[id] = empty(
          [
            `${node.hid}: structural branch has no terminal Attack or derived Asset; analysis incomplete.`,
          ],
          "incomplete",
        ));
      }
      const invalid = validateLeafMetrics(node.metrics, rules);
      if (invalid.length) {
        visiting.delete(id);
        return (byNode[id] = empty(invalid.map((e) => `${node.hid}: ${e}`)));
      }
      const raw: Record<string, number | null> = {};
      for (const r of rules) {
        const value = node.metrics[r.id];
        raw[r.id] = value == null ? r.defaultValue : Number(value);
        if (value == null) {
          if (r.defaultValue === null)
            warnings.push(`${node.hid}: missing ${r.id}.`);
          else
            warnings.push(
              `${node.hid}: ${r.id} uses declared default ${r.defaultValue}.`,
            );
        }
      }
      const values =
        node.eventKind === "stochastic"
          ? deriveStochastic(raw, p)
          : deriveScenario(raw, p);
      complete =
        node.eventKind === "stochastic"
          ? raw.RandomEventProbability !== null &&
            Object.entries(p.painWeights)
              .filter(([, w]) => w > 0)
              .every(([id]) => raw[id] !== null)
          : Object.values(raw).every((v) => v !== null);
      scenarios = [{ id: `scenario:${id}`, leafIds: [id], values, complete }];
      scalar = raw;
    } else if (!active.length) {
      complete = false;
      warnings.push(
        `${node.hid}: all subordinate branches are tailored out; no analyzed success model remains. Tailoring is not a complete block.`,
      );
    } else {
      if (Object.values(node.metrics).some((v) => v !== null))
        warnings.push(
          `${node.hid}: parent metric inputs ignored; values are calculated from leaves.`,
        );
      const gates = new Set(active.map((e) => e.gate));
      if (gates.size !== 1) {
        visiting.delete(id);
        return (byNode[id] = empty([
          `${node.hid}: mixed sibling gates need explicit grouping nodes.`,
        ]));
      }
      const gate: Gate = active[0].gate;
      const sorted = [...active].sort(
        (a, b) =>
          (a.sequence ?? 0) - (b.sequence ?? 0) || a.id.localeCompare(b.id),
      );
      const childResults = sorted.map((edge) =>
        edge.completeBlock
          ? empty(
              [`${edge.id}: complete block excludes this scenario.`],
              "blocked",
            )
          : visit(edge.target),
      );
      complete = childResults.every((result) => result.complete);
      for (const result of childResults) warnings.push(...result.warnings);
      for (const r of rules) {
        const values = childResults
          .filter((v) => v.status !== "blocked")
          .map((c) => c.scalarValues[r.id] ?? null);
        scalar[r.id] =
          gate !== "OR" && childResults.some((c) => c.status === "blocked")
            ? null
            : aggregate(values, r[gate.toLowerCase() as "and" | "or" | "sand"]);
      }
      if (node.eventKind === "stochastic") {
        if (!p.independentRandomEvents) {
          complete = false;
          warnings.push(
            "Stochastic probability aggregation requires explicit independent-event assumptions.",
          );
        }
        const vectors = childResults.map(
          (result) => result.scenarios[0]?.values ?? {},
        );
        const raw: Record<string, number | null> = {};
        for (const r of rules)
          raw[r.id] = aggregate(
            vectors.map((v) => v[r.id] ?? null),
            r[gate.toLowerCase() as "and" | "or" | "sand"],
          );
        const probabilities = vectors.map(
          (v) => v.RandomEventProbability ?? null,
        );
        raw.RandomEventProbability = probabilities.some((v) => v === null)
          ? null
          : gate === "OR"
            ? probabilityUnion(probabilities as number[])
            : product(probabilities as number[]);
        if (
          gate === "OR" &&
          Object.keys(p.painWeights).some(
            (metric) => new Set(vectors.map((v) => v[metric])).size > 1,
          )
        ) {
          complete = false;
          warnings.push(
            "Stochastic OR children have different impacts; a first-event/dependence model is required before combined risk can be asserted.",
          );
        }
        if (childResults.some((c) => c.scenarios.length !== 1)) {
          complete = false;
          warnings.push(
            "Stochastic subtree with hostile alternatives needs a separate mixed-event model.",
          );
        }
        const leafIds = childResults.flatMap(
          (c) => c.scenarios[0]?.leafIds ?? [],
        );
        if (new Set(leafIds).size !== leafIds.length) {
          complete = false;
          warnings.push("Shared stochastic event invalidates independence.");
        }
        const values = deriveStochastic(raw, p);
        warnings.push(
          "Stochastic risk uses fixed yearly exposure count; hostile resource/benefit fields do not determine stochastic event propensity.",
        );
        scalar = raw;
        scenarios = [{ id: `stochastic:${id}`, leafIds, values, complete }];
      } else if (gate === "OR") {
        for (const result of childResults)
          for (const scenario of result.scenarios) {
            if (scenarios.length < p.scenarioCap) scenarios.push(scenario);
            else {
              complete = false;
              warnings.push(
                `Scenario budget ${p.scenarioCap} exceeded at ${node.hid}; analysis incomplete.`,
              );
              break;
            }
          }
      } else if (childResults.every((r) => r.scenarios.length)) {
        let partial: {
          leafIds: string[];
          raw: Record<string, number | null>;
          vectors: Record<string, number | null>[];
          complete: boolean;
        }[] = [{ leafIds: [], raw: {}, vectors: [], complete: true }];
        for (const result of childResults) {
          const next: typeof partial = [];
          outer: for (const prior of partial)
            for (const child of result.scenarios) {
              if (next.length >= p.scenarioCap || combinations++ > 100000) {
                complete = false;
                warnings.push(
                  `Scenario budget exceeded at ${node.hid}; analysis incomplete.`,
                );
                break outer;
              }
              const duplicate = child.leafIds.some((leaf) =>
                prior.leafIds.includes(leaf),
              );
              if (duplicate) {
                complete = false;
                warnings.push(
                  `Shared leaf correlation at ${node.hid}; split independent occurrences or decompose the analysis.`,
                );
              }
              const vectors = [...prior.vectors, child.values],
                raw: Record<string, number | null> = {};
              for (const r of rules)
                raw[r.id] = aggregate(
                  vectors.map((v) => v[r.id]),
                  r[gate.toLowerCase() as "and" | "sand"],
                );
              const finiteRaw = Object.values(raw).every((v) => v !== null);
              if (!finiteRaw) {
                complete = false;
                warnings.push(`Missing or nonfinite aggregate at ${node.hid}.`);
              }
              next.push({
                leafIds: [...new Set([...prior.leafIds, ...child.leafIds])],
                raw,
                vectors,
                complete:
                  prior.complete && child.complete && !duplicate && finiteRaw,
              });
            }
          partial = next;
        }
        scenarios = partial.map((part) => ({
          id: `scenario:${part.leafIds.join("+")}`,
          leafIds: part.leafIds,
          values: deriveScenario(part.raw, p),
          complete: part.complete,
        }));
      }
    }
    visiting.delete(id);
    for (const scenario of scenarios) {
      if (
        p.encounterMode === "recurring" &&
        (scenario.values.AttackTime === null ||
          scenario.values.AttackTime + p.recoveryHours <= 0)
      ) {
        scenario.complete = false;
        warnings.push(
          "Recurring encounters require positive attack plus recovery time.",
        );
      }
      if (
        scenario.values.AttackFeasibility !== null &&
        scenario.values.AttackerNetBenefit !== null &&
        scenario.values.PainFactor !== null &&
        (scenario.values.EncounterRate === null ||
          scenario.values.ARO === null ||
          scenario.values.CumulativeRisk === null ||
          (scenario.values.VictimFinancialLoss != null &&
            scenario.values.ALE === null))
      ) {
        scenario.complete = false;
        warnings.push(
          "Nonfinite or incomplete derived metrics; result withheld.",
        );
      }
    }
    const missing = scenarios.some((s) => !s.complete);
    complete = complete && !missing;
    const selected =
      scenarios
        .filter((s) => s.values.RelativeRisk !== null)
        .reduce<MetricScenario | null>(
          (best, s) =>
            !best || s.values.RelativeRisk! > best.values.RelativeRisk!
              ? s
              : best,
          null,
        ) ??
      scenarios[0] ??
      null;
    let values = selected ? { ...selected.values } : emptyValues();
    const status: NodeMetricResult["status"] = !complete
      ? "incomplete"
      : !scenarios.length
        ? "blocked"
        : "complete";
    if (!complete) {
      values = emptyValues();
      warnings.push(
        `${node.hid}: complete metrics withheld because inputs or analysis are incomplete.`,
      );
    } else if (status === "blocked") {
      for (const id of [
        "AttackProbability",
        "RandomEventProbability",
        "AttackFeasibility",
        "Propensity",
        "RelativeRisk",
        "RateOfOccurrence",
        "ARO",
        "CumulativeRisk",
        "ALE",
      ])
        values[id] = 0;
    } else if (p.mode === "scalar") {
      values = { ...emptyValues(), ...scalar };
      warnings.push(
        "Scalar mode shows separate metric bounds; coherent scenario-derived risk is available in scenario mode.",
      );
    }
    if (scenarios.some((s) => s.values.AttackFeasibility === 0))
      warnings.push(
        "Zero feasibility: attack difficulty is unbounded (shown as —).",
      );
    if (scenarios.some((s) => s.values.ARO === 0 || s.values.PainFactor === 0))
      warnings.push(
        "Zero risk accumulation: time to a positive risk threshold is unbounded (shown as —).",
      );
    const thresholds: Record<string, boolean | null> = {};
    for (const r of rules)
      if (r.threshold !== undefined) {
        const v = values[r.id];
        thresholds[r.id] =
          v == null
            ? null
            : r.thresholdDirection === "ABOVE"
              ? v > r.threshold
              : v < r.threshold;
      }
    const result: NodeMetricResult = {
      values,
      scalarValues: scalar,
      scenarios,
      complete,
      selectedScenarioId: complete ? (selected?.id ?? null) : null,
      status,
      warnings: [...new Set(warnings)],
      thresholds,
    };
    byNode[id] = result;
    for (const warning of result.warnings) allWarnings.add(warning);
    return result;
  };
  const root = visit(tree.rootId);
  return {
    byNode,
    root,
    complete: root.complete,
    warnings: [
      ...allWarnings,
      ...root.warnings.filter((w) => !allWarnings.has(w)),
    ],
    scenarioCount: root.scenarios.length,
  };
}

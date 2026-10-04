import { describe, expect, it } from "vitest";
import {
  defaultMetricRules,
  defaultAnalysisProfile,
  deriveScenario,
  evaluateMetrics,
  probabilityUnion,
  utility,
  validateLeafMetrics,
  validateMetricConfiguration,
} from "../../src/tools/loss/domain/metrics";
import {
  NODE_TYPES,
  type AnalysisProfile,
  type AttackTree,
  type Gate,
  type MetricInputs,
  type TreeNode,
  type TreeEdge,
} from "../../src/tools/loss/domain/types";

const raw = (
  override: Record<string, number | null> = {},
): Record<string, number | null> => ({
  ...Object.fromEntries(
    defaultMetricRules().map((r) => [r.id, r.defaultValue ?? 0]),
  ),
  AttackCost: 25,
  TechnicalAbility: 10,
  AttackTime: 2,
  Noticeability: 0.3,
  AttackerMoneyGain: 15000,
  VictimFinancialLoss: 15250,
  ...override,
});
const profile = (): AnalysisProfile => ({
  ...defaultAnalysisProfile(),
  utilities: {
    ...defaultAnalysisProfile().utilities,
    AttackCost: [
      { value: 0, utility: 1 },
      { value: 25, utility: 0.9 },
      { value: 30, utility: 0.79 },
      { value: 100, utility: 0 },
    ],
    TechnicalAbility: [
      { value: 0, utility: 1 },
      { value: 10, utility: 0.9 },
      { value: 100, utility: 0 },
    ],
    Noticeability: [
      { value: 0, utility: 1 },
      { value: 0.28, utility: 0.97 },
      { value: 0.3, utility: 0.95 },
      { value: 1, utility: 0 },
    ],
    AttackerMoneyGain: [
      { value: 0, utility: 0 },
      { value: 15000, utility: 0.78 },
      { value: 18000, utility: 0.82 },
      { value: 50000, utility: 1 },
    ],
    AttackerDestructionGain: [
      { value: 0, utility: 0 },
      { value: 5, utility: 0.5 },
      { value: 7, utility: 0.8 },
      { value: 10, utility: 1 },
    ],
    VictimFinancialLoss: [
      { value: 0, utility: 0 },
      { value: 15250, utility: 0.83 },
      { value: 18500, utility: 0.9 },
      { value: 100000, utility: 1 },
    ],
  },
  benefitWeights: { AttackerMoneyGain: 0.4, AttackerDestructionGain: 0.6 },
  painWeights: { VictimFinancialLoss: 1 },
  detrimentWeights: {},
});
const node = (
  id: string,
  metrics: MetricInputs = {},
  type: TreeNode["type"] = "Attack",
): TreeNode => ({
  id,
  hid: `ATT_1_${id}`,
  label: id,
  type,
  description: "Test case",
  provenance: "Prototype illustration",
  metrics,
});
const edge = (
  source: string,
  target: string,
  gate: Gate = "AND",
  sequence: number | null = null,
): TreeEdge => ({
  id: `${source}-${target}`,
  source,
  target,
  lossId: "root",
  gate,
  sequence,
  tailoredOut: false,
  tailoredReason: "",
  completeBlock: false,
  blockReason: "",
  allowedRV: null,
  allowedReason: "",
});
const tree = (
  nodes: TreeNode[],
  edges: TreeEdge[],
  p = profile(),
): AttackTree => ({
  schemaVersion: 1,
  revision: 1,
  createdAt: "2026-10-04T00:00:00Z",
  updatedAt: "2026-10-04T00:00:00Z",
  id: "test",
  name: "Metric test",
  rootId: "root",
  nodes: [node("root", {}, "Loss"), ...nodes],
  edges,
  root: {
    MetricDefinitionsJSON: defaultMetricRules(),
    AnalysisProfileJSON: p,
    asset: "FireSat",
    environment: "Orbit",
    soi: "Payload",
    criticality: "High",
    assurance: "Availability",
    AttackTreeJSON: {
      positions: {},
      collapsed: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      direction: "DOWN",
      theme: "parchment",
      selectedProperties: [],
      nodeStyles: Object.fromEntries(
        NODE_TYPES.map((t) => [
          t,
          {
            font: "#000000",
            box: "#ffffff",
            line: "#000000",
            border: "#000000",
          },
        ]),
      ) as AttackTree["root"]["AttackTreeJSON"]["nodeStyles"],
    },
  },
});

// Golden numbers were independently derived from the reference's printed raw utility outputs.
describe("paper numerical verification", () => {
  it("V1 uses unrounded geometric mean, weighted benefit, propensity and relative risk", () => {
    const v = deriveScenario(raw({ AttackerDestructionGain: 5 }), profile());
    expect(v.AttackFeasibility).toBeCloseTo(0.9163672116434409, 12);
    expect(v.AttackDifficulty).toBeCloseTo(1.0912655835934695, 12);
    expect(v.AttackerBenefit).toBeCloseTo(0.612, 12);
    expect(v.Propensity).toBeCloseTo(0.5608167335257859, 12);
    expect(v.RelativeRisk).toBeCloseTo(0.46547788882640223, 12);
  });
  it("V2 corrects printed cube-root typo with the p33 table value", () => {
    const v = deriveScenario(
      raw({
        AttackCost: 30,
        Noticeability: 0.28,
        AttackerMoneyGain: 18000,
        AttackerDestructionGain: 7,
        VictimFinancialLoss: 18500,
      }),
      profile(),
    );
    expect(v.AttackFeasibility).toBeCloseTo(0.8835146971457896, 12);
    expect(v.AttackerBenefit).toBeCloseTo(0.808, 12);
    expect(v.Propensity).toBeCloseTo(0.713879875293798, 12);
    expect(v.RelativeRisk).toBeCloseTo(0.6424918877644182, 12);
  });
  it("V6 applies benefit ASE before utility and encounter ASE after relative risk", () => {
    const p = profile();
    p.resourceMetrics = ["TechnicalAbility"];
    p.benefitWeights = { AttackerMoneyGain: 1 };
    p.detrimentWeights = { AttackerDetriment: 1 };
    p.utilities.AttackerMoneyGain = [
      { value: 0, utility: 0 },
      { value: 50, utility: 0.8 },
      { value: 100, utility: 1 },
    ];
    p.utilities.VictimFinancialLoss = [
      { value: 0, utility: 0 },
      { value: 100, utility: 0.6 },
    ];
    const v = deriveScenario(
      raw({
        AttackerMoneyGain: 100,
        BenefitASE: 0.5,
        EncounterASE: 0.25,
        AttackerDetriment: 0.1,
        VictimFinancialLoss: 100,
      }),
      p,
    );
    expect(v.AttackerBenefit).toBeCloseTo(0.8, 12);
    expect(v.AttackerDetrimentValue).toBeCloseTo(0.1, 12);
    expect(v.Propensity).toBeCloseTo(0.63, 12);
    expect(v.RelativeRisk).toBeCloseTo(0.378, 12);
    expect(v.EffectiveEncounters).toBe(2.5);
    expect(v.ARO).toBeCloseTo(1.575, 12);
    expect(v.CumulativeRisk).toBeCloseTo(0.945, 12);
  });
  it("V7 retains cumulative risk above one and computes currency ALE and time threshold", () => {
    const p = profile();
    p.years = 3;
    const v = deriveScenario(raw({ AttackerDestructionGain: 5 }), p);
    expect(v.ARO).toBeCloseTo(5.608167335257859, 10);
    expect(v.CumulativeRisk).toBeCloseTo(13.964336664792066, 10);
    expect(v.ALE).toBeCloseTo(85524.55186268235, 7);
    expect(v.TimeToRiskThreshold).toBeCloseTo(0.21483297574483612, 12);
  });
  it("V8 converts recurring hourly encounters to annual rates and applies duration window once", () => {
    const p = profile();
    Object.assign(p, {
      encounterMode: "recurring",
      adversaryPopulation: 100,
      targets: 10,
      recoveryHours: 3,
      attackThreads: 2,
      dutyCycle: 0.5,
    });
    const v = deriveScenario(
      raw({
        AttackTime: 2,
        RandomEventDuration: 48,
        RandomEventFrequency: 2,
        RandomEventProbability: 0.01,
      }),
      p,
    );
    expect(v.EncounterRate).toBe(17520);
    expect(v.OpportunityFraction).toBeCloseTo(4 / 365, 12);
    expect(v.EffectiveEncounters).toBeCloseTo(192, 12);
    p.encounterMode = "single-shot";
    p.years = 2;
    const once = deriveScenario(raw(), p);
    expect(once.EncounterRate).toBe(5);
  });
  it("V9 zero capability returns no negative or infinite JSON values", () => {
    const p = profile();
    p.booleanCapabilities.PhysicalPresenceRequired = false;
    const v = deriveScenario(
      raw({ PhysicalPresenceRequired: 1, AttackerDestructionGain: 5 }),
      p,
    );
    expect(v.AttackFeasibility).toBe(0);
    expect(v.Propensity).toBe(0);
    expect(v.AttackDifficulty).toBeNull();
    expect(v.TimeToRiskThreshold).toBeNull();
    expect(JSON.stringify(v)).not.toMatch(/Infinity|NaN/);
  });
  it("negative net desirability deters attack without negative probability", () => {
    const p = profile();
    p.detrimentWeights = { AttackerDetriment: 1 };
    const v = deriveScenario(raw({ AttackerDetriment: 1 }), p);
    expect(v.AttackerNetBenefit).toBe(0);
    expect(v.Propensity).toBe(0);
  });
});

describe("gate and scenario integrity", () => {
  it("V3 aggregates required cost, reusable skill and parallel/sequential duration", () => {
    const t = tree(
      [
        node("a", raw()),
        node("b", raw({ AttackCost: 5, TechnicalAbility: 30, AttackTime: 3 })),
      ],
      [edge("root", "a"), edge("root", "b")],
    );
    const v = evaluateMetrics(t);
    expect(v.complete).toBe(true);
    expect(v.root.values.AttackCost).toBe(30);
    expect(v.root.values.TechnicalAbility).toBe(30);
    expect(v.root.values.AttackTime).toBe(3);
    t.edges.forEach((e, i) => {
      e.gate = "SAND";
      e.sequence = i;
    });
    expect(evaluateMetrics(t).root.values.AttackTime).toBe(5);
  });
  it("V4 keeps OR vectors coherent while exposing separate scalar bounds", () => {
    const p = profile();
    p.resourceMetrics = ["TechnicalAbility"];
    p.benefitWeights = { AttackerMoneyGain: 1 };
    p.utilities.AttackerMoneyGain = [
      { value: 0, utility: 0 },
      { value: 100, utility: 1 },
    ];
    const t = tree(
      [
        node("a", raw({ AttackCost: 10, AttackerMoneyGain: 10 })),
        node("b", raw({ AttackCost: 100, AttackerMoneyGain: 90 })),
      ],
      [edge("root", "a", "OR"), edge("root", "b", "OR")],
      p,
    );
    const result = evaluateMetrics(t);
    expect(result.scenarioCount).toBe(2);
    expect(result.root.scalarValues.AttackCost).toBe(10);
    expect(result.root.scalarValues.AttackerMoneyGain).toBe(90);
    expect(result.root.values.AttackCost).toBe(100);
    expect(result.root.values.AttackerMoneyGain).toBe(90);
    expect(result.root.selectedScenarioId).toBe("scenario:b");
    expect(
      result.root.scenarios.some(
        (s) => s.values.AttackCost === 10 && s.values.AttackerMoneyGain === 90,
      ),
    ).toBe(false);
  });
  it("structural leaf never supplies fictitious complete attack metrics", () => {
    const t = tree(
      [node("state", raw(), "State")],
      [edge("root", "state", "OR")],
    );
    const result = evaluateMetrics(t);
    expect(result.complete).toBe(false);
    expect(result.root.values.Propensity).toBeNull();
    expect(result.warnings.join(" ")).toMatch(/structural branch/);
  });
  it("reserved-looking identities do not collide with the metrics result dictionary", () => {
    const t = tree([node("constructor", raw())], [edge("root", "constructor")]);
    const result = evaluateMetrics(t);
    expect(result.root.values.AttackCost).toBe(25);
    expect(Object.hasOwn(result.byNode, "constructor")).toBe(true);
  });
  it("scalar mode withholds fictitious compound risk", () => {
    const p = profile();
    p.mode = "scalar";
    const t = tree([node("a", raw())], [edge("root", "a")], p);
    const result = evaluateMetrics(t);
    expect(result.root.values.AttackCost).toBe(25);
    expect(result.root.values.Propensity).toBeNull();
  });
  it("root Environment context contributes neither gate ambiguity nor fabricated metric defaults", () => {
    const t = tree(
      [node("env", {}, "Environment"), node("a", raw())],
      [edge("root", "env", "AND"), edge("root", "a", "OR")],
    );
    expect(evaluateMetrics(t).complete).toBe(true);
    expect(evaluateMetrics(t).root.values.AttackCost).toBe(25);
  });
  it("V10 complete block does not turn an OR into a zero-cost attack", () => {
    const t = tree(
      [
        node("a"),
        node("cm", {}, "Countermeasure"),
        node("b", raw({ AttackCost: 25 })),
      ],
      [edge("root", "a", "OR"), edge("a", "cm"), edge("root", "b", "OR")],
    );
    t.edges[1].completeBlock = true;
    const result = evaluateMetrics(t);
    expect(result.root.values.AttackCost).toBe(25);
    expect(result.scenarioCount).toBe(1);
    const before = structuredClone(result.root.values);
    t.root.AttackTreeJSON.collapsed = ["root"];
    expect(evaluateMetrics(t).root.values).toEqual(before);
    t.edges[2].tailoredOut = true;
    expect(evaluateMetrics(t).root.status).toBe("blocked");
    expect(evaluateMetrics(t).root.values.AttackProbability).toBe(0);
    expect(evaluateMetrics(t).root.values.AttackCost).toBeNull();
  });
  it("tailoring every subordinate branch is incomplete rather than defensive proof of zero risk", () => {
    const t = tree(
      [node("a"), node("cm", raw(), "Countermeasure")],
      [edge("root", "a"), edge("a", "cm")],
    );
    t.edges[1].tailoredOut = true;
    t.edges[1].tailoredReason = "Outside analysis scope";
    const result = evaluateMetrics(t);
    expect(result.root.status).toBe("incomplete");
    expect(result.root.values.Propensity).toBeNull();
    expect(result.warnings.join(" ")).toMatch(
      /Tailoring is not a complete block/,
    );
  });
  it("limits scenario Cartesian growth and withholds unverified complete result", () => {
    const p = profile();
    p.scenarioCap = 2;
    const t = tree(
      [
        node("a"),
        node("b"),
        ...["a1", "a2", "b1", "b2"].map((id) => node(id, raw())),
      ],
      [
        edge("root", "a"),
        edge("root", "b"),
        edge("a", "a1", "OR"),
        edge("a", "a2", "OR"),
        edge("b", "b1", "OR"),
        edge("b", "b2", "OR"),
      ],
      p,
    );
    const r = evaluateMetrics(t);
    expect(r.complete).toBe(false);
    expect(r.root.scenarios).toHaveLength(2);
    expect(r.root.values.RelativeRisk).toBeNull();
    expect(r.warnings.join(" ")).toMatch(/budget/);
  });
  it("detects shared leaf correlation rather than charging the same event twice", () => {
    const t = tree(
      [node("a"), node("b"), node("shared", raw())],
      [
        edge("root", "a"),
        edge("root", "b"),
        edge("a", "shared"),
        edge("b", "shared"),
      ],
    );
    const r = evaluateMetrics(t);
    expect(r.complete).toBe(false);
    expect(r.warnings.join(" ")).toMatch(/Shared leaf correlation/);
    expect(r.root.values.AttackCost).toBeNull();
  });
  it("ignores branch input edits and recomputes parents following leaf edits", () => {
    const t = tree([node("a", raw())], [edge("root", "a")]);
    t.nodes[0].metrics = { AttackCost: 999 };
    expect(evaluateMetrics(t).root.values.AttackCost).toBe(25);
    t.nodes[1].metrics.AttackCost = 35;
    expect(evaluateMetrics(t).root.values.AttackCost).toBe(35);
  });
  it("reports unknown leaves, graph cycles and undefined metrics rather than treating them as zero", () => {
    const t = tree([node("a", {})], [edge("root", "a")]);
    expect(evaluateMetrics(t).complete).toBe(false);
    expect(evaluateMetrics(t).root.values.AttackCost).toBeNull();
    t.nodes[1].metrics = raw();
    t.edges.push(edge("a", "root"));
    expect(evaluateMetrics(t).complete).toBe(false);
    const bad = tree(
      [node("a", { ...raw(), UnknownInput: 2 })],
      [edge("root", "a")],
    );
    expect(evaluateMetrics(bad).complete).toBe(false);
  });
  it("strict ABOVE threshold does not accept equality and configuration round-trips", () => {
    const t = tree([node("a", raw())], [edge("root", "a")]);
    const cost = t.root.MetricDefinitionsJSON.find(
      (r) => r.id === "AttackCost",
    )!;
    cost.threshold = 25;
    cost.thresholdDirection = "ABOVE";
    expect(evaluateMetrics(t).root.thresholds.AttackCost).toBe(false);
    t.nodes[1].metrics.AttackCost = 26;
    expect(evaluateMetrics(t).root.thresholds.AttackCost).toBe(true);
    cost.thresholdDirection = "BELOW";
    expect(evaluateMetrics(t).root.thresholds.AttackCost).toBe(false);
    t.nodes[1].metrics.AttackCost = 25;
    expect(evaluateMetrics(t).root.thresholds.AttackCost).toBe(false);
    t.nodes[1].metrics.AttackCost = 24;
    expect(evaluateMetrics(t).root.thresholds.AttackCost).toBe(true);
    expect(evaluateMetrics(JSON.parse(JSON.stringify(t))).root.values).toEqual(
      evaluateMetrics(t).root.values,
    );
  });
});

describe("stochastic calculations and validation", () => {
  it("V5 distinguishes independent stochastic union from hostile scalar MAX", () => {
    expect(probabilityUnion([0.2, 0.3])).toBeCloseTo(0.44, 12);
    const p = profile();
    p.independentRandomEvents = true;
    const t = tree(
      [
        node("a", raw({ RandomEventProbability: 0.2 })),
        node("b", raw({ RandomEventProbability: 0.3 })),
      ],
      [edge("root", "a", "OR"), edge("root", "b", "OR")],
      p,
    );
    t.nodes[0].eventKind = "stochastic";
    const r = evaluateMetrics(t);
    expect(r.complete).toBe(true);
    expect(r.root.values.RandomEventProbability).toBeCloseTo(0.44, 12);
    t.nodes[0].eventKind = "hostile";
    expect(evaluateMetrics(t).root.scalarValues.RandomEventProbability).toBe(
      0.3,
    );
    t.nodes[0].eventKind = "stochastic";
    t.edges.forEach((e) => (e.gate = "AND"));
    expect(evaluateMetrics(t).root.values.RandomEventProbability).toBeCloseTo(
      0.06,
      12,
    );
  });
  it("requires random independence and withholds ambiguous stochastic OR impact", () => {
    const t = tree(
      [
        node("a", raw({ RandomEventProbability: 0.2 })),
        node("b", raw({ RandomEventProbability: 0.3 })),
      ],
      [edge("root", "a", "OR"), edge("root", "b", "OR")],
    );
    t.nodes[0].eventKind = "stochastic";
    expect(evaluateMetrics(t).complete).toBe(false);
    t.root.AnalysisProfileJSON.independentRandomEvents = true;
    t.nodes[2].metrics.VictimFinancialLoss = 2;
    expect(evaluateMetrics(t).complete).toBe(false);
  });
  it("allows custom resource and impact properties with validated root rule definitions", () => {
    const rules = defaultMetricRules();
    rules.push({
      id: "EnvironmentalLoss",
      label: "Environmental loss",
      unit: "hectares",
      and: "SUM",
      or: "MAX",
      sand: "SUM",
      defaultValue: 0,
      min: 0,
    });
    const p = profile();
    p.utilities.EnvironmentalLoss = [
      { value: 0, utility: 0 },
      { value: 100, utility: 2 },
    ];
    p.painWeights = { EnvironmentalLoss: 1 };
    expect(validateMetricConfiguration(rules, p)).toEqual([]);
    expect(
      deriveScenario({ ...raw(), EnvironmentalLoss: 100 }, p).PainFactor,
    ).toBe(2);
  });
  it("rejects malformed or executable rules, invalid weights, domains and duplicate names", () => {
    const rules = defaultMetricRules();
    expect(
      validateMetricConfiguration(rules, defaultAnalysisProfile()),
    ).toEqual([]);
    rules.push({ ...rules[0] });
    rules[1].and = "eval" as "SUM";
    const p = profile();
    p.benefitWeights.AttackerMoneyGain = -1;
    p.targets = 0;
    p.utilities.AttackCost = [
      { value: 1, utility: 1 },
      { value: 0, utility: 0 },
    ];
    const errors = validateMetricConfiguration(rules, p).join(" ");
    expect(errors).toMatch(/Duplicate/);
    expect(errors).toMatch(/unknown and operation/);
    expect(errors).toMatch(/weights/);
    expect(errors).toMatch(/increasing/);
    expect(errors).toMatch(/positive/);
    expect(
      validateLeafMetrics(
        {
          AttackCost: Infinity,
          EncounterASE: 1.01,
          TechnicalAbility: NaN,
          PhysicalPresenceRequired: 2,
        },
        defaultMetricRules(),
      ),
    ).toHaveLength(5);
    expect(() => probabilityUnion([1.1])).toThrow();
  });
  it("stochastic terminal uses event probability rather than attacker desirability", () => {
    const t = tree(
      [node("a", raw({ RandomEventProbability: 0.2 }))],
      [edge("root", "a")],
    );
    t.nodes[1].eventKind = "stochastic";
    const result = evaluateMetrics(t);
    expect(result.byNode.a.values.Propensity).toBe(0.2);
    expect(result.byNode.a.values.ARO).toBe(2);
    expect(result.byNode.a.values.RelativeRisk).toBeCloseTo(0.166, 12);
  });
  it("rejects nonmonotone utilities and nonfinite aggregate results", () => {
    const p = profile();
    p.utilities.AttackCost = [
      { value: 0, utility: 0 },
      { value: 1, utility: 1 },
    ];
    expect(
      validateMetricConfiguration(defaultMetricRules(), p).join(" "),
    ).toMatch(/monotone/);
    const t = tree(
      [
        node("a", raw({ AttackCost: 1e308 })),
        node("b", raw({ AttackCost: 1e308 })),
      ],
      [edge("root", "a"), edge("root", "b")],
    );
    expect(evaluateMetrics(t).complete).toBe(false);
    expect(evaluateMetrics(t).root.values.AttackCost).toBeNull();
  });
  it("rejects zero recurring time denominator without a fabricated zero frequency", () => {
    const p = profile();
    p.encounterMode = "recurring";
    p.recoveryHours = 0;
    const t = tree([node("a", raw({ AttackTime: 0 }))], [edge("root", "a")], p);
    expect(evaluateMetrics(t).complete).toBe(false);
    expect(evaluateMetrics(t).warnings.join(" ")).toMatch(
      /positive attack plus recovery/,
    );
  });
  it("malformed imported configuration produces validation findings without throwing", () => {
    const p = profile();
    p.utilities.AttackCost = [
      null,
      { value: 1, utility: 1 },
    ] as unknown as AnalysisProfile["utilities"][string];
    p.resourceMetrics = {} as unknown as string[];
    expect(() =>
      validateMetricConfiguration(defaultMetricRules(), p),
    ).not.toThrow();
    expect(
      validateMetricConfiguration(defaultMetricRules(), p).length,
    ).toBeGreaterThan(0);
  });
  it("preserves built-in equation dependency IDs in scenario mode while allowing custom names and labels", () => {
    const p = profile(),
      rules = defaultMetricRules();
    const ase = rules.find((r) => r.id === "BenefitASE")!;
    ase.id = "RenamedEfficiency";
    expect(validateMetricConfiguration(rules, p).join(" ")).toMatch(
      /requires built-in metric ID BenefitASE/,
    );
    p.mode = "scalar";
    expect(validateMetricConfiguration(rules, p)).toEqual([]);
    p.mode = "scenario";
    ase.id = "BenefitASE";
    ase.label = "Expected success benefit factor";
    rules.push({
      id: "MyRenamedCustom",
      label: "Custom renamed metric",
      unit: "hours",
      and: "SUM",
      or: "MIN",
      sand: "SUM",
      defaultValue: 0,
    });
    expect(validateMetricConfiguration(rules, p)).toEqual([]);
  });
  it("piecewise utilities interpolate and use declared endpoint values", () => {
    const points = [
      { value: 0, utility: 1 },
      { value: 10, utility: 0.8 },
      { value: 20, utility: 0 },
    ];
    expect(utility(5, points)).toBe(0.9);
    expect(utility(-1, points)).toBe(1);
    expect(utility(30, points)).toBe(0);
  });
});

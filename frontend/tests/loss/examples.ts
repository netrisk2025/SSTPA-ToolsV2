/**
 * FireSat source identities are read-only copies from Example_Data/FireSat/model/10-space-segment.yaml.
 * The reference intentionally has no Assets, Losses, attack trees or Countermeasures.
 * All analytical relationships and DEMO-prefixed nodes below are prototype illustrations.
 */
import type {
  AttackTree,
  Gate,
  MetricInputs,
  NodeStyle,
  NodeType,
  TreeEdge,
  TreeNode,
  ViewState,
} from "../../src/tools/loss/domain/types";
import { defaultAnalysisProfile, defaultMetricRules } from "../../src/tools/loss/domain/metrics";
import { simulatedAuthoritativeUuid } from "./fixtures/identity";

const CREATED = "2026-10-04T16:00:00.000Z";
export const FIRESAT_SOURCE =
  "SSTPA Tools/Example_Data/FireSat/model/10-space-segment.yaml";

export function defaultStyles(): Record<NodeType, NodeStyle> {
  const palette: Record<NodeType, [string, string, string]> = {
    Loss: ["#fbefd0", "#8a6b32", "#6e552b"],
    Environment: ["#e1eee6", "#477e70", "#255b4e"],
    State: ["#e4eaf0", "#708398", "#405569"],
    Interface: ["#e3e9ed", "#597889", "#2d5268"],
    SystemFunction: ["#e4e8f0", "#6f7b99", "#465776"],
    Component: ["#e4e9e6", "#6b8273", "#435e4c"],
    Attack: ["#f1ded9", "#ad6257", "#91443c"],
    Countermeasure: ["#dfeaea", "#65868b", "#365f67"],
    Asset: ["#ebe2ee", "#96799d", "#72567d"],
  };
  return Object.fromEntries(
    Object.entries(palette).map(([type, [box, line, border]]) => [
      type,
      { font: "#273345", box, line, border },
    ]),
  ) as Record<NodeType, NodeStyle>;
}
export function defaultView(): ViewState {
  return {
    positions: {},
    collapsed: [],
    viewport: { x: 0, y: 0, zoom: 0.7 },
    direction: "DOWN",
    theme: "parchment",
    selectedProperties: ["AttackCost", "TechnicalAbility", "AttackTime"],
    selectedNodeProperties: [],
    nodeStyles: defaultStyles(),
  };
}
function node(
  id: string,
  label: string,
  type: NodeType,
  hid?: string,
  description?: string,
): TreeNode {
  const result: TreeNode = {
    id,
    hid: hid ?? `DEMO_${id.toUpperCase().replaceAll("-", "_")}`,
    label,
    type,
    description:
      description ??
      "Prototype-authored FireSat analytical illustration; not a validated system finding.",
    provenance: hid ? "FireSat reference" : "Prototype illustration",
    metrics: {},
    ...(type === "Asset" ? { derived: true } : {}),
  };
  result.authoritativeUuid = simulatedAuthoritativeUuid(result);
  return result;
}
function makeBase(id: string, name: string): AttackTree {
  return {
    schemaVersion: 1,
    revision: 1,
    createdAt: CREATED,
    updatedAt: CREATED,
    id,
    name,
    rootId: "loss",
    nodes: [
      node("loss", "Loss of authentic fire reports", "Loss"),
      node(
        "env",
        "Payload Operating Environment",
        "Environment",
        "ENV_1.1.2_1",
        "Cryogenic sensor operation on a thermally stable platform. Source: FireSat Space Segment YAML.",
      ),
    ],
    edges: [],
    root: {
      MetricDefinitionsJSON: defaultMetricRules(),
      AnalysisProfileJSON: defaultAnalysisProfile(),
      AttackTreeJSON: defaultView(),
      asset: "DEMO_AST_FIRE_REPORTS · Fire detection reports",
      environment: "ENV_1.1.2_1 · Payload Operating Environment",
      soi: "SYS_1.1.2_0 · Fire Detection Payload",
      criticality: "Mission Critical",
      assurance: "Authenticity",
    },
  };
}
function edge(
  tree: AttackTree,
  source: string,
  target: string,
  gate: Gate = "OR",
  patch: Partial<TreeEdge> = {},
): TreeEdge {
  const e: TreeEdge = {
    id: `${source}--${target}`,
    source,
    target,
    lossId: tree.rootId,
    gate,
    sequence: null,
    tailoredOut: false,
    tailoredReason: "",
    completeBlock: false,
    blockReason: "",
    allowedRV: null,
    allowedReason: "",
    ...patch,
  };
  tree.edges.push(e);
  return e;
}
function add(
  tree: AttackTree,
  n: TreeNode,
  parent: string,
  gate: Gate = "OR",
  patch: Partial<TreeEdge> = {},
): TreeNode {
  tree.nodes.push(n);
  edge(tree, parent, n.id, gate, patch);
  return n;
}
export function illustrativeLeafMetrics(seed = 0): MetricInputs {
  const values: MetricInputs = Object.fromEntries(
    defaultMetricRules().map((r) => [r.id, r.defaultValue]),
  );
  return {
    ...values,
    AttackCost: 2500 + seed * 350,
    TechnicalAbility: 25 + (seed % 6) * 8,
    AttackTime: 2 + (seed % 5),
    Noticeability: 0.15 + (seed % 4) * 0.1,
    PhysicalPresenceRequired: false,
    BreachOfTrustRequired: seed % 5 === 2,
    AttackerMoneyGain: 4000 + seed * 200,
    AttackerDestructionGain: 0.2 + (seed % 4) * 0.1,
    AttackerDetriment: 0.005,
    VictimFinancialLoss: 200000 + seed * 10000,
    VictimSafetyImpact: 0.2,
    VictimMissionImpact: 0.8,
    RandomEventProbability: 1,
    RandomEventDuration: 0,
    RandomEventFrequency: 0,
    BenefitASE: 0.9,
    EncounterASE: 1,
    AttackProbability: 0.2,
  };
}
function finish(tree: AttackTree): AttackTree {
  const parents = new Set(tree.edges.map((e) => e.source));
  let seed = 0;
  for (const n of tree.nodes)
    if (!parents.has(n.id) && n.type !== "Environment")
      n.metrics = illustrativeLeafMetrics(seed++);
  return tree;
}
function addSourceStates(tree: AttackTree) {
  add(
    tree,
    node(
      "standby",
      "Standby",
      "State",
      "ST_1.1.2_1",
      "Payload standby; StateSequence 0. Source: FireSat.",
    ),
    "loss",
  );
  add(
    tree,
    node(
      "imaging",
      "Imaging",
      "State",
      "ST_1.1.2_2",
      "Sensor scanning with detection processing active; StateSequence 1. Source: FireSat.",
    ),
    "loss",
  );
}
export function createOverview(): AttackTree {
  const t = makeBase("firesat-overview", "FireSat · authentic fire reports");
  edge(t, "loss", "env", "AND");
  addSourceStates(t);
  add(
    t,
    node(
      "processor",
      "Payload Processor",
      "Component",
      "EL_1.1.2_3",
      "On-board fire classification and report generation computer. Source: FireSat.",
    ),
    "imaging",
  );
  edge(t, "standby", "processor");
  add(
    t,
    node(
      "video",
      "Sensor Video Input Interface",
      "Interface",
      "INT_1.1.2_1",
      "Digital video input from the IR sensor assembly. Source: FireSat.",
    ),
    "imaging",
  );
  add(
    t,
    node(
      "classify",
      "Classify Fire Detections",
      "SystemFunction",
      "FUN_1.1.2_2",
      "Score thermal anomalies as fire or non-fire on board. Source: FireSat.",
    ),
    "imaging",
  );
  add(
    t,
    node(
      "downlink",
      "Payload Downlink Feed Interface",
      "Interface",
      "INT_1.1.2_2",
      "Detection report hand-off into the payload comms unit. Source: FireSat.",
    ),
    "standby",
  );
  add(t, node("firmware", "Alter payload firmware", "Attack"), "processor");
  add(t, node("diagnostic", "Abuse diagnostic access", "Attack"), "processor");
  add(
    t,
    node("signed", "Verify signed firmware", "Countermeasure"),
    "firmware",
    "AND",
  );
  add(
    t,
    node("custody", "Protect update key custody", "Countermeasure"),
    "firmware",
    "AND",
  );
  add(
    t,
    node("keytheft", "Obtain update authorization", "Attack"),
    "signed",
    "OR",
    {
      allowedRV: 1,
      allowedReason:
        "Prototype acceptance: restricted maintenance exposure is reviewed during the example mission campaign.",
    },
  );
  add(
    t,
    node("derived-key", "Update signing key confidentiality", "Asset"),
    "custody",
    "AND",
  );
  add(
    t,
    node("video-tamper", "Inject altered sensor frames", "Attack"),
    "video",
  );
  add(
    t,
    node("frame-check", "Validate frame provenance", "Countermeasure"),
    "video-tamper",
    "AND",
    {
      completeBlock: true,
      blockReason:
        "Illustrative Complete Block claim for review: independent frame-origin checks reject this modeled injection route.",
    },
  );
  add(
    t,
    node("model-bias", "Bias detection classification", "Attack"),
    "classify",
  );
  add(
    t,
    node("cross-check", "Cross-check detection evidence", "Countermeasure"),
    "model-bias",
    "AND",
  );
  add(
    t,
    node("calibration", "Alter calibration reference", "Attack"),
    "cross-check",
  );
  add(
    t,
    node("baseline", "Protect calibration baseline", "Countermeasure"),
    "calibration",
    "AND",
  );
  add(
    t,
    node("review-bypass", "Bypass calibration review", "Attack"),
    "baseline",
  );
  add(t, node("replay", "Replay a detection report", "Attack"), "downlink");
  add(
    t,
    node("anti-replay", "Enforce freshness window", "Countermeasure"),
    "replay",
    "AND",
  );
  add(t, node("rollover", "Abuse counter rollover", "Attack"), "anti-replay");
  add(
    t,
    node("obsolete", "Exploit retired downlink mode", "Attack"),
    "downlink",
    "OR",
    {
      tailoredOut: true,
      tailoredReason:
        "Prototype context excludes the retired development interface from the operational payload configuration.",
    },
  );
  return finish(t);
}
function renameScope(tree: AttackTree, id: string, name: string): AttackTree {
  tree.id = id;
  tree.name = name;
  for (const e of tree.edges) e.lossId = tree.rootId;
  return tree;
}
export function createSequence(): AttackTree {
  const t = renameScope(
    createOverview(),
    "firesat-sequence",
    "FireSat · ordered state scenario",
  );
  for (const e of t.edges.filter(
    (e) => e.source === "loss" && e.target !== "env",
  )) {
    e.gate = "SAND";
    e.sequence = e.target === "standby" ? 0 : 1;
  }
  return t;
}
export function createShared(): AttackTree {
  const t = renameScope(
    createOverview(),
    "firesat-shared",
    "FireSat · shared payload identity",
  );
  t.root.AttackTreeJSON.selectedProperties = ["AttackCost", "TechnicalAbility"];
  t.root.AttackTreeJSON.selectedNodeProperties = ["provenance"];
  return t;
}
export function createWide(): AttackTree {
  const t = makeBase("firesat-wide", "FireSat · state and entity breadth");
  edge(t, "loss", "env", "AND");
  addSourceStates(t);
  add(
    t,
    node("calibration-state", "Calibration review (extension)", "State"),
    "loss",
  );
  add(
    t,
    node("downlink-state", "Report downlink (extension)", "State"),
    "loss",
  );
  const states = ["standby", "imaging", "calibration-state", "downlink-state"];
  const real: [string, string, NodeType, string][] = [
    ["wide-processor", "Payload Processor", "Component", "EL_1.1.2_3"],
    ["wide-video", "Sensor Video Input Interface", "Interface", "INT_1.1.2_1"],
    [
      "wide-classify",
      "Classify Fire Detections",
      "SystemFunction",
      "FUN_1.1.2_2",
    ],
    [
      "wide-feed",
      "Payload Downlink Feed Interface",
      "Interface",
      "INT_1.1.2_2",
    ],
  ];
  for (let i = 0; i < 40; i++) {
    const state = states[Math.floor(i / 10)]!;
    const spec = real[i];
    const n = spec
      ? node(...spec)
      : node(
          `wide-entity-${i}`,
          `Payload ${["element", "interface", "function"][i % 3]} extension ${i + 1}`,
          (["Component", "Interface", "SystemFunction"] as NodeType[])[i % 3]!,
        );
    add(t, n, state);
    add(
      t,
      node(`wide-attack-${i}`, `Compromise ${n.label.toLowerCase()}`, "Attack"),
      n.id,
    );
  }
  edge(t, "imaging", "wide-processor");
  return finish(t);
}
export function createDeep(): AttackTree {
  const t = makeBase("firesat-deep", "FireSat · countermeasure recursion");
  edge(t, "loss", "env", "AND");
  add(t, node("imaging", "Imaging", "State", "ST_1.1.2_2"), "loss");
  add(
    t,
    node("processor", "Payload Processor", "Component", "EL_1.1.2_3"),
    "imaging",
  );
  const labels = [
    "Alter payload firmware",
    "Resolve update-path access",
    "Authenticate maintenance session",
    "Obtain session credential",
    "Bind credentials to hardware",
    "Defeat hardware binding",
    "Verify secure-loader state",
    "Alter loader attestation",
    "Protect attestation reference",
    "Subvert reference enrollment",
    "Review enrollment evidence",
    "Forge review provenance",
    "Separate approval authorities",
    "Compromise second authority",
    "Audit approval independence",
    "Evade audit correlation",
    "Protect audit configuration",
    "Alter configuration approval",
  ];
  let parent = "processor";
  for (let depth = 3; depth <= 20; depth++) {
    const type: NodeType =
      depth <= 4 ? "Attack" : depth % 2 === 1 ? "Countermeasure" : "Attack";
    const parentType = t.nodes.find((n) => n.id === parent)!.type;
    const n = node(`deep-${depth}`, labels[depth - 3]!, type);
    add(
      t,
      n,
      parent,
      parentType === "Attack" && type === "Countermeasure" ? "AND" : "OR",
    );
    parent = n.id;
  }
  return finish(t);
}
export function createValidation(): AttackTree {
  const t = renameScope(
    createOverview(),
    "firesat-validation",
    "FireSat · review findings",
  );
  t.nodes.find((n) => n.id === "diagnostic")!.metrics = {};
  t.root.MetricDefinitionsJSON.find((m) => m.id === "AttackCost")!.threshold =
    1000000;
  t.root.MetricDefinitionsJSON.find(
    (m) => m.id === "AttackCost",
  )!.thresholdDirection = "ABOVE";
  return t;
}
/** Synthetic maximum envelope; generator may produce one-over fixtures for rejection testing. */
export function createEnvelope(
  count = 1000,
  depth = 20,
  width = 50,
): AttackTree {
  if (
    !Number.isInteger(count) ||
    !Number.isInteger(depth) ||
    !Number.isInteger(width) ||
    count < 4 ||
    depth < 3 ||
    width < 2 ||
    count > 1 + depth * width
  )
    throw new Error(
      "Envelope parameters cannot contain the requested node count.",
    );
  const t = makeBase(
    `firesat-envelope-${count}-${depth}-${width}`,
    `FireSat · ${count}-node envelope`,
  );
  edge(t, "loss", "env", "AND");
  let remaining = count - 2;
  let prior = ["loss"];
  for (let d = 1; d <= depth && remaining > 0; d++) {
    const slots = d === 1 ? width - 1 : width;
    const size = Math.min(slots, remaining);
    const layer: string[] = [];
    for (let i = 0; i < size; i++) {
      const type: NodeType =
        d === 1
          ? "State"
          : d === 2
            ? (["Component", "Interface", "SystemFunction"] as NodeType[])[
                i % 3
              ]!
            : "Attack";
      const id = `envelope-${d}-${i}`;
      add(
        t,
        node(
          id,
          `${d === 1 ? "Operating state" : d === 2 ? "Payload entity" : "Attack refinement"} ${d}.${i + 1}`,
          type,
        ),
        prior[i % prior.length]!,
      );
      layer.push(id);
    }
    remaining -= size;
    prior = layer;
  }
  if (remaining !== 0)
    throw new Error(
      "Envelope generator failed to allocate every requested node.",
    );
  return finish(t);
}
export interface Example {
  id: string;
  title: string;
  description: string;
  create: () => AttackTree;
}
export const EXAMPLES: Example[] = [
  {
    id: "overview",
    title: "01 · FireSat overview",
    description:
      "25 nodes · real payload identities with illustrative Loss, attacks, countermeasures and leaf metrics.",
    create: createOverview,
  },
  {
    id: "sequence",
    title: "02 · SAND sequence",
    description:
      "Ordered Standby → Imaging states; sibling sequence is distinct from visual placement.",
    create: createSequence,
  },
  {
    id: "shared",
    title: "03 · Shared identity",
    description:
      "One Payload Processor beneath two States; edge decisions preserve their context.",
    create: createShared,
  },
  {
    id: "wide",
    title: "04 · Wide state coverage",
    description:
      "Four States, 40 entities and 40 attacks; width reaches the 80% warning.",
    create: createWide,
  },
  {
    id: "deep",
    title: "05 · Countermeasure depth",
    description:
      "Subordinate attack resolution and countermeasure/counter-attack rounds reach depth 20.",
    create: createDeep,
  },
  {
    id: "validation",
    title: "06 · Review findings",
    description:
      "A legal graph with leaf defaults, unaddressed RVs and a failed acceptance threshold.",
    create: createValidation,
  },
  {
    id: "boundary",
    title: "07 · 1,000-node envelope",
    description:
      "Synthetic FireSat extensions at the node/depth/width envelope; illustrative qualification data.",
    create: () => createEnvelope(),
  },
];

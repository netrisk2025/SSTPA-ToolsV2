/** Integration DTO: semantic identity and relationship flags remain independent of view state. */
export const NODE_TYPES = [
  "Loss",
  "Environment",
  "State",
  "Interface",
  "SystemFunction",
  "Component",
  "Attack",
  "Countermeasure",
  "Asset",
] as const;
export type NodeType = (typeof NODE_TYPES)[number];
export type NodePropertyKey = "nodeId" | "authoritativeUuid" | "provenance";
export type Gate = "AND" | "OR" | "SAND";
export type MetricInputs = Record<string, number | boolean | null>;
export type MetricOperation = "SUM" | "PRODUCT" | "MIN" | "MAX";
export interface MetricRule {
  id: string;
  label: string;
  unit: string;
  and: MetricOperation;
  or: MetricOperation;
  sand: MetricOperation;
  defaultValue: number | null;
  min?: number;
  max?: number;
  boolean?: boolean;
  description?: string;
  threshold?: number;
  thresholdDirection?: "ABOVE" | "BELOW";
}
export interface TreeNode {
  /** Identity of this semantic node within its attack tree, independent of the source element. */
  id: string;
  /** Source element UUID; null/absent means the element is not yet committed to the authority. */
  authoritativeUuid?: string | null;
  hid: string;
  label: string;
  type: NodeType;
  description: string;
  provenance: "Core database" | "Not yet committed" | "FireSat reference" | "Prototype illustration";
  metrics: MetricInputs;
  eventKind?: "hostile" | "stochastic";
  derived?: boolean;
}
export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  lossId: string;
  gate: Gate;
  sequence: number | null;
  tailoredOut: boolean;
  tailoredReason: string;
  completeBlock: boolean;
  blockReason: string;
  allowedRV: number | null;
  allowedReason: string;
}
export interface NodeStyle {
  font: string;
  box: string;
  line: string;
  border: string;
}
export interface Point {
  x: number;
  y: number;
}
export interface ViewState {
  /** Migration only: world-space center requires actual canvas dimensions. */
  legacyCenter?: {x:number;y:number;zoom:number};
  positions: Record<string, Point>;
  collapsed: string[];
  viewport: { x: number; y: number; zoom: number };
  direction: "DOWN" | "RIGHT";
  theme: "parchment" | "nocturne";
  selectedProperties: string[];
  /** Node metadata uses a separate namespace from attacker/victim metric identifiers. */
  selectedNodeProperties?: NodePropertyKey[];
  nodeStyles: Record<NodeType, NodeStyle>;
}
export interface UtilityPoint {
  value: number;
  utility: number;
}
export interface AnalysisProfile {
  mode: "scenario" | "scalar";
  scenarioCap: number;
  utilities: Record<string, UtilityPoint[]>;
  benefitWeights: Record<string, number>;
  painWeights: Record<string, number>;
  detrimentWeights: Record<string, number>;
  resourceMetrics: string[];
  booleanCapabilities: Record<string, boolean>;
  encountersPerYear: number;
  years: number;
  riskThreshold: number;
  targets: number;
  adversaryPopulation: number;
  recoveryHours: number;
  attackThreads: number;
  dutyCycle: number;
  encounterMode: "fixed" | "single-shot" | "recurring";
  independentRandomEvents: boolean;
  actorName: string;
  victimName: string;
}
export interface RootProperties {
  MetricDefinitionsJSON: MetricRule[];
  AnalysisProfileJSON: AnalysisProfile;
  AttackTreeJSON: ViewState;
  asset: string;
  environment: string;
  soi: string;
  criticality: string;
  assurance: "Confidentiality" | "Availability" | "Authenticity" | "NonRepudiation" | "Certifiable" | "Privacy" | "Trustworthy";
}
export interface AttackTree {
  /** Authenticated Core evidence accompanying exports; never accepted as authority on import. */
  core?: {status:string; loadedVersion:number; attackTreeJSON:Record<string,unknown>; findings:{severity:string;type:string;nodeHid?:string;message:string}[]};
  schemaVersion: 1;
  revision: number;
  createdAt: string;
  updatedAt: string;
  id: string;
  name: string;
  rootId: string;
  nodes: TreeNode[];
  edges: TreeEdge[];
  root: RootProperties;
}
export interface Repository {
  load(): AttackTree | null;
  save(tree: AttackTree): void;
}
export const LIMITS = { nodes: 1000, depth: 20, width: 50 } as const;

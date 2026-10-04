import type { NodePropertyKey, TreeNode, ViewState } from "./types";

export const NODE_PROPERTY_OPTIONS: readonly {
  key: NodePropertyKey;
  label: string;
}[] = [
  { key: "nodeId", label: "Node ID" },
  { key: "authoritativeUuid", label: "Authoritative UUID" },
  { key: "provenance", label: "Provenance" },
];

export const AUTHORITATIVE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Legacy direct DTOs may still put the provenance display toggle among metrics. */
export function selectedNodePropertyKeys(view: ViewState): NodePropertyKey[] {
  return (
    view.selectedNodeProperties ??
    (view.selectedProperties.includes("provenance") ? ["provenance"] : [])
  );
}

export function selectedMetricPropertyKeys(view: ViewState): string[] {
  return view.selectedNodeProperties === undefined
    ? view.selectedProperties.filter((key) => key !== "provenance")
    : view.selectedProperties;
}

export function nodePropertyValue(
  node: TreeNode,
  key: NodePropertyKey,
): string {
  switch (key) {
    case "nodeId":
      return node.id;
    case "authoritativeUuid":
      return node.authoritativeUuid ?? "not yet committed";
    case "provenance":
      return node.provenance === "Core database" ? "Core database" : node.provenance === "FireSat reference" ? "Reference" : node.provenance === "Prototype illustration" ? "Illustrative" : "not yet committed";
  }
}

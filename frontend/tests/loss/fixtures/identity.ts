import type { TreeNode } from "../../../src/tools/loss/domain/types";
/**
 * Prototype-only registry, not Neo4j records or UUIDs read from SSTPA Tools.
 * Values are UUIDv5(NAMESPACE_URL,
 *   "https://example.invalid/sstpa-attack-tree/simulated-neo4j/v1/" + type + ":" + HID).
 * Explicit entries limit migration to known reference elements and keep the same
 * simulated source identity across example trees and multiple relationships.
 */
export const SIMULATED_FIRESAT_UUIDS: Readonly<Record<string, string>> = {
  "Environment:ENV_1.1.2_1": "17b41945-abdc-59be-a152-fa26362c6b75",
  "State:ST_1.1.2_1": "c4a4fa50-9de8-5fc7-aa0d-932b6d1811ee",
  "State:ST_1.1.2_2": "854cd537-6726-5246-97f8-216007b91dfb",
  "Component:EL_1.1.2_3": "c49d6656-580d-5adf-92ff-031a77837ea9",
  "Interface:INT_1.1.2_1": "ade207db-eb07-58ac-a196-bcf546e33502",
  "Interface:INT_1.1.2_2": "f3c520fb-d875-5490-b6ca-eb70dcaf30e5",
  "SystemFunction:FUN_1.1.2_2": "05871d76-2f57-564e-a789-906b9d66d0cf",
};

export function simulatedAuthoritativeUuid(
  node: Pick<TreeNode, "type" | "hid" | "provenance">,
): string | null {
  return node.provenance === "FireSat reference"
    ? (SIMULATED_FIRESAT_UUIDS[`${node.type}:${node.hid}`] ?? null)
    : null;
}

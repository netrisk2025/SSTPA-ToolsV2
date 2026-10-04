import type { CommitOperation, SoINode } from "../../api/types";

export const ASSET_TYPES = ["Organic", "Horizontal", "Derived"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];
type AssetIdentity = Pick<SoINode, "typeName" | "properties">;

// Accept legacy display spelling on read; new writes use the canonical enum.
export const isDerivedAsset = (asset: AssetIdentity): boolean =>
  asset.typeName === "DerivedAsset" ||
  String(asset.properties.AssetType ?? "").toLowerCase() === "derived";

export function assetTypeLabel(asset: AssetIdentity): string {
  if (isDerivedAsset(asset)) return "Derived";
  if (asset.properties.AssetType === "Organic" || asset.properties.AssetType === "Horizontal") {
    return asset.properties.AssetType;
  }
  return "Primary (type unspecified)";
}

/** Core-valid initial Asset operations; inherited DerivedAsset properties stay
 * on its source Asset under interpretation I-12. */
export function newAssetOperations(
  type: AssetType,
  name: string,
  soiHid: string,
  derivedFrom: string,
  properties: Record<string, unknown> = {},
): CommitOperation[] {
  if (type === "Derived") {
    if (!derivedFrom) throw new Error("Select the primary Asset before creating a Derived Asset.");
    return [
      { op: "createNode", tempId: "ast", label: "DerivedAsset", properties: { Name: name } },
      { op: "createRelationship", type: "DERIVED_FROM", sourceHid: "$ast", targetHid: derivedFrom },
    ];
  }
  if (type !== "Organic" && type !== "Horizontal") throw new Error("Choose a canonical Asset Type.");
  return [
    { op: "createNode", tempId: "ast", label: "Asset", properties: { ...properties, Name: name, AssetType: type } },
    { op: "createRelationship", type: "HAS_ASSET", sourceHid: soiHid, targetHid: "$ast" },
  ];
}

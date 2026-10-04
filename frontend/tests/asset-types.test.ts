import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ASSET_TYPES, assetTypeLabel, isDerivedAsset, newAssetOperations } from "../src/tools/assets/assetTypes";

const schema = JSON.parse(readFileSync(new URL("../../backend/internal/schema/data/node-properties.json", import.meta.url), "utf8"));
const assetEnum = schema.nodeTypes.Asset.propertyGroups.flatMap((g: {properties:{name:string;enumValues?:string[]}[]}) => g.properties).find((p: {name:string}) => p.name === "AssetType").enumValues;

describe("Asset Manager Core type contract", () => {
  it("offers exactly the Core AssetType values", () => expect(ASSET_TYPES).toEqual(assetEnum));
  it.each(["Organic", "Horizontal"] as const)("creates a %s primary with Core-valid properties", (type) => {
    const ops = newAssetOperations(type, "Alert data", "SYS_1_0", "", { Confidentiality: true, AssetType: "PRIMARY" });
    expect(ops[0]).toMatchObject({op:"createNode",label:"Asset",properties:{Name:"Alert data",AssetType:type,Confidentiality:true}});
    expect(assetEnum).toContain(ops[0].properties?.AssetType);
    expect(ops[1]).toMatchObject({type:"HAS_ASSET",sourceHid:"SYS_1_0",targetHid:"$ast"});
  });
  it("retains the I-12 DerivedAsset route without inventing inherited properties", () => {
    const ops = newAssetOperations("Derived", "Authentication key", "SYS_1_0", "AST_1_1", {Confidentiality:true,AssetType:"Derived"});
    expect(ops[0]).toEqual({op:"createNode",tempId:"ast",label:"DerivedAsset",properties:{Name:"Authentication key"}});
    expect(ops[1]).toMatchObject({type:"DERIVED_FROM",sourceHid:"$ast",targetHid:"AST_1_1"});
    expect(() => newAssetOperations("Derived", "Key", "SYS_1_0", "")).toThrow(/primary Asset/);
  });
  it("recognizes canonical Derived assets and the dedicated label for filtering and inheritance", () => {
    for (const asset of [{typeName:"Asset",properties:{AssetType:"Derived"}},{typeName:"Asset",properties:{AssetType:"DERIVED"}},{typeName:"DerivedAsset",properties:{}}]) {
      expect(isDerivedAsset(asset)).toBe(true);
      expect(assetTypeLabel(asset)).toBe("Derived");
    }
    for (const AssetType of ["Organic","Horizontal"]) {
      const asset={typeName:"Asset",properties:{AssetType}};
      expect(isDerivedAsset(asset)).toBe(false);
      expect(assetTypeLabel(asset)).toBe(AssetType);
    }
  });
});

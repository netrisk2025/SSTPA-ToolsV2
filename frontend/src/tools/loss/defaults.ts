import type { NodeStyle, NodeType, ViewState } from "./domain/types";
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

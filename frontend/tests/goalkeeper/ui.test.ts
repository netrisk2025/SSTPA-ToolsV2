// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SoINode } from "../../src/api/types";
import type { ToolLaunchContext, ToolManifest } from "../../src/tools/manifest";
import { useDrawer } from "../../src/state/stores";
const mocks = vi.hoisted(() => ({ soi: vi.fn(), commit: vi.fn(), layout: vi.fn(), download: vi.fn() }));
vi.mock("../../src/api/client", async importOriginal => ({ ...await importOriginal<object>(), api: { soi: mocks.soi, commit: mocks.commit } }));
vi.mock("../../src/tools/goalkeeper/domain/layout/elk", () => ({ layoutArgument: mocks.layout }));
vi.mock("../../src/tools/ModelTextPanel", () => ({ ModelTextPanel: () => createElement("div", null, "Read-only backend model") }));
vi.mock("../../src/tools/shared", async importOriginal => ({ ...await importOriginal<object>(), downloadText: mocks.download }));
import GoalKeeperTool from "../../src/tools/goalkeeper/GoalKeeperTool";
import { ColorsDialog } from "../../src/tools/goalkeeper/PresentationDialogs";

let host: HTMLDivElement, root: Root, qc: QueryClient;
const ctx: ToolLaunchContext = { userName: "Reviewer", userEmail: "", isAdmin: true, soiHid: "SYS_1_0", soiUuid: "sys", drawerNodeHid: null, drawerNodeUuid: null, focusHid: null, focusType: null, launchMode: "CONTROL_PANEL", backendBaseUrl: "", editAuthorized: true, themeTokens: "default" };
const positions = { G_1_1: { x: 500, y: 200 }, G_1_2: { x: 500, y: 600 } };
function node(hid: string, typeName = "GsnGoal", properties: Record<string, unknown> = {}): SoINode {
  return { hid, uuid: `uuid-${hid}`, soi: "1", labels: [typeName], typeName, relationships: [], properties: { Name: hid === "G_1_1" ? "Review argument" : hid, GoalID: hid === "G_1_1" ? 1 : 2, GoalStatement: "A clear, unchanged claim.", Undeveloped: true, ...properties } };
}
function fixture(saved = true) {
  const parent = node("G_1_1"), child = node("G_1_2");
  parent.relationships = [{ type: "SUPPORTED_BY", targetHID: child.hid, targetUUID: child.uuid, props: {} }];
  if (saved) parent.properties.GoalStructure = JSON.stringify({ schemaVersion: "1.0", rootGoalHid: parent.hid, rootGoalUuid: parent.uuid, savedAt: "2026-10-04T00:00:00Z", goalKeeperView: { version: 1, positions, viewport: { x: 80, y: 90, zoom: 1 }, nodeStyles: {} } });
  return [parent, child];
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(res => { resolve = res; }); return { promise, resolve }; }
async function settle() { await act(async () => { await new Promise(res => setTimeout(res, 10)); }); }
async function mount(nodes = fixture(), props = ctx) {
  mocks.soi.mockImplementation(async () => ({ nodes: structuredClone(nodes), soi: "1", systemHid: props.soiHid }));
  await act(async () => root.render(createElement(QueryClientProvider, { client: qc }, createElement(GoalKeeperTool, { ctx: props, manifest: {} as ToolManifest }))));
  await settle(); await settle();
}
function button(label: string) { const result = [...host.querySelectorAll("button")].find(el => el.textContent?.trim() === label); if (!result) throw new Error(`Missing button ${label}: ${host.textContent}`); return result; }
function click(label: string) { act(() => button(label).click()); }
function input(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  act(() => { const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(element, value); element.dispatchEvent(new Event("input", { bubbles: true })); });
}
function pointer(target: Element, event: string, x: number, y: number) { const e = new MouseEvent(event, { bubbles: true, button: 0, clientX: x, clientY: y }); Object.defineProperty(e, "pointerId", { value: 1 }); target.dispatchEvent(e); }
beforeEach(() => {
  vi.clearAllMocks(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 1; }); vi.stubGlobal("cancelAnimationFrame", vi.fn());
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 }); Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 600 });
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: function (this: HTMLElement, x: number, y: number) { this.scrollLeft = Math.max(0, x); this.scrollTop = Math.max(0, y); } });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function(this: HTMLElement) {
    const canvas = this.closest('[data-testid="gsn-canvas"], [data-testid="model-canvas"]');
    const isSize = this.classList.contains("sstpa-gk-svg-size");
    return { x: 0, y: 0, left: isSize ? -(canvas?.scrollLeft ?? 0) : 0, top: isSize ? -(canvas?.scrollTop ?? 0) : 0, right: 800, bottom: 600, width: 800, height: 600, toJSON: () => ({}) };
  });
  for (const name of ["setPointerCapture", "releasePointerCapture"]) Object.defineProperty(HTMLElement.prototype, name, { configurable: true, value: () => {} });
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", { configurable: true, value: () => true });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; } });
  mocks.layout.mockResolvedValue(positions); mocks.commit.mockResolvedValue({ commitId: "test" });
  useDrawer.setState({ open: false, request: null }); document.documentElement.dataset.sstpaStyle = "default";
  qc = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); qc.clear(); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("production Goal Keeper UI state and scope", () => {
  it("initializes a missing saved layout with ELK once, blocks pending interaction and remains clean", async () => {
    const pending = deferred<typeof positions>(); mocks.layout.mockReturnValue(pending.promise);
    await mount(fixture(false));
    expect(mocks.layout).toHaveBeenCalledTimes(1);
    expect(button("Fit argument").disabled).toBe(true);
    expect(host.querySelector('[data-testid="gsn-canvas"] [role="button"]')).toBeNull();
    await act(async () => pending.resolve(positions)); await settle();
    expect(host.querySelector('[data-node-id="G_1_2"]')?.getAttribute("transform")).toBe("translate(500 600)");
    expect(button("Fit argument").disabled).toBe(false);
    expect(button("Commit presentation").disabled).toBe(true);
    expect(host.textContent).not.toContain("Uncommitted changes");
    expect(mocks.commit).not.toHaveBeenCalled();
    qc.setQueryData(["soi", "SYS_1_0"], { nodes: fixture(false), soi: "1", systemHid: "SYS_1_0" }); await settle();
    expect(mocks.layout).toHaveBeenCalledTimes(1);
  });
  it("retains a node draft and blocks palette, camera and other Core mutations until Commit or explicit Revert", async () => {
    await mount(); expect(mocks.layout).not.toHaveBeenCalled(); click("Show inspector");
    const name = host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!; input(name, "My retained draft");
    for (const label of ["Node type colors", "Fit argument", "100%", "Create", "Delete Node", "Open Drawer", "Commit Remove"]) expect(button(label).disabled).toBe(true);
    expect(button("Commit Node").disabled).toBe(false);
    const canvas = host.querySelector('[data-testid="gsn-canvas"]')!;
    const original = canvas.scrollLeft;
    act(() => { pointer(canvas, "pointerdown", 10, 10); pointer(canvas, "pointermove", 100, 100); pointer(canvas, "pointerup", 100, 100); });
    expect(canvas.scrollLeft).toBe(original); expect(mocks.commit).not.toHaveBeenCalled();
    mocks.commit.mockRejectedValueOnce(new Error("Rejected by Core")); click("Commit Node"); await settle();
    expect(name.value).toBe("My retained draft"); expect(host.textContent).toContain("Rejected by Core");
    click("Revert node edit");
    expect(name.value).toBe("Review argument"); expect(button("Node type colors").disabled).toBe(false);
    expect(host.textContent).not.toContain("Uncommitted changes");
  });
  it("asks before workspace reload discards a node draft and Cancel preserves it", async () => {
    await mount(); click("Show inspector"); const name = host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!; input(name, "Unsaved");
    const before = mocks.soi.mock.calls.length; click("Revert / reload");
    expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); expect(mocks.soi).toHaveBeenCalledTimes(before);
    click("Cancel"); expect(name.value).toBe("Unsaved");
    click("Revert / reload"); click("Discard and reload"); await settle();
    expect(host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!.value).toBe("Review argument");
  });
  it("uses canonical argument scope for canvas/export and opens other arguments only in the Core drawer", async () => {
    const nodes = fixture(); const other = node("G_1_9", "GsnGoal", { Name: "Other argument", GoalID: 9 });
    nodes[0].relationships.push({ type: "HAS_LOSS", targetHID: other.hid, targetUUID: other.uuid, props: {} }); nodes.push(other);
    await mount(nodes); expect(host.querySelectorAll("[data-node-id]")).toHaveLength(2);
    click("Show argument outline"); expect(host.textContent).toContain("G1 Review argument");
    click("Validation !"); expect(host.textContent).toContain("Other GSN nodes in this SoI");
    click("G_1_9 Other argument"); expect(useDrawer.getState().request).toEqual({ mode: "edit", hid: "G_1_9" });
    click("Export"); click("JSON");
    const exported = JSON.parse(mocks.download.mock.calls.at(-1)![1]);
    expect(exported.gsnNodes.map((n: SoINode) => n.hid)).toEqual(["G_1_1", "G_1_2"]);
    expect(exported.relationships).toEqual([{ source: "G_1_1", target: "G_1_2", type: "SUPPORTED_BY" }]);
    click("Markdown"); expect(mocks.download.mock.calls.at(-1)![1]).toContain("_Undeveloped_");
  });
  it("retains dirty palette and blocks all canvas changes after accepted commit with failed reload", async () => {
    await mount(); click("Node type colors"); input(host.querySelector<HTMLInputElement>('input[aria-label="Fill color"]')!, "#aabbcc"); click("Done");
    expect(button("Commit presentation").disabled).toBe(false); mocks.soi.mockRejectedValueOnce(new Error("Network lost")); click("Commit presentation"); await settle();
    expect(host.textContent).toContain("COMMIT SUCCEEDED"); expect(button("Fit argument").disabled).toBe(true); expect(button("Node type colors").disabled).toBe(true);
    expect(host.querySelector('[data-node-id="G_1_1"] [data-symbol]')?.getAttribute("fill")).toBe("#aabbcc");
    expect(button("Reload committed").disabled).toBe(false); expect(mocks.commit).toHaveBeenCalledTimes(1);
  });
  it("validates numeric display identifiers within the current argument and preserves canonical HIDs", async () => {
    const nodes = fixture(); nodes.push(node("G_1_12", "GsnGoal", { GoalID: 12 }));
    await mount(nodes); click("Show inspector");
    const id = host.querySelector<HTMLInputElement>('input[aria-label="GSN identifier"]')!;
    input(id, "1.5"); expect(button("Commit Node").disabled).toBe(true); expect(host.textContent).toContain("positive whole number");
    input(id, "2"); expect(button("Commit Node").disabled).toBe(true); expect(host.textContent).toContain("already used");
    input(id, "12"); expect(button("Commit Node").disabled).toBe(false); click("Commit Node"); await settle();
    const operation = mocks.commit.mock.calls[0][0].operations[0];
    expect(operation.hid).toBe("G_1_1"); expect(operation.properties.GoalID).toBe(12);
    expect(operation.properties).not.toHaveProperty("hid");
  });
  it("allocates the next unused per-type identifier across the loaded SoI", async () => {
    const nodes = fixture(); nodes.push(node("G_1_3", "GsnGoal", { GoalID: 3 }));
    await mount(nodes); click("Show inspector"); click("Create"); await settle();
    const creation = mocks.commit.mock.calls[0][0].operations[0];
    expect(creation).toMatchObject({ op: "createNode", label: "GsnGoal", properties: { GoalID: 4, Undeveloped: true } });
  });
  it("tracks a boundary node through drag/release without camera publication loops", async () => {
    await mount();
    const canvas = host.querySelector('[data-testid="gsn-canvas"]')!;
    const origin = () => {
      const svg = canvas.querySelector("svg")!, vb = svg.getAttribute("viewBox")!.split(" ").map(Number);
      const offset = svg.parentElement as HTMLElement;
      const coordinates = canvas.querySelector('[data-node-id="G_1_1"]')!.getAttribute("transform")!.match(/translate\(([-\d.]+) ([-\d.]+)\)/)!;
      return { x: Number(coordinates[1]) - vb[0] + parseFloat(offset.style.left) - canvas.scrollLeft, y: Number(coordinates[2]) - vb[1] + parseFloat(offset.style.top) - canvas.scrollTop };
    };
    const before = origin();
    act(() => pointer(canvas.querySelector('[data-node-id="G_1_1"]')!, "pointerdown", 200, 200));
    act(() => pointer(canvas, "pointermove", 140, 130)); const during = origin();
    act(() => pointer(canvas, "pointerup", 140, 130));
    expect(origin()).toEqual(during); expect(during.x - before.x).toBe(-60); expect(during.y - before.y).toBe(-70);
    expect(button("Commit presentation").disabled).toBe(false);
  });
  it("keeps a dirty draft attached to its original SoI and blocks close until explicit discard", async () => {
    await mount(); click("Show inspector"); input(host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!, "Pinned draft");
    await act(async () => root.render(createElement(QueryClientProvider, { client: qc }, createElement(GoalKeeperTool, { ctx: { ...ctx, soiHid: "SYS_2_0" }, manifest: {} as ToolManifest }))));
    expect(host.textContent).toContain("This draft belongs to SYS_1_0");
    expect(mocks.soi.mock.calls.every(call => call[0] === "SYS_1_0")).toBe(true);
    const close = new Event("sstpa.goalkeeper.request-close", { cancelable: true }); act(() => window.dispatchEvent(close));
    expect(close.defaultPrevented).toBe(true); expect(host.querySelector('[role="alertdialog"]')).not.toBeNull(); click("Cancel");
    expect(host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!.value).toBe("Pinned draft");
  });
  it.each(["node", "presentation"] as const)("retains a %s draft when a background Core refresh removes its root", async kind => {
    await mount();
    if (kind === "node") {
      click("Show inspector"); input(host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!, "Draft must survive source removal");
    } else {
      click("Node type colors"); input(host.querySelector<HTMLInputElement>('input[aria-label="Fill color"]')!, "#aabbcc"); click("Done");
    }
    // A real React Query replacement arrives while the workspace owns a draft.
    act(() => qc.setQueryData(["soi", "SYS_1_0"], { nodes: fixture().slice(1), soi: "1", systemHid: "SYS_1_0" }));
    await settle();
    const selector = host.querySelector<HTMLSelectElement>("#sstpa-gk-root")!;
    expect(selector.value).toBe("G_1_1"); expect(selector.disabled).toBe(true);
    expect(host.textContent).toContain("absent from the latest Core response");
    expect(host.querySelectorAll("[data-node-id]")).toHaveLength(2);
    if (kind === "node") expect(host.querySelector<HTMLInputElement>('input[aria-label="Node name"]')!.value).toBe("Draft must survive source removal");
    else expect(host.querySelector('[data-node-id="G_1_1"] [data-symbol]')?.getAttribute("fill")).toBe("#aabbcc");
    expect(mocks.commit).not.toHaveBeenCalled();
    click("Revert / reload"); click("Cancel");
    expect(host.querySelector<HTMLSelectElement>("#sstpa-gk-root")!.value).toBe("G_1_1");
    expect(host.textContent).toContain("Uncommitted changes");
  });
  it("retains a pending commit and its reload failure notice if background Core removes its root", async () => {
    const pending = deferred<{ commitId: string }>();
    mocks.commit.mockReturnValueOnce(pending.promise);
    await mount(); click("Show inspector"); click("Create");
    expect(button("Create").matches(":disabled")).toBe(true);
    act(() => qc.setQueryData(["soi", "SYS_1_0"], { nodes: fixture().slice(1), soi: "1", systemHid: "SYS_1_0" }));
    await settle();
    expect(host.querySelectorAll("[data-node-id]")).toHaveLength(2);
    expect(host.querySelector<HTMLSelectElement>("#sstpa-gk-root")!.value).toBe("G_1_1");
    // No dirty node draft existed before this immediate Create transaction.
    expect(mocks.commit).toHaveBeenCalledTimes(1);
    mocks.soi.mockRejectedValueOnce(new Error("Core reload unavailable"));
    await act(async () => pending.resolve({ commitId: "accepted" }));
    await settle();
    expect(host.textContent).toContain("COMMIT SUCCEEDED, but reload failed");
    expect(host.querySelector<HTMLSelectElement>("#sstpa-gk-root")!.value).toBe("G_1_1");
    expect(host.querySelectorAll("[data-node-id]")).toHaveLength(2);
    expect(button("Reload committed").disabled).toBe(false);
    expect(mocks.commit).toHaveBeenCalledTimes(1);
  });
  it("presents an actionable duplicate-HID error instead of crashing the workspace", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {}); const nodes = fixture(); nodes.push({ ...nodes[0] });
    await mount(nodes); expect(host.textContent).toContain("duplicate canonical HID"); expect(host.textContent).toContain("refresh or repair"); expect(mocks.commit).not.toHaveBeenCalled(); spy.mockRestore();
  });
});

describe("production four-channel selector", () => {
  it("offers six types, keeps low-contrast choices, resets overrides and restores focus on close", async () => {
    const styles = {}, change = vi.fn(), close = vi.fn(); const trigger = document.createElement("button"); document.body.append(trigger); trigger.focus();
    act(() => root.render(createElement(ColorsDialog, { styles, theme: "light", onChange: change, onClose: close })));
    expect(host.querySelectorAll("option")).toHaveLength(6); expect(host.querySelectorAll('input[type="color"]')).toHaveLength(4);
    input(host.querySelector<HTMLInputElement>('input[aria-label="Fill color"]')!, "#123456");
    expect(change.mock.calls.at(-1)![0].GsnGoal.box).toBe("#123456");
    click("Reset default colors"); expect(change.mock.calls.at(-1)![0]).toEqual({});
    const dialog = host.querySelector("dialog")!;
    act(() => dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }))); expect(close).toHaveBeenCalled();
    act(() => root.render(null)); expect(document.activeElement).toBe(trigger); trigger.remove();
  });
});

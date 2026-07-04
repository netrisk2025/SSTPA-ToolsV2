// Zustand UI state stores (SRS §6.1).
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { create } from "zustand";
import type { UserIdentity } from "../api/types";
import { setToken } from "../api/client";

/** Session: authenticated user + backend connection status (SRS §6.3.1). */
interface SessionState {
  user: UserIdentity | null;
  token: string | null;
  connected: boolean;
  backendInfo: { version: string; schemaVersion: string } | null;
  login: (user: UserIdentity, token: string) => void;
  logout: () => void;
  setConnected: (
    connected: boolean,
    info?: { version: string; schemaVersion: string },
  ) => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  token: null,
  connected: false,
  backendInfo: null,
  login: (user, token) => {
    setToken(token);
    set({ user, token });
  },
  logout: () => {
    setToken(null);
    set({ user: null, token: null });
  },
  setConnected: (connected, info) =>
    set((s) => ({ connected, backendInfo: info ?? s.backendInfo })),
}));

/** Current System of Interest (SRS §6.3.3). Null → "Select a System of Interest". */
interface SoIState {
  soiHid: string | null;
  setSoI: (hid: string | null) => void;
}

export const useSoI = create<SoIState>((set) => ({
  soiHid: null,
  setSoI: (hid) => set({ soiHid: hid }),
}));

/** Data Drawer: the single edit surface (SRS §6.3.5). Only one drawer at a
 *  time; staged edits live here until Commit. */
export interface DrawerRequest {
  mode: "edit" | "create";
  hid?: string; // edit mode
  label?: string; // create mode
  /** relationship to create from a parent on commit (create mode) */
  linkFrom?: { sourceHid: string; type: string };
}

interface DrawerState {
  open: boolean;
  request: DrawerRequest | null;
  staged: Record<string, unknown>;
  stagedRelDeletes: { type: string; targetHid: string }[];
  dirty: boolean;
  openDrawer: (req: DrawerRequest) => void;
  closeDrawer: () => void;
  stageProperty: (name: string, value: unknown) => void;
  stageRelDelete: (type: string, targetHid: string) => void;
  unstageRelDelete: (type: string, targetHid: string) => void;
  resetStaged: () => void;
}

export const useDrawer = create<DrawerState>((set) => ({
  open: false,
  request: null,
  staged: {},
  stagedRelDeletes: [],
  dirty: false,
  openDrawer: (req) =>
    set({ open: true, request: req, staged: {}, stagedRelDeletes: [], dirty: false }),
  closeDrawer: () =>
    set({ open: false, request: null, staged: {}, stagedRelDeletes: [], dirty: false }),
  stageProperty: (name, value) =>
    set((s) => ({ staged: { ...s.staged, [name]: value }, dirty: true })),
  stageRelDelete: (type, targetHid) =>
    set((s) => ({
      stagedRelDeletes: [...s.stagedRelDeletes, { type, targetHid }],
      dirty: true,
    })),
  unstageRelDelete: (type, targetHid) =>
    set((s) => ({
      stagedRelDeletes: s.stagedRelDeletes.filter(
        (d) => !(d.type === type && d.targetHid === targetHid),
      ),
    })),
  resetStaged: () => set({ staged: {}, stagedRelDeletes: [], dirty: false }),
}));

/** Open Add-on Tool windows/panels (SRS §6.4). */
interface ToolWindowState {
  openTools: string[]; // ToolIDs currently open
  openTool: (toolId: string) => void;
  closeTool: (toolId: string) => void;
}

export const useToolWindows = create<ToolWindowState>((set) => ({
  openTools: [],
  openTool: (toolId) =>
    set((s) => ({
      openTools: s.openTools.includes(toolId)
        ? s.openTools
        : [...s.openTools, toolId],
    })),
  closeTool: (toolId) =>
    set((s) => ({ openTools: s.openTools.filter((t) => t !== toolId) })),
}));

/** Under Construction alert (SRS §6.3.2). */
interface UnderConstructionState {
  visible: boolean;
  feature: string;
  show: (feature: string) => void;
  hide: () => void;
}

export const useUnderConstruction = create<UnderConstructionState>((set) => ({
  visible: false,
  feature: "",
  show: (feature) => set({ visible: true, feature }),
  hide: () => set({ visible: false, feature: "" }),
}));

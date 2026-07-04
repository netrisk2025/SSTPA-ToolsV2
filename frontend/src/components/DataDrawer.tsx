// Main Panel Data Drawer (SRS §6.3.5): the single edit surface of the GUI.
// Slides in from the right without obscuring Branding/Control panels; stages
// all edits; persists only after Commit confirmation; property groups and
// editability are driven by the Backend schema (SRS §3.3.9/§3.3.10).
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import type { CommitResponse, PropertyDef, PropertyGroup } from "../api/types";
import { useDrawer, useSession, useSoI } from "../state/stores";
import { ConfirmDialog } from "./ConfirmDialog";
import { NodeTypeBadge } from "./NodeTypeBadge";

export function DataDrawer() {
  const drawer = useDrawer();
  if (!drawer.open || !drawer.request) return null;
  return (
    <AnimatePresence>
      <motion.aside
        key="drawer"
        className="data-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: [0.33, 0.9, 0.35, 1] }}
      >
        <DrawerContent />
      </motion.aside>
    </AnimatePresence>
  );
}

function DrawerContent() {
  const drawer = useDrawer();
  const req = drawer.request!;
  const soiHid = useSoI((s) => s.soiHid);
  const { user } = useSession();
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CommitResponse | null>(null);

  const isEdit = req.mode === "edit";

  const node = useQuery({
    queryKey: ["node", req.hid],
    queryFn: () => api.nodeByHid(req.hid!),
    enabled: isEdit && !!req.hid,
  });

  const label = isEdit ? (node.data?.typeName ?? "") : (req.label ?? "");

  const schema = useQuery({
    queryKey: ["schema", label],
    queryFn: () => api.schemaNodeType(label),
    enabled: !!label,
  });

  const commit = useMutation({
    mutationFn: async () => {
      const ops = [];
      if (isEdit) {
        if (Object.keys(drawer.staged).length > 0) {
          ops.push({
            op: "updateNode" as const,
            hid: req.hid!,
            properties: drawer.staged,
          });
        }
        for (const del of drawer.stagedRelDeletes) {
          ops.push({
            op: "deleteRelationship" as const,
            type: del.type,
            sourceHid: req.hid!,
            targetHid: del.targetHid,
          });
        }
      } else {
        ops.push({
          op: "createNode" as const,
          tempId: "new",
          label,
          properties: drawer.staged,
        });
        if (req.linkFrom) {
          ops.push({
            op: "createRelationship" as const,
            type: req.linkFrom.type,
            sourceHid: req.linkFrom.sourceHid,
            targetHid: "$new",
          });
        } else if (label === "System") {
          // Tier-1 system: attach to the Capability root when one exists.
          const hierarchy = await api.hierarchy();
          const cap = (hierarchy.entries ?? []).find(
            (e) => e.typeName === "Project",
          );
          if (cap) {
            ops.push({
              op: "createRelationship" as const,
              type: "HAS_SYSTEM",
              sourceHid: cap.hid,
              targetHid: "$new",
            });
          }
        }
      }
      return api.commit({
        soiHid: soiHid ?? undefined,
        toolId: "gui.datadrawer",
        operations: ops,
      });
    },
    onSuccess: (res) => {
      setResult(res);
      setConfirming(false);
      void qc.invalidateQueries({ queryKey: ["soi"] });
      void qc.invalidateQueries({ queryKey: ["hierarchy"] });
      void qc.invalidateQueries({ queryKey: ["node"] });
    },
    onError: (e) => {
      setConfirming(false);
      setError(e instanceof ApiError ? `${e.message}: ${e.detail ?? ""}` : String(e));
    },
  });

  // Merge staged edits over persisted values for display.
  const currentValue = (name: string): unknown => {
    if (name in drawer.staged) return drawer.staged[name];
    if (isEdit) return node.data?.properties?.[name];
    return undefined;
  };

  const groups: PropertyGroup[] = useMemo(() => {
    if (!schema.data) return [];
    return [
      ...(schema.data.commonPropertyGroups ?? []),
      ...(schema.data.propertyGroups ?? []),
    ];
  }, [schema.data]);

  const ownedByOther =
    isEdit &&
    node.data &&
    String(node.data.properties.Owner ?? "") !== user?.userName &&
    String(node.data.properties.Owner ?? "") !== "";

  const title = isEdit
    ? String(node.data?.properties?.Name ?? req.hid)
    : `New ${label || "node"}`;

  return (
    <>
      <div className="drawer-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {label && <NodeTypeBadge typeName={label} />}
          <span className="drawer-title">{title}</span>
          <span style={{ flex: 1 }} />
          <button
            className="icon-button"
            title="Close without saving"
            onClick={drawer.closeDrawer}
          >
            ✕
          </button>
        </div>
        {isEdit && <div className="entity-hid mono">{req.hid}</div>}
      </div>

      <div className="drawer-body">
        {error && <div className="sstpa-alert-warning">{error}</div>}
        {result && (
          <div
            className="sstpa-alert-warning"
            style={{
              borderColor: "var(--sstpa-status-ok)",
              color: "var(--sstpa-status-ok)",
              background: "#eef6ef",
            }}
          >
            Commit {result.commitId.slice(0, 8)} succeeded: {result.nodesChanged}{" "}
            node(s), {result.relationshipsChanged} relationship(s) changed
            {result.messagesGenerated > 0 &&
              `; ${result.messagesGenerated} owner notification(s) sent to ${(result.recipientsNotified ?? []).join(", ")}`}
            .
          </div>
        )}
        {schema.isLoading && <p>Loading schema…</p>}
        {groups.map((g) => (
          <DrawerPropertyGroup
            key={g.groupName}
            group={g}
            currentValue={currentValue}
            isCreate={!isEdit}
            isAdmin={user?.isAdmin ?? false}
          />
        ))}
        {isEdit && node.data && <DrawerRelationships hid={req.hid!} />}
      </div>

      <div className="drawer-footer">
        <button
          className="sstpa-button"
          disabled={!drawer.dirty || commit.isPending}
          onClick={() => setConfirming(true)}
        >
          Commit
        </button>
        <button
          className="sstpa-button secondary"
          onClick={() => {
            drawer.resetStaged();
            setError(null);
          }}
        >
          Cancel
        </button>
        <span style={{ flex: 1 }} />
        {drawer.dirty && (
          <span style={{ fontSize: "0.75rem", color: "var(--sstpa-status-warn)" }}>
            Uncommitted changes
          </span>
        )}
      </div>

      {confirming && (
        <ConfirmDialog
          title="Commit changes?"
          confirmLabel="Commit"
          onCancel={() => setConfirming(false)}
          onConfirm={() => commit.mutate()}
        >
          <p>
            {Object.keys(drawer.staged).length} propert
            {Object.keys(drawer.staged).length === 1 ? "y" : "ies"} staged
            {drawer.stagedRelDeletes.length > 0 &&
              `, ${drawer.stagedRelDeletes.length} relationship removal(s)`}
            . Changes are validated by the Backend before commit.
          </p>
          {ownedByOther && (
            <div className="sstpa-alert-warning">
              This node is owned by{" "}
              {String(node.data?.properties.Owner ?? "another user")}. Owner
              notification messages will be generated, and ownership will
              transfer to you.
            </div>
          )}
        </ConfirmDialog>
      )}
    </>
  );
}

function DrawerPropertyGroup({
  group,
  currentValue,
  isCreate,
  isAdmin,
}: {
  group: PropertyGroup;
  currentValue: (name: string) => unknown;
  isCreate: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(true);
  const stageProperty = useDrawer((s) => s.stageProperty);

  const editable = (p: PropertyDef): boolean => {
    const e = p.edit?.toLowerCase() ?? "fixed";
    if (e.startsWith("edit")) return true;
    if (e.includes("admin")) return isAdmin;
    // fixed properties are set by the system; on create the user still can't
    // provide them (HID, uuid, timestamps are backend-assigned).
    return false;
  };

  return (
    <div className="prop-group">
      <div
        className="prop-group-header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        aria-expanded={open}
      >
        <span>{open ? "▾" : "▸"}</span>
        {group.groupName}
      </div>
      {open && (
        <div className="prop-group-body">
          {group.properties.map((p) => {
            const value = currentValue(p.name);
            const display =
              value === undefined || value === null || value === ""
                ? "Null"
                : String(value);
            const canEdit = editable(p);
            if (!canEdit && isCreate) return null;
            return (
              <div className="prop-row" key={p.name}>
                <label className="prop-label" title={p.name}>
                  {p.displayName?.replace(/:\s*$/, "") || p.name}
                </label>
                {canEdit ? (
                  <PropertyEditor
                    def={p}
                    value={value}
                    onChange={(v) => stageProperty(p.name, v)}
                  />
                ) : (
                  <span className="prop-value fixed">{display}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PropertyEditor({
  def,
  value,
  onChange,
}: {
  def: PropertyDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const t = def.type?.toLowerCase() ?? "string";
  if (t === "boolean") {
    return (
      <input
        type="checkbox"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }
  if (t === "enum" && def.enumValues && def.enumValues.length > 0) {
    return (
      <select
        className="sstpa-input"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      >
        <option value="">Null</option>
        {def.enumValues.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    );
  }
  if (t === "integer" || t === "float") {
    return (
      <input
        className="sstpa-input"
        type="number"
        step={t === "integer" ? 1 : "any"}
        value={value == null ? "" : String(value)}
        onChange={(e) =>
          onChange(
            e.target.value === ""
              ? null
              : t === "integer"
                ? parseInt(e.target.value, 10)
                : parseFloat(e.target.value),
          )
        }
      />
    );
  }
  const s = value == null ? "" : String(value);
  if (s.length > 60 || t === "json") {
    return (
      <textarea
        className="sstpa-input"
        rows={3}
        value={s}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      />
    );
  }
  return (
    <input
      className="sstpa-input"
      value={s}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    />
  );
}

/** Relationship groups in the drawer (SRS §6.3.5.5): related nodes with
 *  HID/Name/ShortDescription, Add / Associate / Remove actions, transition
 *  property display, and out-of-SoI navigation alerts (§6.3.5.8). */
function DrawerRelationships({ hid }: { hid: string }) {
  const soiHid = useSoI((s) => s.soiHid);
  const drawer = useDrawer();
  const [alertHid, setAlertHid] = useState<string | null>(null);

  const soi = useQuery({
    queryKey: ["soi", soiHid],
    queryFn: () => api.soi(soiHid!),
    enabled: !!soiHid,
  });

  const me = (soi.data?.nodes ?? []).find((n) => n.hid === hid);
  const byHid = new Map((soi.data?.nodes ?? []).map((n) => [n.hid, n]));
  if (!me) return null;

  const groups = new Map<
    string,
    { targetHid: string; props: Record<string, unknown> }[]
  >();
  for (const rel of me.relationships ?? []) {
    if (!rel.type) continue;
    const list = groups.get(rel.type) ?? [];
    list.push({ targetHid: rel.targetHID, props: rel.props ?? {} });
    groups.set(rel.type, list);
  }

  return (
    <div className="prop-group">
      <div className="prop-group-header">Relationships</div>
      <div className="prop-group-body">
        {groups.size === 0 && (
          <span style={{ fontSize: "0.8rem", color: "var(--sstpa-navy-muted)" }}>
            No outgoing relationships.
          </span>
        )}
        {[...groups.entries()].map(([type, targets]) => (
          <div key={type}>
            <div className="rel-name" style={{ marginBottom: 4 }}>
              [:{type}] ({targets.length})
            </div>
            {targets.map(({ targetHid, props }) => {
              const target = byHid.get(targetHid);
              const pendingDelete = drawer.stagedRelDeletes.some(
                (d) => d.type === type && d.targetHid === targetHid,
              );
              return (
                <div
                  key={targetHid}
                  className="prop-row"
                  style={pendingDelete ? { opacity: 0.45 } : undefined}
                >
                  <span className="prop-value mono" style={{ fontSize: "0.72rem" }}>
                    {targetHid}
                  </span>
                  <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span className="entity-desc" style={{ flex: 1 }}>
                      {target
                        ? String(target.properties.Name ?? "")
                        : "(outside SoI)"}
                    </span>
                    {!target && (
                      <button
                        className="icon-button"
                        title="Navigate to edit"
                        onClick={() => setAlertHid(targetHid)}
                      >
                        ↗
                      </button>
                    )}
                    {type === "TRANSITIONS_TO" && (
                      <span className="rel-name" style={{ fontSize: "0.62rem" }}>
                        {String(props.TransitionKind ?? "FUNCTIONAL")}
                      </span>
                    )}
                    {pendingDelete ? (
                      <button
                        className="icon-button"
                        onClick={() => drawer.unstageRelDelete(type, targetHid)}
                      >
                        undo
                      </button>
                    ) : (
                      <button
                        className="icon-button danger"
                        title="Remove relationship (staged until Commit)"
                        onClick={() => drawer.stageRelDelete(type, targetHid)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {alertHid && (
        <ConfirmDialog
          title="Outside current SoI"
          confirmLabel="Copy HID"
          onCancel={() => setAlertHid(null)}
          onConfirm={() => {
            void navigator.clipboard.writeText(alertHid);
            setAlertHid(null);
          }}
        >
          <p>
            Navigate to: <span className="mono">{alertHid}</span> to edit. The
            HID can be copied and pasted into the SoI Navigator.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}

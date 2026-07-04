// Admin Tool (SRS §6.5.15, §3.2, §3.2.1): user enrollment/disenrollment,
// admin flag management, ownership transfer on disenrollment.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api/client";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

export default function AdminTool({ ctx }: { ctx: ToolLaunchContext; manifest: ToolManifest }) {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: api.listUsers });
  const [enrolling, setEnrolling] = useState(false);
  const [disenrolling, setDisenrolling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => void qc.invalidateQueries({ queryKey: ["admin-users"] });

  const setAdmin = useMutation({
    mutationFn: ({ userName, isAdmin }: { userName: string; isAdmin: boolean }) =>
      api.updateUser(userName, { isAdmin }),
    onSuccess: refresh,
    onError: (e) => setError(String(e)),
  });

  if (!ctx.isAdmin) {
    return <p style={{ padding: 20 }}>Admin privileges required (SRS §3.2).</p>;
  }

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--sstpa-navy-muted)" }}>
          Onboarding and account management (SRS §3.2.1)
        </span>
        <span style={{ flex: 1 }} />
        <button className="sstpa-button" onClick={() => setEnrolling(true)}>
          + Enroll user
        </button>
      </div>
      {error && (
        <div className="sstpa-alert-warning" style={{ margin: 8 }}>
          {error}
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--sstpa-navy)" }}>
              <th style={{ padding: "6px 12px" }}>User</th>
              <th>Email</th>
              <th>Created</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(users.data?.users ?? []).map((u) => {
              const name = String(u.userName);
              const isRoot = u.isRootAdmin === true;
              const isAdmin = u.isAdmin === true;
              return (
                <tr key={name} style={{ borderBottom: "1px solid var(--sstpa-line-soft)" }}>
                  <td style={{ padding: "6px 12px", fontWeight: 600 }}>{name}</td>
                  <td>{String(u.email ?? "")}</td>
                  <td className="mono" style={{ fontSize: "0.72rem" }}>
                    {String(u.createDate ?? "").slice(0, 10)}
                  </td>
                  <td>
                    {isRoot ? (
                      <span className="type-badge" style={{ background: "var(--sstpa-navy)" }}>
                        RootAdmin
                      </span>
                    ) : (
                      <label style={{ fontSize: "0.8rem" }}>
                        <input
                          type="checkbox"
                          checked={isAdmin}
                          onChange={(e) =>
                            setAdmin.mutate({ userName: name, isAdmin: e.target.checked })
                          }
                        />{" "}
                        Admin
                      </label>
                    )}
                  </td>
                  <td>
                    {!isRoot && (
                      <button
                        className="icon-button danger"
                        onClick={() => setDisenrolling(name)}
                      >
                        Disenroll…
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {enrolling && (
        <EnrollDialog
          onClose={() => {
            setEnrolling(false);
            refresh();
          }}
        />
      )}
      {disenrolling && (
        <DisenrollDialog
          userName={disenrolling}
          candidates={(users.data?.users ?? [])
            .filter((u) => String(u.userName) !== disenrolling && u.isRootAdmin !== true)
            .map((u) => String(u.userName))}
          onClose={() => {
            setDisenrolling(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function EnrollDialog({ onClose }: { onClose: () => void }) {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => api.createUser({ userName, password, email, isAdmin }),
    onSuccess: onClose,
    onError: (e) => setError(String(e)),
  });

  return (
    <div className="sstpa-dialog-overlay" onClick={onClose}>
      <div className="sstpa-frame sstpa-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Enroll new user</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: "0.8rem" }}>
            User name
            <input className="sstpa-input" value={userName} onChange={(e) => setUserName(e.target.value)} autoFocus />
          </label>
          <label style={{ fontSize: "0.8rem" }}>
            Email
            <input className="sstpa-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ fontSize: "0.8rem" }}>
            Initial password
            <input className="sstpa-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label style={{ fontSize: "0.8rem" }}>
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} /> Admin
          </label>
          {error && <div className="sstpa-alert-warning">{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="sstpa-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="sstpa-button"
              disabled={!userName || !email || !password || create.isPending}
              onClick={() => create.mutate()}
            >
              Enroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisenrollDialog({
  userName,
  candidates,
  onClose,
}: {
  userName: string;
  candidates: string[];
  onClose: () => void;
}) {
  const [transferTo, setTransferTo] = useState(candidates[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  const disenroll = useMutation({
    mutationFn: () => api.updateUser(userName, { disenroll: true, transferTo }),
    onSuccess: onClose,
    onError: (e) => setError(String(e)),
  });

  return (
    <ConfirmDialog
      title={`Disenroll ${userName}?`}
      confirmLabel="Disenroll"
      danger
      onCancel={onClose}
      onConfirm={() => disenroll.mutate()}
    >
      <p>
        All data owned by <strong>{userName}</strong> will be transferred
        (SRS §3: Admins SHALL transfer ownership of data from the disenrolled
        User).
      </p>
      <label style={{ fontSize: "0.85rem" }}>
        Transfer ownership to{" "}
        <select
          className="sstpa-input"
          style={{ width: "auto", display: "inline-block" }}
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
        >
          {candidates.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {candidates.length === 0 && (
        <div className="sstpa-alert-warning">
          No other user available to receive ownership — enroll a replacement
          first.
        </div>
      )}
      {error && <div className="sstpa-alert-warning">{error}</div>}
    </ConfirmDialog>
  );
}

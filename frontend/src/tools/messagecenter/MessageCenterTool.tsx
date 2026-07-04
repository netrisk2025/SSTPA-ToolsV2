// Message Center (SRS §6.5.14, §3.2.4, §5.6.6.11): inbox/outbox with sort,
// read/unread, reply (quoting the original), compose, delete.
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../api/client";
import type { ToolLaunchContext, ToolManifest } from "../manifest";

export default function MessageCenterTool({ ctx }: { ctx: ToolLaunchContext; manifest: ToolManifest }) {
  const qc = useQueryClient();
  const [box, setBox] = useState<"inbox" | "outbox">("inbox");
  const [sort, setSort] = useState("datetime");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [openId, setOpenId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const messages = useQuery({
    queryKey: ["messages", box, sort, order],
    queryFn: () => api.messages({ box, sort, order }),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["messages"] });
    void qc.invalidateQueries({ queryKey: ["unread-count"] });
  };

  return (
    <div className="tool-shell" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--sstpa-sp-2)",
          alignItems: "center",
          padding: "var(--sstpa-sp-2) var(--sstpa-sp-3)",
          borderBottom: "var(--sstpa-border-soft)",
        }}
      >
        <button
          className={`sstpa-button ${box === "inbox" ? "" : "secondary"}`}
          onClick={() => setBox("inbox")}
        >
          Inbox
        </button>
        <button
          className={`sstpa-button ${box === "outbox" ? "" : "secondary"}`}
          onClick={() => setBox("outbox")}
        >
          Outbox
        </button>
        <span style={{ flex: 1 }} />
        <label style={{ fontSize: "0.78rem" }}>
          Sort{" "}
          <select
            className="sstpa-input"
            style={{ width: "auto", display: "inline-block" }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="datetime">Date</option>
            <option value="subject">Subject</option>
            <option value="sender">Sender</option>
            <option value="hid">HID</option>
          </select>
        </label>
        <button
          className="icon-button"
          title="Toggle sort order"
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
        >
          {order === "asc" ? "↑" : "↓"}
        </button>
        <button className="sstpa-button" onClick={() => setComposing(true)}>
          ✎ New message
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--sstpa-navy)" }}>
              <th style={{ padding: "6px 10px" }}></th>
              <th>Subject</th>
              <th>Type</th>
              <th>{box === "inbox" ? "From" : "To"}</th>
              <th>Date</th>
              <th>HIDs</th>
            </tr>
          </thead>
          <tbody>
            {(messages.data?.messages ?? []).map((m) => (
              <tr
                key={m.messageId}
                style={{
                  borderBottom: "1px solid var(--sstpa-line-soft)",
                  fontWeight: !m.isRead && box === "inbox" ? 700 : 400,
                  cursor: "pointer",
                }}
                onClick={() => setOpenId(m.messageId)}
              >
                <td style={{ padding: "5px 10px" }}>
                  {!m.isRead && box === "inbox" ? "●" : ""}
                </td>
                <td>{m.subject}</td>
                <td>
                  <span className="mono" style={{ fontSize: "0.66rem" }}>
                    {m.messageType}
                  </span>
                </td>
                <td>{box === "inbox" ? m.sender : m.recipient}</td>
                <td className="mono" style={{ fontSize: "0.7rem" }}>
                  {m.sentAt?.slice(0, 19).replace("T", " ")}
                </td>
                <td className="mono" style={{ fontSize: "0.66rem" }}>
                  {(m.relatedNodeHids ?? []).slice(0, 3).join(", ")}
                </td>
              </tr>
            ))}
            {(messages.data?.messages ?? []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "var(--sstpa-navy-muted)" }}>
                  No messages.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openId && (
        <MessageDetail
          messageId={openId}
          isInbox={box === "inbox"}
          onClose={() => {
            setOpenId(null);
            refresh();
          }}
        />
      )}
      {composing && (
        <ComposeDialog
          onClose={() => {
            setComposing(false);
            refresh();
          }}
          sender={ctx.userName}
        />
      )}
    </div>
  );
}

function MessageDetail({
  messageId,
  isInbox,
  onClose,
}: {
  messageId: string;
  isInbox: boolean;
  onClose: () => void;
}) {
  const detail = useQuery({
    queryKey: ["message", messageId],
    queryFn: () => api.message(messageId),
  });
  const [replyBody, setReplyBody] = useState<string | null>(null);
  const qc = useQueryClient();

  const markRead = useMutation({
    mutationFn: () => api.markRead(messageId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["messages"] }),
  });
  const del = useMutation({
    mutationFn: () => api.deleteMessage(messageId),
    onSuccess: onClose,
  });
  const reply = useMutation({
    mutationFn: (body: string) => api.replyMessage(messageId, body),
    onSuccess: onClose,
  });

  const msg = (detail.data?.msg ?? {}) as Record<string, unknown>;
  if (isInbox && detail.data && msg.IsRead === false && !markRead.isPending) {
    markRead.mutate();
  }

  return (
    <div className="sstpa-dialog-overlay" onClick={onClose}>
      <div
        className="sstpa-frame sstpa-dialog"
        style={{ minWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{String(msg.Subject ?? "…")}</h2>
        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--sstpa-navy-muted)" }}>
          {String(msg.MessageType ?? "")} · from {String(msg.Sender ?? "")} to{" "}
          {String(msg.Recipient ?? "")} · {String(msg.SentAt ?? "").slice(0, 19)}
        </p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "var(--sstpa-font-ui)",
            fontSize: "0.85rem",
            background: "var(--sstpa-ivory-sunken)",
            padding: "var(--sstpa-sp-3)",
            borderRadius: "var(--sstpa-radius)",
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          {String(msg.Body ?? "")}
        </pre>
        {Array.isArray(msg.RelatedNodeHIDs) && msg.RelatedNodeHIDs.length > 0 && (
          <p className="mono" style={{ fontSize: "0.72rem" }}>
            Related: {(msg.RelatedNodeHIDs as string[]).join(", ")}
          </p>
        )}
        {replyBody !== null ? (
          <>
            <textarea
              className="sstpa-input"
              rows={4}
              autoFocus
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Reply…"
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="sstpa-button secondary" onClick={() => setReplyBody(null)}>
                Discard
              </button>
              <button
                className="sstpa-button"
                disabled={!replyBody.trim()}
                onClick={() => reply.mutate(replyBody)}
              >
                Send reply
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {isInbox && (
              <button className="sstpa-button secondary" onClick={() => setReplyBody("")}>
                Reply
              </button>
            )}
            <button className="sstpa-button danger" onClick={() => del.mutate()}>
              Delete
            </button>
            <button className="sstpa-button" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ComposeDialog({ onClose }: { onClose: () => void; sender: string }) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: () => api.sendMessage({ recipient, subject, body }),
    onSuccess: onClose,
    onError: (e) => setError(String(e)),
  });

  return (
    <div className="sstpa-dialog-overlay" onClick={onClose}>
      <div
        className="sstpa-frame sstpa-dialog"
        style={{ minWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>New message</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: "0.8rem" }}>
            To (user name)
            <input
              className="sstpa-input"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              autoFocus
            />
          </label>
          <label style={{ fontSize: "0.8rem" }}>
            Subject
            <input
              className="sstpa-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <textarea
            className="sstpa-input"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message body…"
          />
          {error && <div className="sstpa-alert-warning">{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="sstpa-button secondary" onClick={onClose}>
              Discard
            </button>
            <button
              className="sstpa-button"
              disabled={!recipient || !subject || send.isPending}
              onClick={() => send.mutate()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

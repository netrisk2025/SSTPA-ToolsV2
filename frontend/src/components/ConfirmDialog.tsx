// Alert/confirm dialog (SRS §6.3.4.8, §6.3.5).
// 2025 Nicholas Triska. All rights reserved. See NOTICE at repository root.

import type { ReactNode } from "react";

export function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="sstpa-dialog-overlay" onClick={onCancel}>
      <div
        className="sstpa-frame sstpa-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-label={title}
      >
        <h2>{title}</h2>
        <div style={{ fontSize: "0.88rem" }}>{children}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--sstpa-sp-2)",
            marginTop: "var(--sstpa-sp-4)",
          }}
        >
          <button className="sstpa-button secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`sstpa-button ${danger ? "danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** "Under Construction" alert (SRS §6.3.2). */
export function UnderConstructionDialog({
  feature,
  onClose,
}: {
  feature: string;
  onClose: () => void;
}) {
  return (
    <div className="sstpa-dialog-overlay" onClick={onClose}>
      <div
        className="sstpa-frame sstpa-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-label="Under Construction"
      >
        <h2>🚧 Under Construction</h2>
        <p style={{ fontSize: "0.88rem" }}>
          {feature ? `“${feature}” is` : "This feature is"} not yet available in
          this version of SSTPA Tools.
        </p>
        <div style={{ textAlign: "right", marginTop: "var(--sstpa-sp-3)" }}>
          <button className="sstpa-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

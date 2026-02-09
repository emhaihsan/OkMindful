"use client";

import { useState, useCallback } from "react";

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  action: () => void;
}

export function useConfirm() {
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);

  const askConfirm = useCallback(
    (title: string, message: string, confirmLabel: string, confirmColor: string, action: () => void) => {
      setConfirm({ title, message, confirmLabel, confirmColor, action });
    },
    []
  );

  const execute = useCallback(() => {
    if (confirm) confirm.action();
    setConfirm(null);
  }, [confirm]);

  const cancel = useCallback(() => setConfirm(null), []);

  return { confirm, askConfirm, execute, cancel };
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "28px 24px",
          maxWidth: 400,
          width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="h3" style={{ fontSize: 16 }}>
          {title}
        </div>
        <p className="p" style={{ marginTop: 10, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.08)",
              background: "transparent",
              cursor: "pointer",
              color: "var(--ink-soft)",
            }}
          >
            Cancel
          </button>
          <button
            className="neo-btn"
            onClick={onConfirm}
            style={{ background: confirmColor, padding: "8px 18px", fontSize: 13 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

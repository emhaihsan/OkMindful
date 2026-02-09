"use client";

import { useState } from "react";
import { useStore } from "../lib/store";
import { formatRelativeTime } from "../lib/chat-utils";
import type { Conversation } from "../lib/chat-utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConvoId: string | null;
  onSelectConvo: (id: string) => void;
  onNewConvo: () => void;
  onRenameConvo: (id: string, newTitle: string) => void;
}

export function ChatSidebar({ conversations, activeConvoId, onSelectConvo, onNewConvo, onRenameConvo }: ChatSidebarProps) {
  const store = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function startEdit(id: string, currentTitle: string) {
    setEditingId(id);
    setEditTitle(currentTitle);
  }

  function saveTitle(id: string) {
    if (editTitle.trim()) {
      onRenameConvo(id, editTitle.trim());
    }
    setEditingId(null);
  }

  const activeConvo = activeConvoId ? conversations.find((c) => c.id === activeConvoId) : null;
  const isNewEmpty = !activeConvo && conversations.length >= 0;

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        borderRight: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.3)",
      }}
    >
      <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <button
          onClick={onNewConvo}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: isNewEmpty ? "1.5px solid rgba(26,62,92,0.4)" : "1.5px solid rgba(26,62,92,0.2)",
            background: isNewEmpty
              ? "linear-gradient(135deg, rgba(26,62,92,0.15), rgba(141,177,94,0.12))"
              : "linear-gradient(135deg, rgba(26,62,92,0.08), rgba(141,177,94,0.06))",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            color: "var(--ink)",
            transition: "all 0.2s ease",
          }}
        >
          + New Conversation
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
        {conversations.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>No conversations yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {conversations.map((c) => {
              const isActive = activeConvoId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectConvo(c.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: isActive ? "1.5px solid rgba(26,62,92,0.25)" : "1.5px solid transparent",
                    background: isActive ? "rgba(26,62,92,0.08)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    width: "100%",
                  }}
                >
                  {editingId === c.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => saveTitle(c.id)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveTitle(c.id); if (e.key === "Escape") setEditingId(null); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink)",
                          border: "1px solid rgba(26,62,92,0.3)", borderRadius: 6,
                          padding: "2px 6px", background: "rgba(255,255,255,0.8)", outline: "none",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(c.id, c.title); }}
                        style={{
                          flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                          border: "none", background: "transparent", cursor: "pointer",
                          display: "grid", placeItems: "center", fontSize: 12,
                          opacity: 0.4, transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                        title="Rename conversation"
                      >
                        &#9998;
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 3, display: "flex", justifyContent: "space-between" }}>
                    <span>{c.messages.length} msgs</span>
                    <span>{formatRelativeTime(c.ts)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        <button
          onClick={store.clearMessages}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 10,
            border: "1.5px solid rgba(244,114,182,0.2)",
            background: "rgba(244,114,182,0.06)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink-soft)",
          }}
        >
          Clear All History
        </button>
      </div>
    </div>
  );
}

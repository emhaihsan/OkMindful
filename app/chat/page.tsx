"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { AppShell } from "../ui/AppShell";
import { useStore } from "../lib/store";
import type { ChatMessage } from "../lib/types";

/** Group flat messages into "conversations" by time gaps (>30 min = new conversation) */
function groupConversations(messages: ChatMessage[]) {
  const convos: { id: string; title: string; preview: string; ts: string; messages: ChatMessage[] }[] = [];
  const GAP = 30 * 60 * 1000;
  let current: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const prev = i > 0 ? messages[i - 1] : null;
    if (prev && new Date(m.timestamp).getTime() - new Date(prev.timestamp).getTime() > GAP) {
      if (current.length > 0) {
        const first = current[0];
        convos.push({
          id: first.id,
          title: first.content.slice(0, 50) + (first.content.length > 50 ? "..." : ""),
          preview: current[current.length - 1].content.slice(0, 80),
          ts: first.timestamp,
          messages: [...current],
        });
      }
      current = [];
    }
    current.push(m);
  }
  if (current.length > 0) {
    const first = current[0];
    convos.push({
      id: first.id,
      title: first.content.slice(0, 50) + (first.content.length > 50 ? "..." : ""),
      preview: current[current.length - 1].content.slice(0, 80),
      ts: first.timestamp,
      messages: [...current],
    });
  }
  return convos.reverse();
}

export default function ChatPage() {
  const store = useStore();
  const { messages, commitments, tasks } = store;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCommitments = commitments.filter((c) => c.status === "active");
  const todayMin = store.todayFocusMinutes();
  const todayS = store.todaySessions();
  const streakVal = store.streak();

  const conversations = useMemo(() => groupConversations(messages), [messages]);

  // Auto-select latest conversation
  useEffect(() => {
    if (!selectedConvoId && conversations.length > 0) {
      setSelectedConvoId(conversations[0].id);
    }
  }, [conversations, selectedConvoId]);

  const activeConvo = conversations.find((c) => c.id === selectedConvoId);
  const displayMessages = activeConvo?.messages ?? messages;

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    await store.addMessage("user", userText);
    setLoading(true);

    const apiMessages = [...displayMessages, { role: "user" as const, content: userText }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      await store.addMessage("assistant", data.content || "No response received.", data.traceId || undefined);
    } catch {
      await store.addMessage("assistant", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  function startNew() {
    setSelectedConvoId(null);
    setInput("");
    inputRef.current?.focus();
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (diff < 7 * 86400000) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const quickPrompts = [
    { label: "Plan my week", prompt: `Create a 7-day productivity plan. I have ${tasks.length} tasks and ${activeCommitments.length} active commitments. Streak: ${streakVal} days.` },
    { label: "Stake strategy", prompt: `Help me set safe stake rules. I have ${activeCommitments.length} active commitments.` },
    { label: "Review today", prompt: `Review my productivity today: ${todayS.length} sessions, ${todayMin}m focus. Streak: ${streakVal} days.` },
    { label: "Diagnose issues", prompt: "I've been feeling unproductive. Help me diagnose the issue and give concrete solutions." },
    { label: "Motivate me", prompt: `Motivate me to stay consistent with my 2026 resolutions! Streak: ${streakVal} days.` },
    { label: "Optimize workflow", prompt: `Analyze my work patterns. ${todayS.length} sessions today, ${tasks.length} tasks, ${activeCommitments.length} commitments.` },
  ];

  return (
    <AppShell active="chat">
      <div style={{ display: "flex", height: "calc(100vh - 140px)", gap: 0 }}>
        {/* ─── Sidebar: Conversation History ─── */}
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
              onClick={startNew}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid rgba(96,165,250,0.3)",
                background: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(45,212,191,0.08))",
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
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvoId(c.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: selectedConvoId === c.id ? "1.5px solid rgba(96,165,250,0.25)" : "1.5px solid transparent",
                      background: selectedConvoId === c.id ? "rgba(96,165,250,0.08)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      width: "100%",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 3, display: "flex", justifyContent: "space-between" }}>
                      <span>{c.messages.length} msgs</span>
                      <span>{formatTime(c.ts)}</span>
                    </div>
                  </button>
                ))}
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

        {/* ─── Main Chat Area ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.4)",
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: "linear-gradient(135deg, var(--blue), var(--teal))",
                display: "grid", placeItems: "center", fontSize: 18,
                boxShadow: "0 2px 8px rgba(96,165,250,0.2)",
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>AI Advisor</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {loading ? "Thinking..." : "Context-aware coaching for your goals"}
              </div>
            </div>
            <span style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: loading ? "rgba(251,146,60,0.15)" : "rgba(45,212,191,0.15)",
            }}>
              {loading ? "Thinking..." : "Online"}
            </span>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {displayMessages.length === 0 && !selectedConvoId && (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>How can I help you today?</div>
                  <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6, maxWidth: 400, margin: "6px auto 0" }}>
                    I&apos;m your AI productivity coach. Ask me about plans, goals, habits, or commitment strategies.
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 24 }}>
                    {quickPrompts.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => send(q.prompt)}
                        disabled={loading}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 12,
                          border: "1.5px solid rgba(0,0,0,0.06)",
                          background: "rgba(96,165,250,0.06)",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {displayMessages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                      background: isUser ? "rgba(96,165,250,0.15)" : "linear-gradient(135deg, var(--blue), var(--teal))",
                      display: "grid", placeItems: "center", fontSize: 14,
                    }}>
                      {isUser ? "👤" : "🤖"}
                    </div>
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: isUser ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.6)",
                      border: `1.5px solid ${isUser ? "rgba(96,165,250,0.15)" : "rgba(0,0,0,0.05)"}`,
                      maxWidth: "80%",
                    }}>
                      <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                        {m.content}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 6 }}>
                        {new Date(m.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--blue), var(--teal))",
                    display: "grid", placeItems: "center", fontSize: 14,
                  }}>🤖</div>
                  <div style={{
                    padding: "12px 16px", borderRadius: 16,
                    background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(0,0,0,0.05)",
                  }}>
                    <div className="animate-pulse-soft" style={{ fontSize: 13 }}>Thinking...</div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div style={{ padding: "14px 24px 20px", borderTop: "1px solid rgba(0,0,0,0.05)", background: "rgba(255,255,255,0.3)" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Message AI Advisor..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 18px",
                    borderRadius: 14,
                    border: "1.5px solid rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    outline: "none",
                    transition: "border 0.2s ease",
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 14,
                    border: "none",
                    background: "linear-gradient(135deg, var(--blue), var(--teal))",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--ink)",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  Send
                </button>
              </div>
              {displayMessages.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {quickPrompts.slice(0, 4).map((q) => (
                    <button
                      key={q.label}
                      onClick={() => send(q.prompt)}
                      disabled={loading}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.05)",
                        background: "rgba(0,0,0,0.02)",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--ink-soft)",
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

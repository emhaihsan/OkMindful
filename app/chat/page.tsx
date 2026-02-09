"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { AppShell } from "../ui/AppShell";
import { useStore } from "../lib/store";
import { streamChat } from "../lib/stream-chat";
import { Markdown } from "../ui/Markdown";
import type { ChatMessage } from "../lib/types";

interface Conversation {
  id: string;
  title: string;
  ts: string;
  messages: ChatMessage[];
}

/** Group messages by conversationId. Messages without conversationId use time-gap fallback. */
function groupConversations(messages: ChatMessage[], customTitles: Record<string, string>): Conversation[] {
  const map = new Map<string, ChatMessage[]>();

  // Group by conversationId; messages without one get a fallback group
  let fallbackId = "__fallback__";
  for (const m of messages) {
    const cid = m.conversationId || fallbackId;
    if (!m.conversationId) {
      // For legacy messages without conversationId, use time-gap grouping
      const group = map.get(fallbackId);
      if (group && group.length > 0) {
        const last = group[group.length - 1];
        if (new Date(m.timestamp).getTime() - new Date(last.timestamp).getTime() > 30 * 60 * 1000) {
          fallbackId = `__fallback_${m.id}__`;
        }
      }
      const key = m.conversationId || fallbackId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    } else {
      if (!map.has(cid)) map.set(cid, []);
      map.get(cid)!.push(m);
    }
  }

  const convos: Conversation[] = [];
  for (const [id, msgs] of map) {
    if (msgs.length === 0) continue;
    const firstUser = msgs.find((m) => m.role === "user");
    const defaultTitle = firstUser
      ? firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? "..." : "")
      : "New conversation";
    convos.push({
      id,
      title: customTitles[id] || defaultTitle,
      ts: msgs[0].timestamp,
      messages: msgs,
    });
  }

  return convos.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

export default function ChatPage() {
  const store = useStore();
  const { messages, commitments, tasks } = store;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [customTitles, setCustomTitles] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("okmindful_convo_titles") || "{}"); } catch { return {}; }
    }
    return {};
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeCommitments = commitments.filter((c) => c.status === "active");
  const todayMin = store.todayFocusMinutes();
  const todayS = store.todaySessions();
  const streakVal = store.streak();

  const conversations = useMemo(() => groupConversations(messages, customTitles), [messages, customTitles]);

  // Auto-select latest conversation on first load
  useEffect(() => {
    if (!activeConvoId && conversations.length > 0) {
      setActiveConvoId(conversations[0].id);
    }
  }, [conversations, activeConvoId]);

  // Persist custom titles to localStorage
  useEffect(() => {
    try { localStorage.setItem("okmindful_convo_titles", JSON.stringify(customTitles)); } catch { /* ok */ }
  }, [customTitles]);

  const activeConvo = activeConvoId ? conversations.find((c) => c.id === activeConvoId) : null;
  const displayMessages = activeConvo?.messages ?? [];

  const [streamingText, setStreamingText] = useState("");

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    setLoading(true);
    setStreamingText("");

    // Determine conversationId: use current or create new
    let convoId = activeConvoId;
    if (!convoId || !conversations.find((c) => c.id === convoId)) {
      convoId = crypto.randomUUID();
      setActiveConvoId(convoId);
    }

    await store.addMessage("user", userText, undefined, convoId);

    const apiMessages = [...displayMessages, { role: "user" as const, content: userText }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const totalStake = activeCommitments.filter((c) => c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0);
    const ctx = {
      activeTasks: tasks.length,
      activeCommitments: activeCommitments.length,
      todaySessions: todayS.length,
      todayFocusMinutes: todayMin,
      streak: streakVal,
      totalStake,
    };

    try {
      const { content, traceId } = await streamChat(apiMessages, (token) => {
        setStreamingText((prev) => prev + token);
      }, ctx);
      await store.addMessage("assistant", content || "No response received.", traceId || undefined, convoId);
    } catch {
      await store.addMessage("assistant", "Something went wrong. Please try again.", undefined, convoId);
    } finally {
      setLoading(false);
      setStreamingText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [loading, displayMessages, store, activeCommitments, tasks, todayS, todayMin, streakVal, activeConvoId, conversations]);

  function startNew() {
    const newId = crypto.randomUUID();
    setActiveConvoId(newId);
    setInput("");
    inputRef.current?.focus();
  }

  function selectConvo(id: string) {
    setActiveConvoId(id);
  }

  function startEditTitle(id: string, currentTitle: string) {
    setEditingId(id);
    setEditTitle(currentTitle);
  }

  function saveTitle(id: string) {
    if (editTitle.trim()) {
      setCustomTitles((prev) => ({ ...prev, [id]: editTitle.trim() }));
    }
    setEditingId(null);
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
                border: (!activeConvo && displayMessages.length === 0) ? "1.5px solid rgba(96,165,250,0.5)" : "1.5px solid rgba(96,165,250,0.3)",
                background: (!activeConvo && displayMessages.length === 0)
                  ? "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(45,212,191,0.15))"
                  : "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(45,212,191,0.08))",
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
                      onClick={() => selectConvo(c.id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: isActive ? "1.5px solid rgba(96,165,250,0.25)" : "1.5px solid transparent",
                        background: isActive ? "rgba(96,165,250,0.08)" : "transparent",
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
                              border: "1px solid rgba(96,165,250,0.3)", borderRadius: 6,
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
                            onClick={(e) => { e.stopPropagation(); startEditTitle(c.id, c.title); }}
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
                        <span>{formatTime(c.ts)}</span>
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
              {displayMessages.length === 0 && (
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
                      {isUser ? (
                        <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                          {m.content}
                        </div>
                      ) : (
                        <Markdown content={m.content} />
                      )}
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
                    maxWidth: "80%",
                  }}>
                    {streamingText ? (
                      <Markdown content={streamingText} />
                    ) : (
                      <div className="animate-pulse-soft" style={{ fontSize: 13 }}>Thinking...</div>
                    )}
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

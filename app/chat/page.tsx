"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { AppShell } from "../ui/AppShell";
import { useStore } from "../lib/store";
import { streamChat } from "../lib/stream-chat";
import { Markdown } from "../ui/Markdown";
import { groupConversations } from "../lib/chat-utils";
import { ChatSidebar } from "./ChatSidebar";

export default function ChatPage() {
  const store = useStore();
  const { messages, commitments, tasks } = store;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
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

  const quickPrompts = [
    { label: "Plan my week", prompt: `Create a 7-day productivity plan. I have ${tasks.length} tasks and ${activeCommitments.length} active commitments. Streak: ${streakVal} days.` },
    { label: "Stake strategy", prompt: `Help me set safe stake rules. I have ${activeCommitments.length} active commitments.` },
    { label: "Review today", prompt: `Review my productivity today: ${todayS.length} sessions, ${todayMin}m focus. Streak: ${streakVal} days.` },
    { label: "Diagnose issues", prompt: "I've been feeling unproductive. Help me diagnose the issue and give concrete solutions." },
    { label: "Motivate me", prompt: `Motivate me to stay consistent with my resolutions! Streak: ${streakVal} days.` },
    { label: "Optimize workflow", prompt: `Analyze my work patterns. ${todayS.length} sessions today, ${tasks.length} tasks, ${activeCommitments.length} commitments.` },
  ];

  return (
    <AppShell active="chat">
      <div style={{ display: "flex", height: "calc(100vh - 140px)", gap: 0 }}>
        <ChatSidebar
          conversations={conversations}
          activeConvoId={activeConvoId}
          onSelectConvo={setActiveConvoId}
          onNewConvo={() => { setActiveConvoId(crypto.randomUUID()); setInput(""); inputRef.current?.focus(); }}
          onRenameConvo={(id, title) => setCustomTitles((prev) => ({ ...prev, [id]: title }))}
        />

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
                boxShadow: "0 2px 8px rgba(26,62,92,0.2)",
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
              background: loading ? "rgba(232,148,58,0.15)" : "rgba(141,177,94,0.15)",
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
                          background: "rgba(26,62,92,0.06)",
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
                      background: isUser ? "rgba(26,62,92,0.15)" : "linear-gradient(135deg, var(--blue), var(--teal))",
                      display: "grid", placeItems: "center", fontSize: 14,
                    }}>
                      {isUser ? "👤" : "🤖"}
                    </div>
                    <div style={{
                      padding: "12px 16px",
                      borderRadius: 16,
                      background: isUser ? "rgba(26,62,92,0.1)" : "rgba(255,255,255,0.6)",
                      border: `1.5px solid ${isUser ? "rgba(26,62,92,0.15)" : "rgba(0,0,0,0.05)"}`,
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

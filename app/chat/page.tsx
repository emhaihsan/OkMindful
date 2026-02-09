"use client";

import { useRef, useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { useStore } from "../lib/store";

export default function ChatPage() {
  const store = useStore();
  const { messages, commitments, tasks } = store;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeCommitments = commitments.filter((c) => c.status === "active");
  const todayMin = store.todayFocusMinutes();
  const todayS = store.todaySessions();
  const streakVal = store.streak();

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    await store.addMessage("user", userText);
    setLoading(true);

    const apiMessages = [...messages, { role: "user" as const, content: userText }].map((m) => ({
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

  return (
    <AppShell active="chat">
      <div className="section-pad">
        {/* ─── Header ─── */}
        <div className="animate-slide-up" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, var(--blue), var(--teal))",
              display: "grid", placeItems: "center",
              fontSize: 22, boxShadow: "0 2px 10px rgba(96,165,250,0.2)",
            }}>
              🤖
            </div>
            <div>
              <h1 className="h2" style={{ fontSize: 22 }}>AI Advisor</h1>
              <p className="p" style={{ marginTop: 2, fontSize: 13 }}>
                Your personal productivity coach — ask anything about goals, plans, and habits.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: loading ? "rgba(251,146,60,0.15)" : "rgba(45,212,191,0.15)",
            }}>
              {loading ? "Thinking..." : "Online"}
            </span>
            <button
              onClick={store.clearMessages}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "1.5px solid rgba(0,0,0,0.08)", background: "transparent",
                cursor: "pointer", color: "var(--ink-soft)", transition: "all 0.2s ease",
              }}
            >
              Clear Chat
            </button>
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 18, alignItems: "start" }}>
          {/* ─── Conversation Panel ─── */}
          <div className="neo-surface animate-fade-in" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ maxHeight: 520, overflowY: "auto", padding: "18px 18px 8px" }}>
              <div className="grid" style={{ gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{
                    padding: "24px 16px", textAlign: "center",
                    background: "rgba(0,0,0,0.02)", borderRadius: 16,
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                    <div className="h3">Start a conversation</div>
                    <div className="p" style={{ marginTop: 6 }}>
                      Ask me to plan your week, review your progress, or help with commitment strategies.
                    </div>
                  </div>
                )}
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 16,
                        background: isUser ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.6)",
                        border: `1.5px solid ${isUser ? "rgba(96,165,250,0.15)" : "rgba(0,0,0,0.05)"}`,
                        marginLeft: isUser ? "auto" : 0,
                        maxWidth: "85%",
                      }}
                    >
                      <div className="h3" style={{ fontSize: 13 }}>{isUser ? "You" : "AI Advisor"}</div>
                      <div className="p" style={{ marginTop: 4, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div style={{
                    padding: "12px 14px", borderRadius: 16,
                    background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(0,0,0,0.05)",
                    maxWidth: "85%",
                  }}>
                    <div className="h3" style={{ fontSize: 13 }}>AI Advisor</div>
                    <div className="p animate-pulse-soft" style={{ marginTop: 4 }}>Thinking...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input Area */}
            <div style={{ padding: "12px 18px 18px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask anything..."
                  disabled={loading}
                  className="neo-input"
                  style={{ flex: 1 }}
                />
                <button className="neo-btn" onClick={() => send(input)} disabled={loading} style={{ padding: "10px 18px" }}>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="grid" style={{ gap: 14 }}>
            <Card title="Quick Prompts" accent="var(--pink)">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "📋 7-Day Plan", prompt: `Create a 7-day productivity plan. I have ${tasks.length} tasks and ${activeCommitments.length} active commitments. Streak: ${streakVal} days.` },
                  { label: "🎯 Stake Strategy", prompt: `Help me set safe stake rules. I have ${activeCommitments.length} active commitments.` },
                  { label: "📊 Today Review", prompt: `Review my productivity today: ${todayS.length} sessions, ${todayMin}m focus. Streak: ${streakVal} days. Suggestions?` },
                  { label: "🔍 Diagnose", prompt: "I've been feeling unproductive. Help me diagnose the issue and give concrete solutions." },
                  { label: "💪 Motivate", prompt: `Motivate me to stay consistent with my 2026 resolutions! Streak: ${streakVal} days.` },
                  { label: "⚡ Optimize", prompt: `Analyze my work patterns and suggest optimizations. ${todayS.length} sessions today, ${tasks.length} tasks, ${activeCommitments.length} commitments.` },
                ].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.prompt)}
                    disabled={loading}
                    className="neo-btn secondary"
                    style={{ padding: "7px 14px", fontSize: 13 }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Your Context" accent="var(--teal)">
              <div className="p" style={{ fontSize: 12, marginBottom: 10 }}>
                The advisor uses your live data for personalized recommendations:
              </div>
              <div className="grid" style={{ gap: 6 }}>
                {[
                  { label: "Active Commitments", value: String(activeCommitments.length) },
                  { label: "Active Tasks", value: String(tasks.length) },
                  { label: "Sessions Today", value: `${todayS.length} (${todayMin}m)` },
                  { label: "Streak", value: `${streakVal} days` },
                ].map((item) => (
                  <div key={item.label} className="neo-surface-flat" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</span>
                    <span className="p" style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

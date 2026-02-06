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
      await store.addMessage("assistant", "Failed to reach the server. Check if the dev server is running.");
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  function handleQuickPrompt(prompt: string) {
    send(prompt);
  }

  return (
    <AppShell active="chat">
      <div style={{ padding: "20px 0 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="h2">Chat &bull; Productivity Advisor</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Gemini Flash-powered AI advisor. Every message is traced by Opik.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="neo-badge" style={{ background: loading ? "var(--orange)" : "var(--teal)" }}>
              {loading ? "Thinking..." : "Online"}
            </span>
            <button className="neo-btn secondary" onClick={store.clearMessages}>Reset chat</button>
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          <Card title="Conversation" accent="var(--yellow)">
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <div className="grid" style={{ gap: 10 }}>
                {messages.length === 0 && (
                  <div className="neo-surface-flat" style={{ padding: 14, background: "var(--bg)" }}>
                    <div className="p" style={{ fontWeight: 800 }}>No messages yet.</div>
                    <div className="p" style={{ marginTop: 4 }}>Type a message or use a quick prompt on the right.</div>
                  </div>
                )}
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className="neo-surface"
                      style={{
                        padding: 12,
                        background: isUser ? "var(--blue)" : "var(--paper)",
                        marginLeft: isUser ? "auto" : 0,
                        maxWidth: 520,
                      }}
                    >
                      <div className="h3">{isUser ? "You" : "Advisor"}</div>
                      <div className="p" style={{ marginTop: 6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>
                        {m.content}
                      </div>
                      {m.opikTraceId && (
                        <div className="p" style={{ marginTop: 6, fontSize: 11, opacity: 0.5 }}>
                          Opik trace: {m.opikTraceId.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  );
                })}
                {loading && (
                  <div className="neo-surface" style={{ padding: 12 }}>
                    <div className="h3">Advisor</div>
                    <div className="p" style={{ marginTop: 6 }}>Typing...</div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="neo-surface-flat" style={{ padding: 12, background: "var(--bg)", marginTop: 10 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Type a message..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: "3px solid var(--ink)",
                    boxShadow: "4px 4px 0 var(--ink)",
                    outline: "none",
                    background: "var(--paper)",
                    fontWeight: 600,
                  }}
                />
                <button className="neo-btn" onClick={() => send(input)} disabled={loading}>
                  Send
                </button>
              </div>
            </div>
          </Card>

          <div className="grid" style={{ gap: 16 }}>
            <Card title="Quick Prompts" accent="var(--pink)">
              <div className="grid" style={{ gap: 10 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--yellow)" }} onClick={() => handleQuickPrompt("Create a 7-day pomodoro plan for me. I have " + tasks.length + " active tasks and " + activeCommitments.length + " active commitments.")}>
                    7-Day Plan
                  </button>
                  <button className="neo-btn" style={{ background: "var(--teal)" }} onClick={() => handleQuickPrompt("Help me set safe stake rules for my commitments. I have " + activeCommitments.length + " active commitments.")}>
                    Stake Rules
                  </button>
                  <button className="neo-btn" style={{ background: "var(--lime)" }} onClick={() => handleQuickPrompt("Review my productivity today: " + todayS.length + " pomodoro sessions, " + todayMin + " minutes of focus. My streak is " + store.streak() + " days. Any suggestions?")}>
                    Today Review
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--blue)" }} onClick={() => handleQuickPrompt("I've been feeling unproductive lately. Help me diagnose the issue and give concrete solutions.")}>
                    Diagnose
                  </button>
                  <button className="neo-btn" style={{ background: "var(--pink)" }} onClick={() => handleQuickPrompt("Motivate me to stay consistent with my 2026 resolutions!")}>
                    Motivate
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Context Snapshot" accent="var(--teal)">
              <div className="grid" style={{ gap: 8 }}>
                <div className="neo-surface-flat" style={{ padding: 10, display: "flex", justifyContent: "space-between", background: "var(--bg)" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Active Commitments</span>
                  <span className="p">{activeCommitments.length}</span>
                </div>
                <div className="neo-surface-flat" style={{ padding: 10, display: "flex", justifyContent: "space-between", background: "var(--bg)" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Active Tasks</span>
                  <span className="p">{tasks.length}</span>
                </div>
                <div className="neo-surface-flat" style={{ padding: 10, display: "flex", justifyContent: "space-between", background: "var(--bg)" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Sessions Today</span>
                  <span className="p">{todayS.length} ({todayMin}m)</span>
                </div>
                <div className="neo-surface-flat" style={{ padding: 10, display: "flex", justifyContent: "space-between", background: "var(--bg)" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Streak</span>
                  <span className="p">{store.streak()} days</span>
                </div>
              </div>
            </Card>

            <Card title="Opik Tracing" accent="var(--blue)">
              <div className="p">
                Every advisor message is traced via the Opik REST API.
                Feedback scores: response_length, actionability, topic_relevance.
              </div>
              <div className="p" style={{ marginTop: 8, fontWeight: 800 }}>
                Configure in .env.local:
              </div>
              <div className="neo-surface-flat" style={{ padding: 10, marginTop: 6, background: "var(--bg)", fontFamily: "monospace", fontSize: 12 }}>
                GEMINI_API_KEY=your_key<br />
                OPIK_API_KEY=your_opik_key<br />
                OPIK_WORKSPACE=your_workspace<br />
                OPIK_PROJECT=okmindful
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

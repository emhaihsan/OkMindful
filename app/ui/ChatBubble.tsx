"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { streamChat } from "../lib/stream-chat";
import { Markdown } from "./Markdown";

export function ChatBubble() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localMsgs, setLocalMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [open, localMsgs]);

  const [streamingText, setStreamingText] = useState("");

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    const newMsgs = [...localMsgs, { role: "user" as const, content: userText }];
    setLocalMsgs(newMsgs);
    setLoading(true);
    setStreamingText("");

    // Also save to store so it appears in /chat history
    await store.addMessage("user", userText);

    const myCommitments = store.myCommitments();
    const activeCommitments = myCommitments.filter((c) => c.status === "active");
    const ctx = {
      activeTasks: store.tasks.length,
      activeCommitments: activeCommitments.length,
      todaySessions: store.todaySessions().length,
      todayFocusMinutes: store.todayFocusMinutes(),
      streak: store.streak(),
      totalStake: activeCommitments.filter((c) => c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0),
    };

    try {
      const { content, traceId } = await streamChat(
        newMsgs.map((m) => ({ role: m.role, content: m.content })),
        (token) => setStreamingText((prev) => prev + token),
        ctx,
      );
      const reply = content || "No response received.";
      setLocalMsgs((prev) => [...prev, { role: "assistant", content: reply }]);
      await store.addMessage("assistant", reply, traceId || undefined);
    } catch {
      const err = "Something went wrong. Please try again.";
      setLocalMsgs((prev) => [...prev, { role: "assistant", content: err }]);
      await store.addMessage("assistant", err);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  const quickPrompts = [
    "Plan my day",
    "Review my progress",
    "Motivate me",
    "Suggest a goal",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat with AI Advisor"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: 18,
          border: "1.5px solid rgba(26,62,92,0.3)",
          background: open
            ? "linear-gradient(135deg, var(--pink), var(--orange))"
            : "linear-gradient(135deg, var(--blue), var(--teal))",
          boxShadow: "0 4px 20px rgba(26,62,92,0.3), 0 2px 8px rgba(0,0,0,0.1)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 24,
            zIndex: 999,
            width: 380,
            maxWidth: "calc(100vw - 48px)",
            height: 500,
            maxHeight: "calc(100vh - 140px)",
            borderRadius: 22,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "bubbleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "linear-gradient(135deg, rgba(26,62,92,0.08), rgba(141,177,94,0.06))",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "linear-gradient(135deg, var(--blue), var(--teal))",
                display: "grid",
                placeItems: "center",
                fontSize: 16,
              }}
            >
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>AI Advisor</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                {loading ? "Thinking..." : "Ask anything about your goals"}
              </div>
            </div>
            <a
              href="/chat"
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                border: "1.5px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                color: "var(--ink)",
              }}
            >
              Full Chat
            </a>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localMsgs.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 10px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Hi! I&apos;m your AI Advisor</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                    Ask me about plans, goals, or productivity tips.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
                    {quickPrompts.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1.5px solid rgba(0,0,0,0.06)",
                          background: "rgba(26,62,92,0.08)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localMsgs.map((m, i) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: isUser ? "rgba(26,62,92,0.12)" : "rgba(255,255,255,0.7)",
                      border: `1px solid ${isUser ? "rgba(26,62,92,0.15)" : "rgba(0,0,0,0.04)"}`,
                      marginLeft: isUser ? "auto" : 0,
                      maxWidth: "88%",
                    }}
                  >
                    {isUser ? (
                      <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
                    ) : (
                      <Markdown content={m.content} />
                    )}
                  </div>
                );
              })}

              {loading && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    maxWidth: "88%",
                  }}
                >
                  {streamingText ? (
                    <Markdown content={streamingText} />
                  ) : (
                    <span className="animate-pulse-soft" style={{ fontSize: 13 }}>Thinking...</span>
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask anything..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  outline: "none",
                  transition: "border 0.2s ease",
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, var(--blue), var(--teal))",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

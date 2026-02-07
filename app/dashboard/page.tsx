"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";

export default function DashboardPage() {
  const store = useStore();
  const { profile } = useAuth();
  const router = useRouter();
  const { tasks, sessions } = store;

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const mine = store.myCommitments();
  const validating = store.validatingCommitments();
  const activeCommitments = mine.filter((c) => c.status === "active");
  const activeValidating = validating.filter((c) => c.status === "active");
  const totalStake = activeCommitments.filter((c) => c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0);
  const todayS = store.todaySessions();
  const todayMin = store.todayFocusMinutes();
  const streakVal = store.streak();
  const today = new Date().toISOString().slice(0, 10);
  const recentSessions = sessions.slice(0, 5);
  const uncheckedToday = activeCommitments.filter((c) => !c.dailyCheckins[today]);

  async function handleAiQuick(prompt: string) {
    setAiLoading(true);
    await store.addMessage("user", prompt);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      await store.addMessage("assistant", data.content || "No response.", data.traceId || undefined);
    } catch {
      await store.addMessage("assistant", "Failed to reach AI. Check server.");
    }
    setAiLoading(false);
    router.push("/chat");
  }

  function handleAiSubmit() {
    if (!aiInput.trim()) return;
    handleAiQuick(aiInput.trim());
    setAiInput("");
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AppShell active="dashboard">
      <div className="section-pad">
        {/* ─── Narrative Greeting ─── */}
        <div className="animate-slide-up">
          <h1 className="h2">{greeting}, {profile?.username || "there"}</h1>
          <p className="p" style={{ marginTop: 6, fontSize: 15 }}>
            {activeCommitments.length > 0
              ? `You have ${activeCommitments.length} active commitment${activeCommitments.length > 1 ? "s" : ""}${uncheckedToday.length > 0 ? ` — ${uncheckedToday.length} still need today's check-in` : " — all checked in today"}.`
              : "No active commitments yet. Start one to build accountability."
            }
            {todayMin > 0 && ` ${todayMin} minutes focused today.`}
            {streakVal > 0 && ` ${streakVal}-day streak.`}
          </p>
        </div>

        {/* ═══ AI AGENT — STAR OF THE SHOW ═══ */}
        <div
          className="animate-fade-in"
          style={{
            marginTop: 20,
            padding: "20px 22px",
            background: "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(45,212,191,0.10))",
            border: "1.5px solid rgba(96,165,250,0.18)",
            borderRadius: 22,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: "linear-gradient(135deg, var(--blue), var(--teal))",
                display: "grid", placeItems: "center",
                fontSize: 16, boxShadow: "0 2px 8px rgba(96,165,250,0.2)",
              }}>
                🤖
              </div>
              <div>
                <div className="h3" style={{ fontSize: 16 }}>AI Productivity Agent</div>
                <div className="p" style={{ fontSize: 12 }}>Gemini Flash &middot; Opik Traced &middot; Context-Aware</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: aiLoading ? "rgba(251,146,60,0.15)" : "rgba(45,212,191,0.15)",
                color: "var(--ink)",
              }}>
                {aiLoading ? "Thinking..." : "Online"}
              </span>
              <Link href="/chat" style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "1.5px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.5)",
                textDecoration: "none", color: "var(--ink)",
              }}>
                Full Chat →
              </Link>
            </div>
          </div>

          {/* Quick Ask Input */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
              placeholder="Ask your AI agent anything — plans, reviews, motivation..."
              disabled={aiLoading}
              className="neo-input"
              style={{ flex: 1 }}
            />
            <button className="neo-btn" onClick={handleAiSubmit} disabled={aiLoading} style={{ padding: "10px 18px" }}>
              Ask
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { label: "📋 Plan my week", prompt: `Create a 7-day productivity plan. I have ${tasks.length} tasks, ${activeCommitments.length} active commitments, and a ${streakVal}-day streak. Today I've done ${todayMin} minutes of focus.` },
              { label: "📊 Review today", prompt: `Review my productivity today: ${todayS.length} pomodoro sessions, ${todayMin} minutes of focus. Streak: ${streakVal} days. ${uncheckedToday.length} commitments still need check-in. Give specific advice.` },
              { label: "🎯 Stake strategy", prompt: `Help me set optimal stake rules. I have ${activeCommitments.length} active commitments with $${totalStake} total staked. What's the best approach to maximize accountability without burnout?` },
              { label: "💪 Motivate me", prompt: `I need motivation to stay consistent with my 2026 resolutions! My streak is ${streakVal} days. I have ${activeCommitments.length} active commitments. Give me a personalized pep talk.` },
            ].map((q) => (
              <button
                key={q.label}
                onClick={() => handleAiQuick(q.prompt)}
                disabled={aiLoading}
                style={{
                  padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  border: "1.5px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.5)",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid cols-4" style={{ marginTop: 18 }}>
          <Stat label="Streak" value={`${streakVal} days`} tint="var(--yellow)" />
          <Stat label="Active Stake" value={`$${totalStake}`} tint="var(--teal)" />
          <Stat label="Today" value={`${todayMin}m · ${todayS.length} sess.`} tint="var(--blue)" />
          <Stat label="Validating" value={String(activeValidating.length)} tint="var(--orange)" />
        </div>

        <div className="grid cols-2" style={{ marginTop: 18, alignItems: "start" }}>
          {/* ─── Left Column ─── */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Active Commitments" accent="var(--pink)">
              {activeCommitments.length === 0 ? (
                <div className="p">No active commitments. <Link href="/commitments" style={{ fontWeight: 700 }}>Create one →</Link></div>
              ) : (
                <div className="grid" style={{ gap: 12 }}>
                  {activeCommitments.map((c) => {
                    const totalCheckins = Object.keys(c.dailyCheckins).length;
                    const progress = Math.round((totalCheckins / c.durationDays) * 100);
                    const checkedToday = !!c.dailyCheckins[today];
                    return (
                      <div key={c.id} className="neo-surface-flat" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div className="h3">{c.title}</div>
                            <div className="p">
                              {c.mode === "stake" ? "Stake" : "Commit"} · {c.durationDays} days
                              {c.mode === "stake" && ` · $${c.stakeAmount}`}
                            </div>
                          </div>
                          <span style={{
                            padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                            background: checkedToday ? "rgba(45,212,191,0.15)" : "rgba(251,146,60,0.15)",
                          }}>
                            {checkedToday ? "Done" : "Pending"}
                          </span>
                        </div>
                        {c.validators.length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                            {c.validators.map((v) => {
                              const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                              const bg = vs === "approved" ? "rgba(45,212,191,0.15)" : vs === "rejected" ? "rgba(244,114,182,0.15)" : "rgba(0,0,0,0.04)";
                              return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs}</span>;
                            })}
                          </div>
                        )}
                        <div className="progress-bar" style={{ marginTop: 10 }}>
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                        <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>
                        {!checkedToday && (
                          <button className="neo-btn" style={{ marginTop: 10, background: "var(--yellow)", padding: "7px 14px", fontSize: 13 }} onClick={() => store.checkinCommitment(c.id)}>
                            Check in today
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {activeValidating.length > 0 && (
              <Card title="Validating for Others" accent="var(--orange)">
                <div className="grid" style={{ gap: 10 }}>
                  {activeValidating.map((c) => {
                    const totalCheckins = Object.keys(c.dailyCheckins).length;
                    const progress = Math.round((totalCheckins / c.durationDays) * 100);
                    const myVS = c.validationStatus?.[store.currentUser] || "pending";
                    return (
                      <div key={c.id} className="neo-surface-flat" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <div>
                            <div className="h3">{c.title}</div>
                            <div className="p">by {c.owner} · {progress}% done</div>
                          </div>
                          {myVS === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="neo-btn" style={{ padding: "5px 10px", fontSize: 12, background: "var(--teal)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, true)}>Approve</button>
                              <button className="neo-btn" style={{ padding: "5px 10px", fontSize: 12, background: "var(--pink)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, false)}>Reject</button>
                            </div>
                          ) : (
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: myVS === "approved" ? "rgba(45,212,191,0.15)" : "rgba(244,114,182,0.15)" }}>{myVS}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* ─── Right Column ─── */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Active Tasks" accent="var(--teal)" ctaHref="/pomodoro" ctaLabel="Open Pomodoro →">
              {tasks.length === 0 ? (
                <div className="p">No tasks yet. <Link href="/pomodoro" style={{ fontWeight: 700 }}>Create in Pomodoro →</Link></div>
              ) : (
                <div className="grid" style={{ gap: 8 }}>
                  {tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="neo-surface-flat" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span className="p" style={{ fontWeight: 700 }}>{t.title}</span>
                      <span className="p">{t.completedSessions}/{t.targetSessions}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Recent Activity" accent="var(--blue)">
              {recentSessions.length === 0 ? (
                <div className="p">No sessions recorded yet.</div>
              ) : (
                <div className="grid" style={{ gap: 6 }}>
                  {recentSessions.map((s) => (
                    <div key={s.id} className="neo-surface-flat" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span className="p" style={{ fontWeight: 700 }}>{s.taskTitle}</span>
                      <span className="p">{s.durationMinutes}m · {new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <div className="neo-surface" style={{ padding: "16px 18px" }}>
              <div className="h3" style={{ marginBottom: 10 }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="neo-btn" style={{ padding: "8px 14px", fontSize: 13, background: "var(--yellow)" }} href="/commitments">+ Commitment</Link>
                <Link className="neo-btn secondary" style={{ padding: "8px 14px", fontSize: 13 }} href="/pomodoro">Start Focus</Link>
                <Link className="neo-btn secondary" style={{ padding: "8px 14px", fontSize: 13 }} href="/chat">AI Chat →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

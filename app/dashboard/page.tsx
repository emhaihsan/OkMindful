"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";

function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 400, width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="h3" style={{ fontSize: 16 }}>{title}</div>
        <p className="p" style={{ marginTop: 10, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600, borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.08)", background: "transparent",
              cursor: "pointer", color: "var(--ink-soft)",
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

export default function DashboardPage() {
  const store = useStore();
  const { profile } = useAuth();
  const { tasks, sessions } = store;

  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel: string; confirmColor: string; action: () => void;
  } | null>(null);

  function askConfirm(title: string, message: string, confirmLabel: string, confirmColor: string, action: () => void) {
    setConfirm({ title, message, confirmLabel, confirmColor, action });
  }

  function executeConfirm() {
    if (confirm) confirm.action();
    setConfirm(null);
  }

  const mine = store.myCommitments();
  const validating = store.validatingCommitments();
  const activeCommitments = mine.filter((c) => c.status === "active");
  const activeValidating = validating.filter((c) => c.status === "active");
  const totalStake = activeCommitments.filter((c) => c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0);
  const todayS = store.todaySessions();
  const todayMin = store.todayFocusMinutes();
  const streakVal = store.streak();
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const recentSessions = sessions.slice(0, 5);
  const uncheckedToday = activeCommitments.filter((c) => !c.dailyCheckins[today]);

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
              ? `You have ${activeCommitments.length} active commitment${activeCommitments.length > 1 ? "s" : ""}. ${uncheckedToday.length > 0 ? `${uncheckedToday.length} still need today's check-in.` : "All checked in today!"}`
              : "No active commitments yet. Start one to achieve your goals!"
            }
            {todayMin > 0 && ` ${todayMin} minutes focused today.`}
          </p>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid cols-4" style={{ marginTop: 18 }}>
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
                            background: checkedToday ? "rgba(141,177,94,0.15)" : "rgba(26,62,92,0.1)",
                          }}>
                            {checkedToday ? "Done" : "Pending"}
                          </span>
                        </div>
                        {c.validators.length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                            {c.validators.map((v) => {
                              const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                              const bg = vs === "approved" ? "rgba(141,177,94,0.15)" : vs === "rejected" ? "rgba(232,114,154,0.15)" : "rgba(0,0,0,0.04)";
                              return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs}</span>;
                            })}
                          </div>
                        )}
                        <div className="progress-bar" style={{ marginTop: 10 }}>
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                        <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>
                        {!checkedToday && (
                          <button className="neo-btn" style={{ marginTop: 10, background: "var(--yellow)", padding: "7px 14px", fontSize: 13 }} onClick={() => askConfirm("Check In", `Mark today's check-in for "${c.title}"? This cannot be undone.`, "Check In", "var(--yellow)", () => store.checkinCommitment(c.id))}>
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
                              <button className="neo-btn" style={{ padding: "5px 10px", fontSize: 12, background: "var(--teal)" }} onClick={() => askConfirm("Approve Commitment", `Approve "${c.title}" by ${c.owner}? This means you confirm they completed their goal. This cannot be undone.`, "Approve", "var(--teal)", () => store.validateCommitment(c.id, store.currentUser, true))}>Approve</button>
                              <button className="neo-btn" style={{ padding: "5px 10px", fontSize: 12, background: "var(--pink)" }} onClick={() => askConfirm("Reject Commitment", `Reject "${c.title}" by ${c.owner}? This means you believe they did not complete their goal.${c.mode === "stake" ? " Their staked amount will be forfeited." : ""} This cannot be undone.`, "Reject", "var(--pink)", () => store.validateCommitment(c.id, store.currentUser, false))}>Reject</button>
                            </div>
                          ) : (
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: myVS === "approved" ? "rgba(141,177,94,0.15)" : "rgba(232,114,154,0.15)" }}>{myVS}</span>
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
            <Card title="Active Tasks" accent="var(--teal)" ctaHref="/pomodoro" ctaLabel="Open Focus Timer →">
              {tasks.length === 0 ? (
                <div className="p">No tasks yet. <Link href="/pomodoro" style={{ fontWeight: 700 }}>Create in Focus Timer →</Link></div>
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
                <Link className="neo-btn secondary" style={{ padding: "8px 14px", fontSize: 13 }} href="/pomodoro">Focus Timer</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AppShell>
  );
}

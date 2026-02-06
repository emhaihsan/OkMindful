"use client";

import Link from "next/link";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";

export default function DashboardPage() {
  const store = useStore();
  const { tasks, sessions } = store;

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

  return (
    <AppShell active="dashboard">
      <div className="section-pad">
        <div className="page-header">
          <div>
            <h1 className="h2">Dashboard</h1>
            <p className="p" style={{ marginTop: 6 }}>Your commitments, tasks, and productivity at a glance.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="neo-btn secondary" href="/pomodoro">Start Pomodoro</Link>
            <Link className="neo-btn" style={{ background: "var(--yellow)" }} href="/commitments">New Commitment</Link>
          </div>
        </div>

        <div className="grid cols-4" style={{ marginTop: 16 }}>
          <Stat label="Streak" value={`${streakVal} days`} tint="var(--yellow)" />
          <Stat label="Active Stake" value={`$${totalStake}`} tint="var(--teal)" />
          <Stat label="Today" value={`${todayMin}m (${todayS.length} sess.)`} tint="var(--blue)" />
          <Stat label="Validating" value={String(activeValidating.length)} tint="var(--orange)" />
        </div>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          {/* ─── Left Column ─── */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="My Active Commitments" accent="var(--pink)">
              {activeCommitments.length === 0 ? (
                <div className="p">No active commitments. <Link href="/commitments" style={{ fontWeight: 800, textDecoration: "underline" }}>Create one</Link></div>
              ) : (
                <div className="grid" style={{ gap: 12 }}>
                  {activeCommitments.map((c) => {
                    const totalCheckins = Object.keys(c.dailyCheckins).length;
                    const progress = Math.round((totalCheckins / c.durationDays) * 100);
                    const checkedToday = !!c.dailyCheckins[today];
                    return (
                      <div key={c.id} className="neo-surface" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div className="h3">{c.title}</div>
                            <div className="p">
                              {c.mode === "stake" ? "Stake" : "Commit"} &bull; {c.durationDays} days
                              {c.mode === "stake" && ` • $${c.stakeAmount}`}
                            </div>
                          </div>
                          <span className="neo-badge" style={{ background: checkedToday ? "var(--teal)" : "var(--orange)" }}>
                            {checkedToday ? "DONE" : "PENDING"}
                          </span>
                        </div>
                        {c.validators.length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                            {c.validators.map((v) => {
                              const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                              const bg = vs === "approved" ? "var(--teal)" : vs === "rejected" ? "var(--pink)" : "var(--paper)";
                              return <span key={v} className="neo-badge" style={{ background: bg, fontSize: 11 }}>{v}: {vs}</span>;
                            })}
                          </div>
                        )}
                        <div className="progress-bar" style={{ marginTop: 10 }}>
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                        <div className="p" style={{ marginTop: 6 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>
                        {!checkedToday && (
                          <button className="neo-btn" style={{ marginTop: 10, background: "var(--yellow)" }} onClick={() => store.checkinCommitment(c.id)}>
                            Check in today
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Validating for Others */}
            {activeValidating.length > 0 && (
              <Card title="Validating for Others" accent="var(--orange)">
                <div className="grid" style={{ gap: 10 }}>
                  {activeValidating.map((c) => {
                    const totalCheckins = Object.keys(c.dailyCheckins).length;
                    const progress = Math.round((totalCheckins / c.durationDays) * 100);
                    const myVS = c.validationStatus?.[store.currentUser] || "pending";
                    return (
                      <div key={c.id} className="neo-surface" style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <div>
                            <div className="h3">{c.title}</div>
                            <div className="p">by {c.owner} &bull; {progress}% done</div>
                          </div>
                          {myVS === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="neo-btn" style={{ padding: "6px 10px", fontSize: 12, background: "var(--teal)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, true)}>Approve</button>
                              <button className="neo-btn" style={{ padding: "6px 10px", fontSize: 12, background: "var(--pink)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, false)}>Reject</button>
                            </div>
                          ) : (
                            <span className="neo-badge" style={{ background: myVS === "approved" ? "var(--teal)" : "var(--pink)", fontSize: 11 }}>{myVS}</span>
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
            <Card title="Active Tasks" accent="var(--teal)">
              {tasks.length === 0 ? (
                <div className="p">No tasks yet. <Link href="/pomodoro" style={{ fontWeight: 800, textDecoration: "underline" }}>Create in Pomodoro</Link></div>
              ) : (
                <div className="grid" style={{ gap: 8 }}>
                  {tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="neo-surface-flat" style={{ padding: 10, display: "flex", justifyContent: "space-between", gap: 8, background: t.completedSessions >= t.targetSessions ? "var(--lime)" : "var(--bg)" }}>
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
                    <div key={s.id} className="neo-surface-flat" style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", gap: 8, background: "var(--bg)" }}>
                      <span className="p" style={{ fontWeight: 700 }}>{s.taskTitle}</span>
                      <span className="p">{s.durationMinutes}m &bull; {new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

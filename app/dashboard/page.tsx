"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { ConfirmModal, useConfirm } from "../ui/ConfirmModal";
import { DonutChart, DonutLegend } from "../ui/DonutChart";
import { CoachAdvice } from "../ui/CoachAdvice";
import { useStore, parseTimestamp } from "../lib/store";
import { useAuth } from "../lib/auth-context";

const TASK_COLORS = [
  "var(--yellow)", "var(--teal)", "var(--blue)", "var(--pink)",
  "var(--lime)", "var(--orange)", "#9b59b6", "#e67e22",
];

export default function DashboardPage() {
  const store = useStore();
  const { profile } = useAuth();
  const { tasks, sessions, commitments } = store;
  const { confirm, askConfirm, execute, cancel } = useConfirm();

  const mine = store.myCommitments();
  const validating = store.validatingCommitments();
  const activeCommitments = mine.filter((c) => c.status === "active");
  const activeValidating = validating.filter((c) => c.status === "active");
  const todayMin = store.todayFocusMinutes();
  const streakVal = store.streak();
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const uncheckedToday = activeCommitments.filter((c) => !c.dailyCheckins[today]);

  // ─── New Stats ───
  const totalCommitments = mine.length;
  const completedCommitments = mine.filter((c) => c.status === "completed").length;
  const failedCommitments = mine.filter((c) => c.status === "failed").length;
  const resolvedCommitments = completedCommitments + failedCommitments;
  const fulfillmentPct = resolvedCommitments > 0 ? Math.round((completedCommitments / resolvedCommitments) * 100) : null;

  // Weekly focus time (last 7 days)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const weeklySessions = sessions.filter((s) => parseTimestamp(s.endedAt) >= weekAgo);
    const totalMinutes = weeklySessions.reduce((a, s) => a + s.durationMinutes, 0);

    // Group by task for donut chart
    const byTask = new Map<string, { label: string; value: number }>();
    for (const s of weeklySessions) {
      const key = s.taskTitle || "Free session";
      const existing = byTask.get(key);
      if (existing) {
        existing.value += s.durationMinutes;
      } else {
        byTask.set(key, { label: key, value: s.durationMinutes });
      }
    }

    const segments = Array.from(byTask.values())
      .sort((a, b) => b.value - a.value)
      .map((s, i) => ({ ...s, color: TASK_COLORS[i % TASK_COLORS.length] }));

    // Daily breakdown for bar chart (last 7 days)
    const dailyMinutes: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const mins = weeklySessions
        .filter((s) => {
          const sd = parseTimestamp(s.endedAt);
          return `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, "0")}-${String(sd.getDate()).padStart(2, "0")}` === ds;
        })
        .reduce((a, s) => a + s.durationMinutes, 0);
      dailyMinutes.push({ day: dayLabel, minutes: mins });
    }

    return { totalMinutes, segments, dailyMinutes };
  }, [sessions]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const maxDailyMin = Math.max(...weeklyData.dailyMinutes.map((d) => d.minutes), 1);

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
          <Stat label="Total Commitments" value={String(totalCommitments)} tint="var(--blue)" />
          <Stat label="Weekly Focus" value={`${weeklyData.totalMinutes}m`} tint="var(--teal)" />
          <Stat label="Fulfillment" value={fulfillmentPct !== null ? `${fulfillmentPct}%` : "-"} tint={fulfillmentPct !== null && fulfillmentPct >= 50 ? "var(--lime)" : "var(--ink-soft)"} />
          <Stat label="Streak" value={String(streakVal)} tint="var(--yellow)" />
        </div>

        <div className="grid cols-2" style={{ marginTop: 18, alignItems: "start" }}>
          {/* ─── Left Column ─── */}
          <div className="grid" style={{ gap: 16 }}>
            <CoachAdvice
              page="dashboard"
              triggerKey={today}
              context={{
                activeTasks: tasks.length,
                activeCommitments: activeCommitments.length,
                todaySessions: store.todaySessions().length,
                todayFocusMinutes: todayMin,
                streak: streakVal,
                totalStake: activeCommitments.filter((c) => c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0),
              }}
              hint="This is the user's dashboard overview. Give a warm daily greeting with one actionable tip for today."
            />

            {/* ─── Focus Time by Task (Donut) ─── */}
            <Card title="Focus Time by Task (7 days)" accent="var(--teal)">
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                <DonutChart
                  segments={weeklyData.segments}
                  centerValue={`${weeklyData.totalMinutes}m`}
                  centerLabel="this week"
                />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <DonutLegend segments={weeklyData.segments} />
                </div>
              </div>
            </Card>

            {/* ─── Daily Focus Bar Chart ─── */}
            <Card title="Daily Focus (7 days)" accent="var(--blue)">
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100 }}>
                {weeklyData.dailyMinutes.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-soft)" }}>
                      {d.minutes > 0 ? `${d.minutes}m` : ""}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 32,
                        height: `${Math.max(4, (d.minutes / maxDailyMin) * 80)}px`,
                        borderRadius: 6,
                        background: d.minutes > 0
                          ? "linear-gradient(180deg, var(--teal), var(--blue))"
                          : "rgba(0,0,0,0.04)",
                        transition: "height 0.3s ease",
                      }}
                    />
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-soft)" }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ─── Commitment Breakdown ─── */}
            <Card title="Commitment Overview" accent="var(--yellow)">
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div className="neo-surface-flat" style={{ flex: 1, minWidth: 80, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>{activeCommitments.length}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>Active</div>
                </div>
                <div className="neo-surface-flat" style={{ flex: 1, minWidth: 80, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--lime)" }}>{completedCommitments}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>Completed</div>
                </div>
                <div className="neo-surface-flat" style={{ flex: 1, minWidth: 80, padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--pink)" }}>{failedCommitments}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>Failed</div>
                </div>
              </div>
              {fulfillmentPct !== null && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>Fulfillment rate</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: fulfillmentPct >= 50 ? "var(--lime)" : "var(--pink)" }}>{fulfillmentPct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${fulfillmentPct}%`, background: fulfillmentPct >= 50 ? "var(--lime)" : "var(--pink)" }} />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ─── Right Column ─── */}
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
                    const myVS = c.validationStatus?.[store.currentUser] || "pending";
                    const totalCheckins = Object.keys(c.dailyCheckins).length;
                    const progress = Math.round((totalCheckins / c.durationDays) * 100);
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

            <Card title="Recent Sessions" accent="var(--blue)">
              {sessions.length === 0 ? (
                <div className="p">No sessions recorded yet.</div>
              ) : (
                <div className="grid" style={{ gap: 6 }}>
                  {sessions.slice(0, 6).map((s) => (
                    <div key={s.id} className="neo-surface-flat" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span className="p" style={{ fontWeight: 700 }}>{s.taskTitle}</span>
                      <span className="p" style={{ fontSize: 12 }}>{s.durationMinutes}m · {new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
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
          onConfirm={execute}
          onCancel={cancel}
        />
      )}
    </AppShell>
  );
}

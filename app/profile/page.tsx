"use client";

import { useMemo } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";

const COLORS = ["var(--yellow)", "var(--teal)", "var(--blue)", "var(--pink)", "var(--lime)", "var(--orange)", "var(--yellow)"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ProfilePage() {
  const store = useStore();
  const { profile } = useAuth();
  const { tasks, sessions, commitments } = store;
  const displayName = profile?.username || "User";

  const streakVal = store.streak();
  const totalFocus = sessions.reduce((a, s) => a + s.durationMinutes, 0);
  const completedCommitments = commitments.filter((c) => c.status === "completed").length;
  const failedStake = commitments.filter((c) => c.status === "failed" && c.mode === "stake").length;
  const successRate = commitments.length > 0 ? Math.round((completedCommitments / commitments.length) * 100) : 0;

  const weeklyBars = useMemo(() => {
    const bars: { day: string; minutes: number; sessions: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const daySessions = sessions.filter((s) => s.endedAt.slice(0, 10) === ds);
      bars.push({
        day: DAYS[d.getDay()],
        minutes: daySessions.reduce((a, s) => a + s.durationMinutes, 0),
        sessions: daySessions.length,
      });
    }
    return bars;
  }, [sessions]);

  const maxMin = Math.max(...weeklyBars.map((b) => b.minutes), 1);

  const badges: { label: string; tint: string }[] = [];
  if (streakVal >= 1) badges.push({ label: "Starter", tint: "var(--yellow)" });
  if (streakVal >= 3) badges.push({ label: "On Fire", tint: "var(--orange)" });
  if (streakVal >= 7) badges.push({ label: "Week Warrior", tint: "var(--teal)" });
  if (sessions.length >= 10) badges.push({ label: "Focus Machine", tint: "var(--pink)" });
  if (totalFocus >= 300) badges.push({ label: "5h Club", tint: "var(--blue)" });
  if (failedStake === 0 && commitments.length > 0) badges.push({ label: "No Excuses", tint: "var(--lime)" });

  return (
    <AppShell active="profile">
      <div className="section-pad">
        <div className="grid cols-2" style={{ alignItems: "start" }}>
          <Card title="Profile" accent="var(--yellow)">
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "linear-gradient(135deg, var(--blue), var(--teal))",
                  display: "grid", placeItems: "center",
                  fontWeight: 800, fontSize: 22, color: "white",
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 12px rgba(96,165,250,0.15)",
                }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="h2">{displayName}</div>
                <div className="p">{profile?.email || "Resolution Builder"} · {streakVal}-day streak</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(45,212,191,0.15)" }}>Streak {streakVal}</span>
                  {failedStake === 0 && commitments.length > 0 && (
                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(244,114,182,0.12)" }}>Stake Safe</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid cols-3" style={{ marginTop: 16 }}>
              <Stat label="Commitments" value={String(commitments.length)} tint="var(--yellow)" />
              <Stat label="Success" value={commitments.length > 0 ? `${successRate}%` : "-"} tint="var(--lime)" />
              <Stat label="Focus" value={totalFocus >= 60 ? `${Math.round(totalFocus / 60)}h` : `${totalFocus}m`} tint="var(--teal)" />
            </div>

            <div className="grid cols-2" style={{ marginTop: 12 }}>
              <Stat label="Sessions" value={String(sessions.length)} tint="var(--blue)" />
              <Stat label="Tasks" value={String(tasks.length)} tint="var(--orange)" />
            </div>
          </Card>

          <Card title="Statistics" accent="var(--pink)">
            <div className="grid" style={{ gap: 14 }}>
              <div>
                <div className="h3">Focus — Last 7 Days</div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "flex-end" }}>
                  {weeklyBars.map((b, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                      <div className="p" style={{ fontSize: 11, fontWeight: 700 }}>{b.minutes}m</div>
                      <div
                        style={{
                          width: "100%", minHeight: 10,
                          height: Math.max(10, (b.minutes / maxMin) * 80),
                          background: COLORS[idx], borderRadius: 8,
                          opacity: 0.7,
                          transition: "height 0.3s ease",
                        }}
                      />
                      <div className="p" style={{ fontSize: 11 }}>{b.day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {badges.length > 0 && (
                <div>
                  <div className="h3">Badges</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {badges.map((b) => (
                      <span key={b.label} style={{
                        padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: b.tint, border: "1.5px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      }}>{b.label}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="neo-surface-flat" style={{ padding: 14 }}>
                <div className="h3">Summary</div>
                <div className="grid" style={{ gap: 6, marginTop: 8 }}>
                  {[
                    { label: "Total sessions", value: String(sessions.length) },
                    { label: "Total focus", value: `${totalFocus}m` },
                    { label: "Active commitments", value: String(commitments.filter((c) => c.status === "active").length) },
                    { label: "Failed stakes", value: String(failedStake) },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                      <span className="p" style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</span>
                      <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

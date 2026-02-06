"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";

function fmt(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PomodoroPage() {
  const store = useStore();
  const { tasks, sessions } = store;

  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(4);

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  const selectedTaskIdRef = useRef(selectedTaskId);
  useEffect(() => { selectedTaskIdRef.current = selectedTaskId; }, [selectedTaskId]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((v) => {
        if (v <= 1) {
          if (modeRef.current === "focus") {
            const tid = selectedTaskIdRef.current;
            const task = tid ? store.taskById(tid) : undefined;
            store.logSession(tid || "untitled", task?.title || "Free session", 25, true);
            setCompletedCount((c) => c + 1);
            setMode("break");
            return 5 * 60;
          }
          setMode("focus");
          return 25 * 60;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, store]);

  function reset() {
    setRunning(false);
    setSeconds(mode === "focus" ? 25 * 60 : 5 * 60);
  }

  function switchMode(next: "focus" | "break") {
    setMode(next);
    setRunning(false);
    setSeconds(next === "focus" ? 25 * 60 : 5 * 60);
  }

  async function handleAddTask() {
    if (!newTitle.trim()) return;
    const t = await store.addTask(newTitle.trim(), newTarget);
    setSelectedTaskId(t.id);
    setNewTitle("");
    setNewTarget(4);
  }

  const todayS = store.todaySessions();
  const todayMin = store.todayFocusMinutes();
  const streakVal = store.streak();
  const selectedTask = selectedTaskId ? store.taskById(selectedTaskId) : undefined;
  const last7 = sessions.slice(0, 15);

  return (
    <AppShell active="pomodoro">
      <div style={{ padding: "20px 0 34px" }}>
        <h1 className="h2">Timeboxing &times; Pomodoro</h1>
        <p className="p" style={{ marginTop: 6 }}>Create tasks, set session targets, and run your focus timer.</p>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          {/* LEFT: Task list + create */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Create Task" accent="var(--yellow)">
              <div className="grid" style={{ gap: 10 }}>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task name..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="neo-input"
                />
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label className="p" style={{ fontWeight: 800 }}>Target sessions:</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 4, 6, 8].map((n) => (
                      <button key={n} className="neo-btn" onClick={() => setNewTarget(n)} style={{ padding: "8px 12px", background: newTarget === n ? "var(--teal)" : "var(--paper)" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="neo-btn" onClick={handleAddTask} style={{ background: "var(--yellow)" }}>
                  + Add Task
                </button>
              </div>
            </Card>

            <Card title="Task List" accent="var(--teal)">
              {tasks.length === 0 ? (
                <div className="p">No tasks yet. Create your first task above.</div>
              ) : (
                <div className="grid" style={{ gap: 8 }}>
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="neo-surface"
                      style={{ padding: 12, background: selectedTaskId === t.id ? "var(--lime)" : "var(--paper)", cursor: "pointer" }}
                      onClick={() => setSelectedTaskId(t.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div>
                          <div className="h3">{t.title}</div>
                          <div className="p">{t.completedSessions}/{t.targetSessions} sessions</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {t.completedSessions >= t.targetSessions && (
                            <span className="neo-badge" style={{ background: "var(--teal)" }}>Done</span>
                          )}
                          <button className="neo-btn secondary" style={{ padding: "6px 10px" }} onClick={(e) => { e.stopPropagation(); store.deleteTask(t.id); }}>
                            x
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, height: 10, border: "2px solid var(--ink)", borderRadius: 999, background: "var(--paper)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, (t.completedSessions / t.targetSessions) * 100)}%`, height: "100%", background: "var(--yellow)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: Timer + Stats */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Timer" accent="var(--pink)">
              {selectedTask && (
                <div className="neo-badge" style={{ background: "var(--lime)", marginBottom: 10 }}>
                  {selectedTask.title} ({selectedTask.completedSessions}/{selectedTask.targetSessions})
                </div>
              )}
              {!selectedTask && tasks.length > 0 && (
                <div className="p" style={{ marginBottom: 10, fontWeight: 800 }}>Select a task on the left to begin</div>
              )}

              <div className="neo-surface" style={{ padding: 18, background: "var(--bg)" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: mode === "focus" ? "var(--yellow)" : "var(--paper)" }} onClick={() => switchMode("focus")}>Focus 25m</button>
                  <button className="neo-btn" style={{ background: mode === "break" ? "var(--pink)" : "var(--paper)" }} onClick={() => switchMode("break")}>Break 5m</button>
                </div>

                <div className="neo-surface" style={{ marginTop: 14, padding: 18, background: mode === "focus" ? "var(--yellow)" : "var(--pink)", textAlign: "center" }}>
                  <div className="h1" style={{ fontSize: 64 }}>{fmt(seconds)}</div>
                  <div className="p" style={{ color: "var(--ink)", fontWeight: 900 }}>
                    {mode === "focus" ? "FOCUS" : "BREAK"} &bull; Session {completedCount + 1}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button className="neo-btn" onClick={() => setRunning((r) => !r)} style={{ background: "var(--teal)" }}>
                    {running ? "Pause" : "Start"}
                  </button>
                  <button className="neo-btn secondary" onClick={reset}>Reset</button>
                </div>
              </div>
            </Card>

            <Card title="Today's Stats" accent="var(--blue)">
              <div className="grid cols-3">
                <Stat label="Sessions" value={String(todayS.length)} tint="var(--yellow)" />
                <Stat label="Focus" value={`${todayMin}m`} tint="var(--teal)" />
                <Stat label="Streak" value={String(streakVal)} tint="var(--pink)" />
              </div>
              {last7.length > 0 && (
                <div className="neo-surface" style={{ padding: 14, marginTop: 12 }}>
                  <div className="h3">Recent Sessions</div>
                  <div className="grid" style={{ gap: 6, marginTop: 8 }}>
                    {last7.map((s) => (
                      <div key={s.id} className="neo-surface-flat" style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", gap: 8, background: s.completed ? "var(--bg)" : "var(--paper)" }}>
                        <span className="p" style={{ fontWeight: 700 }}>{s.taskTitle}</span>
                        <span className="p">{s.durationMinutes}m &bull; {new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

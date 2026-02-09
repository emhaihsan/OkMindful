"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";

function fmt(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const STORAGE_KEY = "ok_pomodoro_state";

interface TimerState {
  mode: "focus" | "break";
  running: boolean;
  endAt: number | null;
  remaining: number;
  completedCount: number;
  selectedTaskId: string;
  focusMinutes: number;
}

function loadState(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimerState) : null;
  } catch { return null; }
}

function saveState(s: TimerState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
}

export default function PomodoroPage() {
  const store = useStore();
  const { tasks, sessions } = store;

  const init = useRef(loadState());
  const now = Date.now();
  const r = init.current;

  const [mode, setMode] = useState<"focus" | "break">(r?.mode ?? "focus");
  const [running, setRunning] = useState(() => !!(r?.running && r.endAt && r.endAt > now));
  const [seconds, setSeconds] = useState(() => {
    if (r?.running && r.endAt) {
      const left = Math.max(0, Math.round((r.endAt - now) / 1000));
      return left > 0 ? left : 0;
    }
    return r?.remaining ?? 25 * 60;
  });
  const [completedCount, setCompletedCount] = useState(r?.completedCount ?? 0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(r?.selectedTaskId ?? "");
  const [focusMinutes, setFocusMinutes] = useState(r?.focusMinutes ?? 25);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState(4);

  const persist = useCallback(() => {
    saveState({ mode, running, endAt: running ? Date.now() + seconds * 1000 : null, remaining: seconds, completedCount, selectedTaskId, focusMinutes });
  }, [mode, running, seconds, completedCount, selectedTaskId, focusMinutes]);
  useEffect(() => { persist(); }, [persist]);

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const taskIdRef = useRef(selectedTaskId);
  useEffect(() => { taskIdRef.current = selectedTaskId; }, [selectedTaskId]);
  const focusRef = useRef(focusMinutes);
  useEffect(() => { focusRef.current = focusMinutes; }, [focusMinutes]);

  // Handle timer expired while away — defer logSession to avoid setState during render
  useEffect(() => {
    if (r?.running && r.endAt && r.endAt <= now) {
      if (r.mode === "focus") {
        const tid = r.selectedTaskId;
        const task = tid ? store.taskById(tid) : undefined;
        setTimeout(() => store.logSession(tid || "untitled", task?.title || "Free session", r.focusMinutes, true), 0);
        setCompletedCount((c) => c + 1);
        setMode("break");
        setSeconds(5 * 60);
      } else {
        setMode("focus");
        setSeconds(r.focusMinutes * 60);
      }
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((v) => {
        if (v <= 1) {
          if (modeRef.current === "focus") {
            const tid = taskIdRef.current;
            const task = tid ? store.taskById(tid) : undefined;
            store.logSession(tid || "untitled", task?.title || "Free session", focusRef.current, true);
            setCompletedCount((c) => c + 1);
            setMode("break");
            setRunning(false);
            return 5 * 60;
          }
          setMode("focus");
          setRunning(false);
          return focusRef.current * 60;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, store]);

  function reset() { setRunning(false); setSeconds(mode === "focus" ? focusMinutes * 60 : 5 * 60); }
  function switchMode(next: "focus" | "break") { setMode(next); setRunning(false); setSeconds(next === "focus" ? focusMinutes * 60 : 5 * 60); }
  function setCustomFocus(mins: number) {
    const m = Math.max(1, Math.min(120, mins));
    setFocusMinutes(m);
    if (mode === "focus" && !running) setSeconds(m * 60);
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
      <div className="section-pad">
        <h1 className="h2">Focus Timer</h1>
        <p className="p" style={{ marginTop: 6 }}>Timer persists when you navigate away. Use short durations (1-2m) for quick demos.</p>

        <div className="grid cols-2" style={{ marginTop: 18, alignItems: "start" }}>
          {/* LEFT */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Create Task" accent="var(--yellow)">
              <div className="grid" style={{ gap: 10 }}>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task name..." onKeyDown={(e) => e.key === "Enter" && handleAddTask()} className="neo-input" />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <label className="p" style={{ fontWeight: 700, fontSize: 13 }}>Target:</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 4, 6, 8].map((n) => (
                      <button key={n} onClick={() => setNewTarget(n)} style={{ padding: "6px 12px", fontSize: 13, fontWeight: newTarget === n ? 700 : 500, borderRadius: 10, border: newTarget === n ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent", background: newTarget === n ? "var(--teal)" : "transparent", cursor: "pointer" }}>{n}</button>
                    ))}
                  </div>
                </div>
                <button className="neo-btn" onClick={handleAddTask} style={{ background: "var(--yellow)" }}>+ Add Task</button>
              </div>
            </Card>

            <Card title="Task List" accent="var(--teal)">
              {tasks.length === 0 ? (
                <div className="p">No tasks yet. Create your first task above.</div>
              ) : (
                <div className="grid" style={{ gap: 8 }}>
                  {tasks.map((t) => (
                    <div key={t.id} className="neo-surface-flat" style={{ padding: 12, cursor: "pointer", border: selectedTaskId === t.id ? "1.5px solid rgba(163,230,53,0.4)" : undefined, background: selectedTaskId === t.id ? "rgba(163,230,53,0.1)" : undefined, transition: "all 0.2s ease" }} onClick={() => setSelectedTaskId(t.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div>
                          <div className="h3">{t.title}</div>
                          <div className="p" style={{ fontSize: 12 }}>{t.completedSessions}/{t.targetSessions} sessions</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          {t.completedSessions >= t.targetSessions && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(45,212,191,0.15)" }}>Done</span>}
                          <button onClick={(e) => { e.stopPropagation(); store.deleteTask(t.id); }} style={{ padding: "4px 8px", fontSize: 12, borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.08)", background: "transparent", cursor: "pointer", color: "var(--ink-soft)" }}>×</button>
                        </div>
                      </div>
                      <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-bar-fill" style={{ width: `${Math.min(100, (t.completedSessions / t.targetSessions) * 100)}%`, background: "var(--yellow)" }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div className="grid" style={{ gap: 16 }}>
            <Card title="Timer" accent="var(--pink)">
              {selectedTask && <div style={{ marginBottom: 12, padding: "4px 12px", borderRadius: 999, display: "inline-flex", fontSize: 12, fontWeight: 600, background: "rgba(163,230,53,0.12)" }}>{selectedTask.title} ({selectedTask.completedSessions}/{selectedTask.targetSessions})</div>}
              {!selectedTask && tasks.length > 0 && <div className="p" style={{ marginBottom: 12, fontWeight: 600 }}>Select a task on the left to begin</div>}

              <div className="neo-surface-flat" style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => switchMode("focus")} style={{ padding: "7px 14px", fontSize: 13, fontWeight: mode === "focus" ? 700 : 500, borderRadius: 10, border: mode === "focus" ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent", background: mode === "focus" ? "var(--yellow)" : "transparent", cursor: "pointer" }}>Focus</button>
                  <button onClick={() => switchMode("break")} style={{ padding: "7px 14px", fontSize: 13, fontWeight: mode === "break" ? 700 : 500, borderRadius: 10, border: mode === "break" ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent", background: mode === "break" ? "var(--pink)" : "transparent", cursor: "pointer" }}>Break 5m</button>
                </div>

                {mode === "focus" && !running && (
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span className="p" style={{ fontSize: 12, fontWeight: 600 }}>Duration:</span>
                    {[1, 2, 5, 15, 25, 45].map((m) => (
                      <button key={m} onClick={() => setCustomFocus(m)} style={{ padding: "4px 10px", fontSize: 12, fontWeight: focusMinutes === m ? 700 : 500, borderRadius: 8, border: focusMinutes === m ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent", background: focusMinutes === m ? "var(--lime)" : "transparent", cursor: "pointer" }}>{m}m</button>
                    ))}
                    <input type="number" min={1} max={120} value={focusMinutes} onChange={(e) => setCustomFocus(parseInt(e.target.value) || 25)} className="neo-input" style={{ width: 56, padding: "4px 6px", fontSize: 12, textAlign: "center" }} />
                  </div>
                )}

                <div style={{ marginTop: 16, padding: "28px 18px", textAlign: "center", borderRadius: 18, background: mode === "focus" ? "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.08))" : "linear-gradient(135deg, rgba(244,114,182,0.15), rgba(244,114,182,0.08))", border: `1.5px solid ${mode === "focus" ? "rgba(251,191,36,0.2)" : "rgba(244,114,182,0.2)"}` }}>
                  <div className="h1" style={{ fontSize: 64, fontWeight: 800 }}>{fmt(seconds)}</div>
                  <div className="p" style={{ color: "var(--ink)", fontWeight: 700, marginTop: 4, fontSize: 13 }}>{mode === "focus" ? "FOCUS" : "BREAK"} · Session {completedCount + 1}</div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  <button className="neo-btn" onClick={() => setRunning((r) => !r)} style={{ background: "var(--teal)", padding: "10px 20px" }}>{running ? "Pause" : "Start"}</button>
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
                <div style={{ marginTop: 14 }}>
                  <div className="h3" style={{ marginBottom: 8 }}>Recent Sessions</div>
                  <div className="grid" style={{ gap: 6 }}>
                    {last7.map((s) => (
                      <div key={s.id} className="neo-surface-flat" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span className="p" style={{ fontWeight: 700 }}>{s.taskTitle}</span>
                        <span className="p">{s.durationMinutes}m · {new Date(s.endedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
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

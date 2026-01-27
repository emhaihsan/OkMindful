"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PomodoroPage() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [sessions, setSessions] = useState(1);

  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const targetSeconds = useMemo(() => (mode === "focus" ? 25 * 60 : 5 * 60), [mode]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((v) => {
        if (v <= 1) {
          if (modeRef.current === "focus") {
            setMode("break");
            setSessions((s) => s + 1);
            return 5 * 60;
          }

          setMode("focus");
          return 25 * 60;
        }

        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  function reset() {
    setRunning(false);
    setSeconds(targetSeconds);
  }

  function toggle() {
    setRunning((r) => !r);
  }

  function switchMode(next: "focus" | "break") {
    setMode(next);
    setRunning(false);
    setSeconds(next === "focus" ? 25 * 60 : 5 * 60);
  }

  return (
    <AppShell active="pomodoro">
      <div style={{ padding: "20px 0 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="h2">Pomodoro</h1>
            <p className="p" style={{ marginTop: 6 }}>
              UI mock untuk produktivitas harian. Timer sederhana + log (dummy).
            </p>
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          <Card title="Timer" accent="var(--teal)">
            <div className="neo-surface" style={{ padding: 18, background: "var(--bg)" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  className="neo-btn"
                  style={{ background: mode === "focus" ? "var(--yellow)" : "var(--paper)" }}
                  onClick={() => switchMode("focus")}
                >
                  Focus 25m
                </button>
                <button
                  className="neo-btn"
                  style={{ background: mode === "break" ? "var(--pink)" : "var(--paper)" }}
                  onClick={() => switchMode("break")}
                >
                  Break 5m
                </button>
              </div>

              <div
                className="neo-surface"
                style={{
                  marginTop: 14,
                  padding: 18,
                  background: mode === "focus" ? "var(--yellow)" : "var(--pink)",
                  textAlign: "center",
                }}
              >
                <div className="h1" style={{ fontSize: 64 }}>
                  {formatMMSS(seconds)}
                </div>
                <div className="p" style={{ color: "var(--ink)", fontWeight: 900 }}>
                  Mode: {mode === "focus" ? "FOCUS" : "BREAK"} • Sessions: {sessions}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                <button className="neo-btn" onClick={toggle} style={{ background: "var(--teal)" }}>
                  {running ? "Pause" : "Start"}
                </button>
                <button className="neo-btn secondary" onClick={reset}>
                  Reset
                </button>
                <button className="neo-btn" style={{ background: "var(--lime)" }}>
                  Log sesi (mock)
                </button>
              </div>
            </div>
          </Card>

          <Card title="Hari ini" accent="var(--yellow)">
            <div className="grid cols-3">
              <Stat label="Sesi" value="1/2" tint="var(--yellow)" />
              <Stat label="Fokus" value="25m" tint="var(--teal)" />
              <Stat label="Streak" value="7" tint="var(--pink)" />
            </div>

            <div className="grid" style={{ gap: 12, marginTop: 14 }}>
              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Task list (mock)</div>
                <div className="p" style={{ marginTop: 8 }}>
                  1) Tulis 3 tujuan hari ini
                  <br />
                  2) 1 sesi fokus sebelum meeting
                  <br />
                  3) 1 sesi fokus setelah lunch
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Check-in komitmen</div>
                <div className="p" style={{ marginTop: 6 }}>
                  Komitmen “Pomodoro 2x per hari” akan sukses jika kamu log 2 sesi.
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--yellow)" }}>
                    Selesai 1 sesi
                  </button>
                  <button className="neo-btn secondary">Lewatkan (risk)</button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

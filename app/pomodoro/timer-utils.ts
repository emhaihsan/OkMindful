export function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const STORAGE_KEY = "ok_pomodoro_state";

export interface TimerState {
  mode: "focus" | "break";
  running: boolean;
  endAt: number | null;
  remaining: number;
  completedCount: number;
  selectedTaskId: string;
  focusMinutes: number;
}

export function loadTimerState(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TimerState) : null;
  } catch {
    return null;
  }
}

export function saveTimerState(s: TimerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Task, PomodoroSession, Commitment, ChatMessage } from "./types";
import { useAuth } from "./auth-context";
import { createClient } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;

function uid() {
  return crypto.randomUUID();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Row → App model mappers ── */

interface CommitmentRow {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  mode: string;
  stake_amount: number;
  duration_days: number;
  start_date: string;
  deadline_date: string;
  fund_destination: string;
  status: string;
  daily_checkins: Record<string, boolean>;
  owner_profile?: { username: string } | { username: string }[];
  commitment_validators?: ValidatorRow[];
}

interface ValidatorRow {
  validator_id: string;
  status: string;
  validator_profile?: { username: string } | { username: string }[];
}

function mapCommitment(row: CommitmentRow): Commitment {
  const ownerProfile = row.owner_profile;
  const ownerUsername = ownerProfile
    ? Array.isArray(ownerProfile)
      ? ownerProfile[0]?.username ?? "unknown"
      : ownerProfile.username
    : "unknown";

  const validators: string[] = [];
  const validationStatus: Record<string, "pending" | "approved" | "rejected"> = {};

  if (row.commitment_validators) {
    for (const cv of row.commitment_validators) {
      const vp = cv.validator_profile;
      const vUsername = vp
        ? Array.isArray(vp)
          ? vp[0]?.username ?? "unknown"
          : vp.username
        : "unknown";
      validators.push(vUsername);
      validationStatus[vUsername] = cv.status as "pending" | "approved" | "rejected";
    }
  }

  return {
    id: row.id,
    owner: ownerUsername,
    title: row.title,
    description: row.description || "",
    mode: row.mode as "commit" | "stake",
    stakeAmount: row.stake_amount,
    durationDays: row.duration_days,
    startDate: row.start_date,
    deadlineDate: row.deadline_date || "",
    fundDestination: row.fund_destination || "",
    validators,
    dailyCheckins: (row.daily_checkins || {}) as Record<string, boolean>,
    status: row.status as "active" | "completed" | "failed",
    validationStatus,
  };
}

/* ── Store interface ── */

interface Store {
  currentUser: string;

  tasks: Task[];
  sessions: PomodoroSession[];
  commitments: Commitment[];
  messages: ChatMessage[];
  ready: boolean;

  addTask: (title: string, targetSessions: number) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  incrementTaskSession: (id: string) => Promise<void>;

  logSession: (taskId: string, taskTitle: string, durationMinutes: number, completed: boolean) => Promise<PomodoroSession>;

  addCommitment: (c: Omit<Commitment, "id" | "dailyCheckins" | "status" | "owner" | "validationStatus">) => Promise<Commitment>;
  deleteCommitment: (id: string) => Promise<void>;
  checkinCommitment: (id: string, date?: string) => Promise<void>;
  validateCommitment: (id: string, validatorUsername: string, approve: boolean) => Promise<void>;

  myCommitments: () => Commitment[];
  validatingCommitments: () => Commitment[];

  addMessage: (role: "user" | "assistant", content: string, opikTraceId?: string) => Promise<ChatMessage>;
  clearMessages: () => Promise<void>;

  todaySessions: () => PomodoroSession[];
  todayFocusMinutes: () => number;
  streak: () => number;
  taskById: (id: string) => Task | undefined;

  refreshCommitments: () => Promise<void>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const clientRef = useRef<SupabaseClient | null>(null);
  function sb(): SupabaseClient {
    if (!clientRef.current) clientRef.current = createClient() as SupabaseClient;
    return clientRef.current;
  }

  const currentUser = profile?.username ?? "";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);

  /* ── Fetch all data when user logs in ── */
  const fetchAll = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setSessions([]);
      setCommitments([]);
      setMessages([]);
      setReady(true);
      return;
    }

    const [tRes, sRes, cRes, mRes] = await Promise.all([
      sb().from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      sb().from("pomodoro_sessions").select("*").eq("user_id", user.id).order("ended_at", { ascending: false }),
      sb().from("commitments").select("*, owner_profile:profiles!commitments_owner_id_fkey(username), commitment_validators(validator_id, status, validator_profile:profiles!commitment_validators_validator_id_fkey(username))").order("created_at", { ascending: false }),
      sb().from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    ]);

    if (tRes.data) {
      setTasks(tRes.data.map((r: Row) => ({
        id: r.id as string,
        title: r.title as string,
        targetSessions: r.target_sessions as number,
        completedSessions: r.completed_sessions as number,
        createdAt: r.created_at as string,
      })));
    }
    if (sRes.data) {
      setSessions(sRes.data.map((r: Row) => ({
        id: r.id as string,
        taskId: (r.task_id as string) || "",
        taskTitle: r.task_title as string,
        startedAt: r.started_at as string,
        endedAt: r.ended_at as string,
        durationMinutes: r.duration_minutes as number,
        completed: r.completed as boolean,
      })));
    }
    if (cRes.data) {
      setCommitments(cRes.data.map((r: Row) => mapCommitment(r as unknown as CommitmentRow)));
    }
    if (mRes.data) {
      setMessages(mRes.data.map((r: Row) => ({
        id: r.id as string,
        role: r.role as "user" | "assistant",
        content: r.content as string,
        timestamp: r.created_at as string,
        opikTraceId: (r.opik_trace_id as string) || undefined,
      })));
    }
    setReady(true);
  }, [user]);

  useEffect(() => {
    fetchAll(); // eslint-disable-line react-hooks/set-state-in-effect -- async Supabase hydration
  }, [fetchAll]);

  /* ── Refresh commitments (called after mutations) ── */
  const refreshCommitments = useCallback(async () => {
    const { data } = await sb()
      .from("commitments")
      .select("*, owner_profile:profiles!commitments_owner_id_fkey(username), commitment_validators(validator_id, status, validator_profile:profiles!commitment_validators_validator_id_fkey(username))")
      .order("created_at", { ascending: false });
    if (data) setCommitments(data.map((r: Row) => mapCommitment(r as unknown as CommitmentRow)));
  }, []);

  /* ── Tasks ── */
  const addTask = useCallback(async (title: string, targetSessions: number) => {
    const t: Task = { id: uid(), title, targetSessions, completedSessions: 0, createdAt: new Date().toISOString() };
    setTasks((prev) => [t, ...prev]);
    await sb().from("tasks").insert({ id: t.id, user_id: user!.id, title, target_sessions: targetSessions });
    return t;
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await sb().from("tasks").delete().eq("id", id);
  }, []);

  const incrementTaskSession = useCallback(async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completedSessions: t.completedSessions + 1 } : t))
    );
    try {
      await sb().rpc("increment_task_session", { task_id_input: id });
    } catch {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        await sb().from("tasks").update({ completed_sessions: task.completedSessions + 1 }).eq("id", id);
      }
    }
  }, [tasks]);

  /* ── Sessions ── */
  const logSession = useCallback(async (taskId: string, taskTitle: string, durationMinutes: number, completed: boolean) => {
    const s: PomodoroSession = {
      id: uid(),
      taskId,
      taskTitle,
      startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes,
      completed,
    };
    setSessions((prev) => [s, ...prev]);
    await sb().from("pomodoro_sessions").insert({
      id: s.id, user_id: user!.id, task_id: taskId || null, task_title: taskTitle,
      started_at: s.startedAt, ended_at: s.endedAt, duration_minutes: durationMinutes, completed,
    });
    if (completed) {
      // Increment task session via direct update
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completedSessions: t.completedSessions + 1 } : t)));
        await sb().from("tasks").update({ completed_sessions: task.completedSessions + 1 }).eq("id", taskId);
      }
    }
    return s;
  }, [user, tasks]);

  /* ── Commitments ── */
  const addCommitment = useCallback(async (c: Omit<Commitment, "id" | "dailyCheckins" | "status" | "owner" | "validationStatus">) => {
    const id = uid();

    // Look up validator profile IDs by username or email
    const validatorIds: { username: string; id: string }[] = [];
    if (c.validators.length > 0) {
      const lower = c.validators.map((v) => v.toLowerCase());
      // Try username match first
      const { data: byUsername } = await sb()
        .from("profiles")
        .select("id, username")
        .in("username", lower);
      if (byUsername) validatorIds.push(...(byUsername as { username: string; id: string }[]));
      // For any not found by username, try email match
      const foundUsernames = new Set(validatorIds.map((v) => v.username));
      const remaining = lower.filter((v) => !foundUsernames.has(v));
      if (remaining.length > 0) {
        const { data: byEmail } = await sb()
          .from("profiles")
          .select("id, username, email")
          .in("email", remaining);
        if (byEmail) {
          for (const p of byEmail as { id: string; username: string; email: string }[]) {
            if (!foundUsernames.has(p.username)) {
              validatorIds.push({ id: p.id, username: p.username });
            }
          }
        }
      }
    }

    // Deduct balance for stake mode
    if (c.mode === "stake" && c.stakeAmount > 0) {
      const { data: prof } = await sb().from("profiles").select("balance").eq("id", user!.id).single();
      const curBal = (prof as { balance: number } | null)?.balance ?? 0;
      if (curBal < c.stakeAmount) throw new Error("Insufficient balance");
      await sb().from("profiles").update({ balance: curBal - c.stakeAmount }).eq("id", user!.id);
    }

    // Insert commitment
    await sb().from("commitments").insert({
      id,
      owner_id: user!.id,
      title: c.title,
      description: c.description,
      mode: c.mode,
      stake_amount: c.stakeAmount,
      duration_days: c.durationDays,
      start_date: c.startDate,
      deadline_date: c.deadlineDate || null,
      fund_destination: c.fundDestination || null,
      daily_checkins: {},
    });

    // Insert validator rows
    if (validatorIds.length > 0) {
      await sb().from("commitment_validators").insert(
        validatorIds.map((v) => ({ commitment_id: id, validator_id: v.id }))
      );
    }

    await refreshCommitments();

    const vs: Record<string, "pending" | "approved" | "rejected"> = {};
    for (const v of c.validators) vs[v.toLowerCase()] = "pending";

    return {
      ...c,
      id,
      owner: currentUser,
      deadlineDate: c.deadlineDate || "",
      fundDestination: c.fundDestination || "",
      dailyCheckins: {},
      status: "active" as const,
      validationStatus: vs,
    };
  }, [user, currentUser, refreshCommitments]);

  const deleteCommitment = useCallback(async (id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
    await sb().from("commitments").delete().eq("id", id);
  }, []);

  const checkinCommitment = useCallback(async (id: string, date?: string) => {
    const d = date || todayStr();
    setCommitments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, dailyCheckins: { ...c.dailyCheckins, [d]: true } } : c
      )
    );
    // Get current checkins then merge
    const { data: row } = await sb().from("commitments").select("daily_checkins").eq("id", id).single();
    const existing = (row?.daily_checkins || {}) as Record<string, boolean>;
    await sb().from("commitments").update({ daily_checkins: { ...existing, [d]: true } }).eq("id", id);
  }, []);

  const validateCommitment = useCallback(async (id: string, validatorUsername: string, approve: boolean) => {
    // Find validator profile id
    const { data: vProfile } = await sb()
      .from("profiles")
      .select("id")
      .eq("username", validatorUsername.toLowerCase())
      .single();

    if (!vProfile) return;

    await sb()
      .from("commitment_validators")
      .update({ status: approve ? "approved" : "rejected", decided_at: new Date().toISOString() })
      .eq("commitment_id", id)
      .eq("validator_id", vProfile.id);

    // Refresh to get updated status (trigger handles commitment status)
    await refreshCommitments();
  }, [refreshCommitments]);

  /* ── Commitment filters ── */
  const myCommitments = useCallback(() => {
    return commitments.filter((c) => c.owner === currentUser);
  }, [commitments, currentUser]);

  const validatingCommitments = useCallback(() => {
    return commitments.filter((c) => c.owner !== currentUser && c.validators.some((v) => v.toLowerCase() === currentUser));
  }, [commitments, currentUser]);

  /* ── Messages ── */
  const addMessage = useCallback(async (role: "user" | "assistant", content: string, opikTraceId?: string) => {
    const m: ChatMessage = { id: uid(), role, content, timestamp: new Date().toISOString(), opikTraceId };
    setMessages((prev) => [...prev, m]);
    await sb().from("chat_messages").insert({
      id: m.id, user_id: user!.id, role, content, opik_trace_id: opikTraceId || null,
    });
    return m;
  }, [user]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    if (user) await sb().from("chat_messages").delete().eq("user_id", user.id);
  }, [user]);

  /* ── Derived helpers ── */
  const todaySessions = useCallback(() => {
    const d = todayStr();
    return sessions.filter((s) => s.endedAt.slice(0, 10) === d);
  }, [sessions]);

  const todayFocusMinutes = useCallback(() => {
    return todaySessions().reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [todaySessions]);

  const streak = useCallback(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().slice(0, 10);
      const hasSessions = sessions.some((s) => s.endedAt.slice(0, 10) === ds && s.completed);
      const hasCheckin = commitments.some((c) => c.dailyCheckins[ds]);
      if (hasSessions || hasCheckin) {
        count++;
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [sessions, commitments]);

  const taskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const value: Store = {
    currentUser,
    tasks,
    sessions,
    commitments,
    messages,
    ready,
    addTask,
    deleteTask,
    incrementTaskSession,
    logSession,
    addCommitment,
    deleteCommitment,
    checkinCommitment,
    validateCommitment,
    myCommitments,
    validatingCommitments,
    addMessage,
    clearMessages,
    todaySessions,
    todayFocusMinutes,
    streak,
    taskById,
    refreshCommitments,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export interface Task {
  id: string;
  title: string;
  targetSessions: number;
  completedSessions: number;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  completed: boolean;
}

export interface Commitment {
  id: string;
  owner: string;
  title: string;
  description: string;
  mode: "commit" | "stake";
  stakeAmount: number;
  durationDays: number;
  startDate: string;
  deadlineDate: string;
  fundDestination: string;
  validators: string[];
  dailyCheckins: Record<string, boolean>;
  status: "active" | "completed" | "failed";
  validationStatus: Record<string, "pending" | "approved" | "rejected">;
  checkinFrequency?: "daily" | "weekly" | "end";
  selfAssigned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  opikTraceId?: string;
  conversationId?: string;
}

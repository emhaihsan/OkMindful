const OPIK_BASE_URL = process.env.OPIK_BASE_URL || "https://www.comet.com/opik/api";
const OPIK_API_KEY = process.env.OPIK_API_KEY || "";
const OPIK_WORKSPACE = process.env.OPIK_WORKSPACE || "";
const OPIK_PROJECT = process.env.OPIK_PROJECT || "okmindful";

function headers() {
  return {
    "Content-Type": "application/json",
    authorization: OPIK_API_KEY,
    "Comet-Workspace": OPIK_WORKSPACE,
  };
}

function enabled() {
  return !!(OPIK_API_KEY && OPIK_WORKSPACE);
}

export async function createTrace(params: {
  id: string;
  name: string;
  input: Record<string, unknown>;
  startTime?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/traces`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        id: params.id,
        name: params.name,
        project_name: OPIK_PROJECT,
        start_time: params.startTime || new Date().toISOString(),
        input: params.input,
        metadata: params.metadata || {},
      }),
    });
    return res.ok ? { id: params.id } : null;
  } catch {
    return null;
  }
}

export async function endTrace(params: {
  id: string;
  output: Record<string, unknown>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}) {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/traces`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        id: params.id,
        end_time: new Date().toISOString(),
        output: params.output,
        usage: params.usage,
      }),
    });
    return res.ok;
  } catch {
    return null;
  }
}

export async function createSpan(params: {
  id: string;
  traceId: string;
  name: string;
  type?: "general" | "llm" | "tool";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startTime?: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}) {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/spans`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        id: params.id,
        trace_id: params.traceId,
        project_name: OPIK_PROJECT,
        name: params.name,
        type: params.type || "llm",
        start_time: params.startTime || new Date().toISOString(),
        end_time: params.endTime || new Date().toISOString(),
        input: params.input,
        output: params.output || {},
        metadata: params.metadata || {},
        usage: params.usage,
      }),
    });
    return res.ok;
  } catch {
    return null;
  }
}

export async function addFeedbackScore(params: {
  traceId: string;
  name: string;
  value: number;
  reason?: string;
  categoryName?: string;
}) {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/traces/${params.traceId}/feedback-scores`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify([
        {
          name: params.name,
          value: params.value,
          reason: params.reason || "",
          category_name: params.categoryName || "general",
          source: "sdk",
        },
      ]),
    });
    return res.ok;
  } catch {
    return null;
  }
}

export function isOpikEnabled() {
  return enabled();
}

export function getOpikConfig() {
  return {
    baseUrl: OPIK_BASE_URL,
    workspace: OPIK_WORKSPACE,
    project: OPIK_PROJECT,
    enabled: enabled(),
  };
}

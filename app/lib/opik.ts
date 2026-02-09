/**
 * Generate a UUIDv7 (timestamp-based, sortable).
 * Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
 * where t = 48-bit unix ms, 7 = version, y = variant (8/9/a/b), x = random
 */
export function uuidv7(): string {
  const now = Date.now();
  const ts = now & 0xffffffffffff; // 48-bit ms timestamp
  const rand = new Uint8Array(10);
  crypto.getRandomValues(rand);

  // Bytes 0-5: timestamp (big-endian)
  const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");
  const tsHigh = Math.floor(ts / 0x10000);
  const tsLow = ts & 0xffff;

  // Byte 6-7: version 7 + 12 bits random
  const b6 = 0x70 | (rand[0] & 0x0f);
  const b7 = rand[1];

  // Byte 8: variant 10xx
  const b8 = 0x80 | (rand[2] & 0x3f);
  const b9 = rand[3];

  return (
    hex(tsHigh, 8) + "-" +
    hex(tsLow, 4) + "-" +
    hex(b6, 2) + hex(b7, 2) + "-" +
    hex(b8, 2) + hex(b9, 2) + "-" +
    Array.from(rand.slice(4)).map((b) => hex(b, 2)).join("")
  );
}

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
    const body = {
      traces: [
        {
          id: params.id,
          name: params.name,
          project_name: OPIK_PROJECT,
          start_time: params.startTime || new Date().toISOString(),
          input: params.input,
          metadata: params.metadata || {},
        },
      ],
    };
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/traces/batch`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[opik] createTrace failed:", res.status, await res.text().catch(() => ""));
    return res.ok ? { id: params.id } : null;
  } catch (e) {
    console.error("[opik] createTrace error:", e);
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
    const body = {
      ids: [params.id],
      update: {
        end_time: new Date().toISOString(),
        output: params.output,
        usage: params.usage,
      },
    };
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/traces/batch`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[opik] endTrace failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[opik] endTrace error:", e);
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
    const body = {
      spans: [
        {
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
        },
      ],
    };
    const res = await fetch(`${OPIK_BASE_URL}/v1/private/spans/batch`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[opik] createSpan failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[opik] createSpan error:", e);
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
      body: JSON.stringify({
        name: params.name,
        value: params.value,
        reason: params.reason || "",
        category_name: params.categoryName || "general",
        source: "sdk",
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[opik] addFeedbackScore error:", e);
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

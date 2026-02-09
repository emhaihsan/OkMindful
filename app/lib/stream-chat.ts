export interface ChatContext {
  activeTasks?: number;
  activeCommitments?: number;
  todaySessions?: number;
  todayFocusMinutes?: number;
  streak?: number;
  totalStake?: number;
}

/**
 * Consume an SSE stream from /api/chat and call onToken for each text chunk.
 * Returns { content, traceId } when done.
 */
export async function streamChat(
  messages: { role: string; content: string }[],
  onToken: (text: string) => void,
  context?: ChatContext,
): Promise<{ content: string; traceId: string | null }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });

  // Fallback for non-stream response (error case)
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json();
    onToken(data.content || "No response received.");
    return { content: data.content || "", traceId: data.traceId || null };
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let traceId: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;
      try {
        const data = JSON.parse(jsonStr);
        if (data.traceId) {
          traceId = data.traceId;
        } else if (data.text) {
          fullContent += data.text;
          onToken(data.text);
        } else if (data.done) {
          // stream complete
        }
      } catch { /* skip */ }
    }
  }

  return { content: fullContent, traceId };
}

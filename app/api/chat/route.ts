import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createTrace, endTrace, createSpan, addFeedbackScore } from "../../lib/opik";

const DEFAULT_SYSTEM_PROMPT = `You are a Productivity Advisor AI for OKMindful, a commitment & accountability app for 2026 New Year's resolutions.

Your role:
- Help users plan goals and break them into actionable steps
- Suggest effective pomodoro/timeboxing strategies
- Help create accountability commitments with appropriate stakes
- Review progress and suggest improvements
- Provide motivational support without being preachy

Be concise, practical, and actionable. Use bullet points when listing steps. Keep responses under 200 words unless the user asks for detail. Always respond in the same language the user writes in.`;

/**
 * Load the optimized prompt from the optimizer output if available.
 * The optimizer (Python/Opik Agent Optimizer SDK) writes the best prompt
 * to optimizer/optimized_prompt.txt after running optimization trials.
 * Falls back to the default prompt if the file doesn't exist.
 */
function loadSystemPrompt(): { prompt: string; version: string } {
  const optimizedPaths = [
    join(process.cwd(), "..", "optimizer", "optimized_prompt_hrpo.txt"),
    join(process.cwd(), "..", "optimizer", "optimized_prompt.txt"),
  ];
  for (const p of optimizedPaths) {
    try {
      if (existsSync(p)) {
        const content = readFileSync(p, "utf-8").trim();
        if (content.length > 50) {
          const version = p.includes("hrpo") ? "optimized-hrpo" : "optimized-meta";
          return { prompt: content, version };
        }
      }
    } catch {
      // fall through
    }
  }
  return { prompt: DEFAULT_SYSTEM_PROMPT, version: "v1-default" };
}

const { prompt: SYSTEM_PROMPT, version: PROMPT_VERSION } = loadSystemPrompt();

const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return Response.json(
      {
        content:
          "The AI advisor is temporarily unavailable. Please try again later.",
        traceId: null,
      },
      { status: 200 }
    );
  }

  const traceId = crypto.randomUUID();
  const spanId = crypto.randomUUID();
  const startTime = new Date().toISOString();

  await createTrace({
    id: traceId,
    name: "productivity-advisor-chat",
    input: { messages, message_count: messages.length },
    startTime,
    metadata: { model: GEMINI_MODEL, system_prompt_version: PROMPT_VERSION },
  });

  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      await endTrace({ id: traceId, output: { error: err } });
      console.error("[gemini] API error:", err);
      return Response.json({ content: "The AI advisor encountered an issue. Please try again.", traceId }, { status: 200 });
    }

    const data = await geminiRes.json();
    const content: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    const usageMeta = data.usageMetadata as
      | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
      | undefined;
    const usage = usageMeta
      ? {
          prompt_tokens: usageMeta.promptTokenCount,
          completion_tokens: usageMeta.candidatesTokenCount,
          total_tokens: usageMeta.totalTokenCount,
        }
      : undefined;

    const endTime = new Date().toISOString();

    await createSpan({
      id: spanId,
      traceId,
      name: "gemini-flash-completion",
      type: "llm",
      input: { messages: geminiContents, system_prompt: SYSTEM_PROMPT },
      output: { content },
      startTime,
      endTime,
      metadata: { model: GEMINI_MODEL, temperature: 0.7 },
      usage,
    });

    await endTrace({ id: traceId, output: { content }, usage });

    const wordCount = content.split(/\s+/).length;
    const hasActionItems = /[-•]\s/.test(content) || /\d+[.)]\s/.test(content);
    const relevanceScore =
      content.toLowerCase().includes("pomodoro") ||
      content.toLowerCase().includes("goal") ||
      content.toLowerCase().includes("commit")
        ? 1.0
        : 0.7;

    await addFeedbackScore({
      traceId,
      name: "response_length",
      value: Math.min(wordCount / 200, 1),
      reason: `${wordCount} words`,
    });
    await addFeedbackScore({
      traceId,
      name: "actionability",
      value: hasActionItems ? 1.0 : 0.5,
      reason: hasActionItems ? "Contains action items" : "No action items found",
    });
    await addFeedbackScore({
      traceId,
      name: "topic_relevance",
      value: relevanceScore,
      reason: "Keyword match for productivity topics",
    });

    return Response.json({ content, traceId });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Unknown error";
    console.error("[chat] error:", errMsg);
    await endTrace({ id: traceId, output: { error: errMsg } });
    return Response.json({ content: "Something went wrong. Please try again.", traceId }, { status: 200 });
  }
}

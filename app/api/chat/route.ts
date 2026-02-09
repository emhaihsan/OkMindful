import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { getOpikClient } from "../../lib/opik";
import type { Trace } from "../../lib/opik";

const DEFAULT_SYSTEM_PROMPT = `You are a Productivity Advisor AI for OKMindful, a commitment & accountability app for 2026 New Year's resolutions.

Your role:
- Help users plan goals and break them into actionable steps
- Suggest effective focus timer/timeboxing strategies
- Help create accountability commitments with appropriate stakes
- Review progress and suggest improvements
- Provide motivational support without being preachy

Be concise, practical, and actionable. Use bullet points when listing steps. Keep responses under 200 words unless the user asks for detail. Always respond in the same language the user writes in.`;

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

const GEMINI_MODEL = "gemini-2.5-flash-lite";

interface UserContext {
  activeTasks?: number;
  activeCommitments?: number;
  todaySessions?: number;
  todayFocusMinutes?: number;
  streak?: number;
  totalStake?: number;
}

export async function POST(req: Request) {
  const { messages, context } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    context?: UserContext;
  };

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return Response.json(
      { content: "The AI advisor is temporarily unavailable. Please try again later.", traceId: null },
      { status: 200 }
    );
  }

  // Build context-aware system prompt
  let systemPrompt = SYSTEM_PROMPT;
  if (context) {
    const parts: string[] = ["\n\nCurrent user stats:"];
    if (context.activeTasks !== undefined) parts.push(`- Active tasks: ${context.activeTasks}`);
    if (context.activeCommitments !== undefined) parts.push(`- Active commitments: ${context.activeCommitments}`);
    if (context.todaySessions !== undefined) parts.push(`- Today's focus sessions: ${context.todaySessions}`);
    if (context.todayFocusMinutes !== undefined) parts.push(`- Today's focus minutes: ${context.todayFocusMinutes}`);
    if (context.streak !== undefined) parts.push(`- Current streak: ${context.streak} days`);
    if (context.totalStake !== undefined) parts.push(`- Total active stake: $${context.totalStake}`);
    systemPrompt += parts.join("\n");
  }

  // ── Set up Opik-tracked Gemini client ──
  const opik = getOpikClient();
  let parentTrace: Trace | undefined;

  if (opik) {
    parentTrace = opik.trace({
      name: "productivity-advisor-chat",
      input: { messages, message_count: messages.length, context },
      metadata: {
        model: GEMINI_MODEL,
        system_prompt_version: PROMPT_VERSION,
        tags: ["chat", "advisor"],
      },
    });
  }

  const genAI = new GoogleGenAI({ apiKey: geminiKey });
  const trackedGenAI = opik
    ? trackGemini(genAI, {
        client: opik,
        parent: parentTrace,
        generationName: "gemini-advisor-completion",
        traceMetadata: {
          tags: ["chat", "advisor", "gemini"],
          model: GEMINI_MODEL,
          prompt_version: PROMPT_VERSION,
        },
      })
    : genAI;

  // Build contents for Gemini
  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  const traceId = parentTrace?.data?.id || "no-trace";

  try {
    // Use the SDK's streaming method — opik-gemini auto-traces this
    const response = await trackedGenAI.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: geminiContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        // Send traceId as first SSE event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ traceId })}\n\n`));

        try {
          for await (const chunk of response) {
            const text = chunk.text || "";
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
        } catch (e) {
          console.error("[stream] read error:", e);
        }

        // Send done event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();

        // ── Post-stream: update trace + heuristic scores + LLM-as-judge ──
        const content = fullContent || "No response from Gemini.";

        if (parentTrace) {
          parentTrace.update({ output: { content } });
          parentTrace.end();

          // Heuristic feedback scores
          const wordCount = content.split(/\s+/).length;
          const hasActionItems = /[-•]\s/.test(content) || /\d+[.)]\s/.test(content);
          const relevanceScore =
            content.toLowerCase().includes("focus") ||
            content.toLowerCase().includes("goal") ||
            content.toLowerCase().includes("commit")
              ? 1.0 : 0.7;

          parentTrace.score({ name: "response_length", value: Math.min(wordCount / 200, 1), reason: `${wordCount} words` });
          parentTrace.score({ name: "actionability", value: hasActionItems ? 1.0 : 0.5, reason: hasActionItems ? "Contains action items" : "No action items" });
          parentTrace.score({ name: "topic_relevance", value: relevanceScore, reason: "Keyword match for productivity topics" });

          // LLM-as-Judge (uses a separate tracked call)
          const userQuery = messages[messages.length - 1]?.content || "";
          try {
            await runLlmJudge(trackedGenAI, parentTrace, userQuery, content);
          } catch (e) { console.error("[llm-judge] error:", e); }
        }

        // Flush all pending Opik data
        if ("flush" in trackedGenAI) {
          try { await (trackedGenAI as { flush: () => Promise<void> }).flush(); } catch { /* ok */ }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Unknown error";
    console.error("[chat] error:", errMsg);
    if (parentTrace) {
      parentTrace.update({ output: { error: errMsg } });
      parentTrace.end();
    }
    return Response.json({ content: "Something went wrong. Please try again.", traceId }, { status: 200 });
  }
}

/**
 * Extract a JSON object from a string that may contain markdown fences or noise.
 */
function extractJson(raw: string): string | null {
  const s = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  try { JSON.parse(s); return s; } catch { /* continue */ }
  const match = s.match(/\{[\s\S]*\}/);
  if (match) {
    try { JSON.parse(match[0]); return match[0]; } catch { /* continue */ }
  }
  return null;
}

/**
 * LLM-as-Judge: evaluates AI response quality using a separate Gemini call.
 * Uses gemini-2.0-flash-lite (no thinking tokens) to avoid truncation.
 * Scores are logged as Opik feedback on the parent trace.
 */
async function runLlmJudge(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  genAI: any,
  parentTrace: Trace,
  userQuery: string,
  aiResponse: string,
) {
  const JUDGE_MODEL = "gemini-2.0-flash-lite";

  const judgePrompt = `You are an AI quality evaluator. Score the following AI response on three dimensions.
Return ONLY a JSON object with these exact keys: helpfulness, specificity, safety, reason.
Each score is a number from 0.0 to 1.0. "reason" is a brief 1-sentence explanation.

Scoring criteria:
- helpfulness: Does the response actually help the user? (1.0 = very helpful)
- specificity: Does it give concrete, actionable advice? (1.0 = very specific)
- safety: Is it safe and appropriate? (1.0 = completely safe)

Example output: {"helpfulness":0.8,"specificity":0.7,"safety":1.0,"reason":"Good actionable advice."}

USER QUERY: ${userQuery.slice(0, 500)}

AI RESPONSE: ${aiResponse.slice(0, 1000)}

Respond with ONLY the JSON object, nothing else.`;

  // Create a child span for the judge evaluation
  const judgeSpan = parentTrace.span({
    name: "llm-as-judge-eval",
    type: "llm",
    input: { user_query: userQuery.slice(0, 500), ai_response: aiResponse.slice(0, 1000) },
    metadata: { eval_model: JUDGE_MODEL, eval_type: "llm-as-judge" },
  });

  try {
    const response = await genAI.models.generateContent({
      model: JUDGE_MODEL,
      contents: judgePrompt,
      config: { temperature: 0.0, maxOutputTokens: 1024 },
    });

    const raw = response?.text || "";
    console.log("[llm-judge] raw response:", raw.slice(0, 300));

    const jsonStr = extractJson(raw);
    if (!jsonStr) {
      console.warn("[llm-judge] could not extract JSON from:", raw.slice(0, 200));
      judgeSpan.end();
      return;
    }

    const scores = JSON.parse(jsonStr) as {
      helpfulness?: number; specificity?: number; safety?: number; reason?: string;
    };

    judgeSpan.update({ output: scores });
    judgeSpan.end();

    // Log judge feedback scores on the parent trace
    if (scores.helpfulness !== undefined) {
      parentTrace.score({
        name: "judge_helpfulness",
        value: Math.max(0, Math.min(1, scores.helpfulness)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      });
    }
    if (scores.specificity !== undefined) {
      parentTrace.score({
        name: "judge_specificity",
        value: Math.max(0, Math.min(1, scores.specificity)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      });
    }
    if (scores.safety !== undefined) {
      parentTrace.score({
        name: "judge_safety",
        value: Math.max(0, Math.min(1, scores.safety)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      });
    }

    console.log("[llm-judge] scores logged to Opik:", scores);
  } catch (e) {
    console.error("[llm-judge] error:", e);
    judgeSpan.end();
  }
}

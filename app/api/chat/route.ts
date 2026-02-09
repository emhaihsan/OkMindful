import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { getOpikClient } from "../../lib/opik";
import type { Trace } from "../../lib/opik";

const DEFAULT_SYSTEM_PROMPT = `You are a Productivity Advisor AI for OKMindful, a commitment & accountability app for New Year's resolutions.

Your role:
- Help users plan goals and break them into actionable steps
- Suggest effective focus timer/timeboxing strategies
- Help create accountability commitments with appropriate stakes
- Review progress and suggest improvements
- Provide motivational support without being preachy

Be practical and actionable. Use bullet points when listing steps. Give thorough, helpful responses — don't cut yourself short. Always respond in the same language the user writes in.`;

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
    if (context.streak !== undefined) parts.push(`- Current streak: ${context.streak}`);
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
        maxOutputTokens: 4096,
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

        // ── Post-stream: update trace + heuristic scores ──
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

          // LLM-as-Judge scoring is handled by Opik Online Evaluation rules (server-side)
          // This saves tokens and centralizes evaluation logic in the Opik dashboard.
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

// LLM-as-Judge scoring is now handled by Opik Online Evaluation rules.
// Configure rules in the Opik dashboard under your project's "Rules" tab.
// This saves Gemini tokens and centralizes evaluation logic.

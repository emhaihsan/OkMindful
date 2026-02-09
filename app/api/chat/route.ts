import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createTrace, endTrace, createSpan, addFeedbackScore, uuidv7 } from "../../lib/opik";

const DEFAULT_SYSTEM_PROMPT = `You are a Productivity Advisor AI for OKMindful, a commitment & accountability app for 2026 New Year's resolutions.

Your role:
- Help users plan goals and break them into actionable steps
- Suggest effective focus timer/timeboxing strategies
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
      {
        content:
          "The AI advisor is temporarily unavailable. Please try again later.",
        traceId: null,
      },
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

  const traceId = uuidv7();
  const spanId = uuidv7();
  const startTime = new Date().toISOString();

  await createTrace({
    id: traceId,
    name: "productivity-advisor-chat",
    input: { messages, message_count: messages.length, context },
    startTime,
    metadata: { model: GEMINI_MODEL, system_prompt_version: PROMPT_VERSION },
  });

  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
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

    const encoder = new TextEncoder();
    let fullContent = "";
    let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        // Send traceId as first SSE event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ traceId })}\n\n`));

        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;
              try {
                const chunk = JSON.parse(jsonStr);
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (text) {
                  fullContent += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
                // Capture usage from last chunk
                if (chunk.usageMetadata) {
                  usage = {
                    prompt_tokens: chunk.usageMetadata.promptTokenCount,
                    completion_tokens: chunk.usageMetadata.candidatesTokenCount,
                    total_tokens: chunk.usageMetadata.totalTokenCount,
                  };
                }
              } catch { /* skip malformed chunks */ }
            }
          }
        } catch (e) {
          console.error("[stream] read error:", e);
        }

        // Send done event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();

        // ── Post-stream: Opik tracing (awaited to ensure delivery) ──
        const endTime = new Date().toISOString();
        const content = fullContent || "No response from Gemini.";

        try {
          await createSpan({
            id: spanId,
            traceId,
            name: "gemini-flash-completion",
            type: "llm",
            input: { messages: geminiContents, system_prompt: systemPrompt },
            output: { content },
            startTime,
            endTime,
            metadata: { model: GEMINI_MODEL, temperature: 0.7 },
            usage,
          });
        } catch (e) { console.error("[opik] span error:", e); }

        try {
          await endTrace({ id: traceId, output: { content }, usage });
        } catch (e) { console.error("[opik] endTrace error:", e); }

        const wordCount = content.split(/\s+/).length;
        const hasActionItems = /[-•]\s/.test(content) || /\d+[.)]\s/.test(content);
        const relevanceScore =
          content.toLowerCase().includes("focus") ||
          content.toLowerCase().includes("goal") ||
          content.toLowerCase().includes("commit")
            ? 1.0
            : 0.7;

        try {
          await Promise.all([
            addFeedbackScore({ traceId, name: "response_length", value: Math.min(wordCount / 200, 1), reason: `${wordCount} words` }),
            addFeedbackScore({ traceId, name: "actionability", value: hasActionItems ? 1.0 : 0.5, reason: hasActionItems ? "Contains action items" : "No action items found" }),
            addFeedbackScore({ traceId, name: "topic_relevance", value: relevanceScore, reason: "Keyword match for productivity topics" }),
          ]);
        } catch (e) { console.error("[opik] feedback error:", e); }

        // LLM-as-Judge (awaited so it completes before request ends)
        const userQuery = messages[messages.length - 1]?.content || "";
        try {
          await runLlmJudge(geminiKey, traceId, userQuery, content);
        } catch (e) { console.error("[llm-judge] error:", e); }
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
    await endTrace({ id: traceId, output: { error: errMsg } });
    return Response.json({ content: "Something went wrong. Please try again.", traceId }, { status: 200 });
  }
}

/**
 * Extract a JSON object from a string that may contain markdown fences,
 * thinking tokens, or other noise around the JSON.
 */
function extractJson(raw: string): string | null {
  // Strip markdown fences
  let s = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  // Try direct parse first
  try { JSON.parse(s); return s; } catch { /* continue */ }
  // Regex: find first { ... } block
  const match = s.match(/\{[\s\S]*\}/);
  if (match) {
    try { JSON.parse(match[0]); return match[0]; } catch { /* continue */ }
  }
  return null;
}

async function runLlmJudge(geminiKey: string, traceId: string, userQuery: string, aiResponse: string) {
  const evalSpanId = uuidv7();
  const evalStart = new Date().toISOString();

  // Use gemini-2.0-flash-lite: no thinking tokens, fast, cheap — avoids the
  // truncation bug where thinking tokens eat the maxOutputTokens budget.
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

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${JUDGE_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: judgePrompt }] }],
          generationConfig: { temperature: 0.0, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!res.ok) {
      console.error("[llm-judge] API error:", res.status, await res.text().catch(() => ""));
      return;
    }

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("[llm-judge] raw response:", raw.slice(0, 300));

    const jsonStr = extractJson(raw);
    if (!jsonStr) {
      console.warn("[llm-judge] could not extract JSON from:", raw.slice(0, 200));
      return;
    }

    const scores = JSON.parse(jsonStr) as {
      helpfulness?: number; specificity?: number; safety?: number; reason?: string;
    };

    const evalEnd = new Date().toISOString();

    // Log eval span
    await createSpan({
      id: evalSpanId,
      traceId,
      name: "llm-as-judge-eval",
      type: "llm",
      input: { user_query: userQuery.slice(0, 500), ai_response: aiResponse.slice(0, 1000) },
      output: scores,
      startTime: evalStart,
      endTime: evalEnd,
      metadata: { eval_model: JUDGE_MODEL, eval_type: "llm-as-judge" },
    });

    // Log feedback scores in parallel
    const feedbackPromises: Promise<unknown>[] = [];
    if (scores.helpfulness !== undefined) {
      feedbackPromises.push(addFeedbackScore({
        traceId,
        name: "judge_helpfulness",
        value: Math.max(0, Math.min(1, scores.helpfulness)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      }));
    }
    if (scores.specificity !== undefined) {
      feedbackPromises.push(addFeedbackScore({
        traceId,
        name: "judge_specificity",
        value: Math.max(0, Math.min(1, scores.specificity)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      }));
    }
    if (scores.safety !== undefined) {
      feedbackPromises.push(addFeedbackScore({
        traceId,
        name: "judge_safety",
        value: Math.max(0, Math.min(1, scores.safety)),
        reason: scores.reason || "LLM judge evaluation",
        categoryName: "llm_judge",
      }));
    }
    await Promise.all(feedbackPromises);

    console.log("[llm-judge] scores logged to Opik:", scores);
  } catch (e) {
    console.error("[llm-judge] error:", e);
  }
}

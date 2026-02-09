# Opik Integration — OKMindful

## Architecture Overview

Every AI chat interaction in OKMindful is fully traced through Comet Opik's REST API. The integration is **server-side only** (no client SDK) — all Opik calls happen in the Next.js API route (`/api/chat`), never exposed to the browser.

### Data Flow Per Chat Request

```
User sends message
       │
       ▼
┌─────────────────────────────────────────────────┐
│  POST /api/chat                                 │
│                                                 │
│  1. createTrace() ──► Opik /traces/batch        │
│     - trace_id (UUIDv7)                         │
│     - input: messages[], user context stats     │
│     - metadata: model, prompt version           │
│                                                 │
│  2. Stream Gemini response to client (SSE)      │
│     - tokens streamed progressively             │
│                                                 │
│  3. After stream completes:                     │
│     a. createSpan("gemini-flash-completion")    │
│        ──► Opik /spans/batch                    │
│        - type: llm                              │
│        - input: messages + system prompt         │
│        - output: full response                  │
│        - usage: prompt/completion/total tokens  │
│        - duration (start_time → end_time)       │
│                                                 │
│     b. endTrace() ──► PATCH /traces/batch       │
│        - output: full response                  │
│        - usage metadata                         │
│                                                 │
│     c. 3x addFeedbackScore() (heuristic)        │
│        ──► PUT /traces/{id}/feedback-scores     │
│        - response_length (0-1)                  │
│        - actionability (0 or 1)                 │
│        - topic_relevance (0 or 1)               │
│                                                 │
│     d. runLlmJudge() ──► Gemini 2.0 Flash Lite │
│        - Evaluates response quality             │
│        - createSpan("llm-as-judge-eval")        │
│        - 3x addFeedbackScore() (judge scores)   │
│        - judge_helpfulness (0-1)                │
│        - judge_specificity (0-1)                │
│        - judge_safety (0-1)                     │
└─────────────────────────────────────────────────┘
```

### What Gets Logged Per Trace

| Field | Source | Example |
|-------|--------|---------|
| `trace.input` | User messages + context (tasks, commitments, streak, etc.) | `{messages: [...], context: {activeTasks: 3, streak: 5}}` |
| `trace.output` | Full AI response text | `"Here are 3 tips..."` |
| `trace.metadata` | Model name, prompt version | `{model: "gemini-2.5-flash-lite", system_prompt_version: "v1-default"}` |
| `trace.usage` | Token counts from Gemini | `{prompt_tokens: 130, completion_tokens: 104}` |
| `trace.duration` | Wall-clock time start→end | `2436ms` |
| `span[0]` (main) | LLM call details: system prompt, messages, response, tokens | type=llm |
| `span[1]` (judge) | LLM-as-judge: user query, AI response, evaluation scores | type=llm |
| `feedback_scores` | 6 scores: 3 heuristic + 3 LLM-as-judge | See below |

### Feedback Scores (6 per trace)

**Heuristic (rule-based, instant):**
- `response_length`: `min(word_count / 200, 1)` — penalizes too-short responses
- `actionability`: `1.0` if response contains bullet points or numbered lists, `0.5` otherwise
- `topic_relevance`: `1.0` if response mentions focus/goal/commit keywords, `0.7` otherwise

**LLM-as-Judge (model-based, via separate Gemini call):**
- `judge_helpfulness`: Does the response actually help the user? (0-1)
- `judge_specificity`: Does it give concrete, actionable advice? (0-1)
- `judge_safety`: Is it safe and appropriate? (0-1)

---

## Files

| File | Role |
|------|------|
| `app/lib/opik.ts` | Core Opik client: `createTrace`, `endTrace`, `createSpan`, `addFeedbackScore`, `uuidv7` |
| `app/api/chat/route.ts` | Chat API route with full Opik instrumentation + LLM-as-judge |
| `app/api/opik-test/route.ts` | Health-check endpoint to verify Opik connectivity |

---

## Answering the Hackathon Questions

### 1. How does the Opik logging architecture capture each step of agent reasoning?

Every chat request creates a **trace** (the top-level unit) with **nested spans** for each processing step:

- **Span 1: `gemini-flash-completion`** — captures the main LLM call including the full system prompt (with dynamic user context), all conversation messages, the complete response, token usage, and latency.
- **Span 2: `llm-as-judge-eval`** — captures the evaluation call: the user query and AI response as input, the judge's scores as output, and the eval model metadata.

The trace itself records the overall input (all messages + user context stats like active tasks, streak, commitments) and the final output. This gives a complete picture of: what the user asked → what context the agent had → what it responded → how good the response was.

### 2. What performance metrics are most relevant?

We track metrics at multiple levels:

- **Response quality**: `judge_helpfulness`, `judge_specificity`, `judge_safety` (LLM-as-judge, 0-1 scale)
- **Response characteristics**: `response_length`, `actionability`, `topic_relevance` (heuristic, instant)
- **Operational**: token usage (cost proxy), latency (duration_ms), model version
- **User-level** (in-app): streak length, focus session completion rate, commitment adherence

The most relevant for the app's goal are **helpfulness** and **specificity** — a productivity advisor that gives generic advice is useless.

### 3. How do you define "agent success" quantitatively?

Agent success = the AI response leads to measurable user action. We define it through:

- **Immediate proxy**: `judge_helpfulness >= 0.7` AND `judge_specificity >= 0.7` AND `actionability == 1.0`
- **Behavioral proxy** (tracked in-app): Did the user start a focus session within 30 minutes of a chat? Did they create a commitment after the AI suggested one?
- **Long-term**: Streak growth rate, commitment completion rate, daily active usage

The Opik dashboard lets us filter traces by these scores to find patterns in what makes responses effective.

### 4. Is there LLM-as-judge evaluation?

Yes. Every single chat response is evaluated by a separate LLM call (`gemini-2.0-flash-lite`) that scores:

- **Helpfulness** (0-1): Does it actually address the user's request?
- **Specificity** (0-1): Concrete advice vs. generic platitudes?
- **Safety** (0-1): Appropriate and harm-free?

The judge also provides a `reason` field explaining its scores. All scores are logged as Opik feedback scores on the trace, and the judge call itself is logged as a separate span with full input/output for auditability.

We use `gemini-2.0-flash-lite` for judging (not the thinking model) to avoid the thinking-token budget issue and keep evaluation fast and cheap.

### 5. How do you compare prompt/model versions through controlled experiments?

The system supports prompt optimization through the `optimizer/` directory:

- `loadSystemPrompt()` checks for optimized prompts from the Opik Agent Optimizer SDK
- Every trace logs `metadata.system_prompt_version` (e.g., `"v1-default"`, `"optimized-hrpo"`, `"optimized-meta"`)
- In the Opik dashboard, you can **filter traces by metadata** to compare average `judge_helpfulness`, `judge_specificity`, and `response_length` across prompt versions
- A/B testing: deploy a new prompt, compare the feedback score distributions against the baseline

### 6. Is there a regression test dataset?

The `/api/opik-test` endpoint serves as a smoke test for Opik connectivity. For regression testing:

- The LLM-as-judge runs on **every production interaction**, not just test data — this is continuous evaluation
- Historical traces in Opik serve as the regression dataset: if average `judge_helpfulness` drops after a prompt change, we can detect it immediately
- The judge scores are comparable across time because the evaluation prompt and model are fixed

### 7. How do you measure tool selection accuracy?

Currently the agent is a single-turn advisor (no tool calls). However, the architecture supports it:

- Each tool call would be logged as a separate span with `type: "tool"`
- The span captures input (what the agent decided to call) and output (what the tool returned)
- Accuracy = did the agent pick the right tool for the user's intent? This can be evaluated by the LLM-as-judge with an extended prompt

### 8. Is there human-in-the-loop feedback?

The architecture supports it through Opik's feedback score API:

- Each trace has a `traceId` that's passed to the frontend
- A thumbs-up/down button on chat messages could call `PUT /traces/{traceId}/feedback-scores` with `source: "user"` instead of `"sdk"`
- This user feedback would appear alongside the automated scores in the Opik dashboard

Currently, the automated LLM-as-judge serves as a proxy for human evaluation at scale.

### 9. What trade-offs are monitored?

Key trade-offs visible in the Opik dashboard:

- **Personalization vs. hallucination**: We pass real user stats (tasks, streak, commitments) in the system prompt. The `judge_safety` score catches cases where personalization leads to inappropriate advice.
- **Conciseness vs. helpfulness**: `response_length` vs. `judge_helpfulness` — we can detect if shorter responses sacrifice quality.
- **Cost vs. quality**: Token usage per trace vs. judge scores — are we spending more tokens for marginally better responses?
- **Specificity vs. safety**: Highly specific advice might be wrong for the user's situation. The judge evaluates both dimensions independently.

### 10. How does the Opik dashboard provide actionable insights?

The dashboard enables:

- **Filter by score**: Find all traces where `judge_helpfulness < 0.5` to identify failure modes
- **Compare prompt versions**: Group by `metadata.system_prompt_version`, compare average scores
- **Cost analysis**: Sum `usage.total_tokens` across traces to estimate API costs
- **Latency monitoring**: Track `duration` to catch performance regressions
- **Judge disagreement**: Compare heuristic `actionability` vs. `judge_specificity` to calibrate automated metrics
- **Trend analysis**: Are scores improving over time as prompts are optimized?

---

## Verified End-to-End Proof

Tested on 2026-02-09. Trace `0000400f-d3da-79e4-aba4-d5c0c188db10`:

```
Trace: productivity-advisor-chat
  Spans: 2 (gemini-flash-completion + llm-as-judge-eval)
  LLM spans: 2
  Duration: 2436ms
  Usage: {prompt_tokens: 130, completion_tokens: 104, total_tokens: 234}

  Feedback scores:
    response_length:    0.32  (general)
    actionability:      1.0   (general)
    topic_relevance:    1.0   (general)
    judge_helpfulness:  1.0   (llm_judge)
    judge_specificity:  1.0   (llm_judge)
    judge_safety:       1.0   (llm_judge)
```

All data verified by querying the Opik REST API directly — not from app logs.

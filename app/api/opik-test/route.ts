import { createTrace, endTrace, createSpan, addFeedbackScore, isOpikEnabled, getOpikConfig, uuidv7 } from "../../lib/opik";

/**
 * GET /api/opik-test
 * Tests the Opik integration by creating a trace, span, and feedback score.
 * Returns the results so we can verify everything works.
 */
export async function GET() {
  const config = getOpikConfig();

  if (!isOpikEnabled()) {
    return Response.json({
      success: false,
      error: "Opik is not enabled. Set OPIK_API_KEY and OPIK_WORKSPACE in .env.local",
      config: { ...config, apiKey: config.enabled ? "set" : "missing" },
    });
  }

  const traceId = uuidv7();
  const spanId = uuidv7();
  const startTime = new Date().toISOString();

  const results: Record<string, unknown> = {
    traceId,
    spanId,
    config: { ...config, apiKey: "set" },
  };

  // 1. Create trace
  const traceResult = await createTrace({
    id: traceId,
    name: "opik-integration-test",
    input: { test: true, message: "Testing Opik integration from OKMindful" },
    startTime,
    metadata: { source: "api-test", timestamp: startTime },
  });
  results.createTrace = traceResult ? "OK" : "FAILED";

  // 2. Create span
  const endTime = new Date().toISOString();
  const spanResult = await createSpan({
    id: spanId,
    traceId,
    name: "test-llm-call",
    type: "llm",
    input: { prompt: "Test prompt for Opik integration" },
    output: { response: "Test response from OKMindful" },
    startTime,
    endTime,
    metadata: { model: "test", temperature: 0.7 },
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
  results.createSpan = spanResult ? "OK" : "FAILED";

  // 3. End trace
  const endResult = await endTrace({
    id: traceId,
    output: { response: "Test completed successfully" },
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  });
  results.endTrace = endResult ? "OK" : "FAILED";

  // 4. Add feedback scores
  const fb1 = await addFeedbackScore({
    traceId,
    name: "test_score",
    value: 0.95,
    reason: "Integration test score",
  });
  results.feedbackScore = fb1 ? "OK" : "FAILED";

  const allOk = results.createTrace === "OK" && results.createSpan === "OK" &&
    results.endTrace === "OK" && results.feedbackScore === "OK";

  return Response.json({
    success: allOk,
    message: allOk
      ? `Opik integration working! Trace ${traceId} created in project "${config.project}". Check your Opik dashboard.`
      : "Some Opik calls failed. Check server logs for details.",
    results,
  });
}

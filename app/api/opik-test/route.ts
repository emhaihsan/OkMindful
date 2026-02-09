import { getOpikClient, isOpikEnabled, getOpikConfig } from "../../lib/opik";

/**
 * GET /api/opik-test
 * Tests the Opik SDK integration by creating a trace, span, and feedback score.
 */
export async function GET() {
  const config = getOpikConfig();

  if (!isOpikEnabled()) {
    return Response.json({
      success: false,
      error: "Opik is not enabled. Set OPIK_API_KEY and OPIK_WORKSPACE in .env.local",
      config,
    });
  }

  const opik = getOpikClient();
  if (!opik) {
    return Response.json({ success: false, error: "Could not create Opik client", config });
  }

  try {
    // 1. Create trace via SDK
    const trace = opik.trace({
      name: "opik-integration-test",
      input: { test: true, message: "Testing Opik SDK integration from OKMindful" },
      metadata: { source: "api-test", timestamp: new Date().toISOString() },
    });

    // 2. Create a child span
    const span = trace.span({
      name: "test-llm-call",
      type: "llm",
      input: { prompt: "Test prompt for Opik integration" },
      metadata: { model: "test", temperature: 0.7 },
    });

    span.update({ output: { response: "Test response from OKMindful" } });
    span.end();

    // 3. End trace with output
    trace.update({ output: { response: "Test completed successfully" } });
    trace.end();

    // 4. Add feedback score
    trace.score({
      name: "test_score",
      value: 0.95,
      reason: "Integration test score",
    });

    // 5. Flush to ensure data is sent
    await opik.flush();

    return Response.json({
      success: true,
      message: `Opik SDK integration working! Trace ${trace.data.id} created in project "${config.project}". Check your Opik dashboard.`,
      results: {
        traceId: trace.data.id,
        config,
      },
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[opik-test] error:", errMsg);
    return Response.json({
      success: false,
      error: errMsg,
      config,
    });
  }
}

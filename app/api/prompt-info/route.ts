import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * GET /api/prompt-info
 * Returns info about which system prompt version is currently active.
 * Used by the UI to show whether the optimized prompt is loaded.
 */
export async function GET() {
  const optimizedPaths = [
    { path: join(process.cwd(), "..", "optimizer", "optimized_prompt_hrpo.txt"), version: "optimized-hrpo" },
    { path: join(process.cwd(), "..", "optimizer", "optimized_prompt.txt"), version: "optimized-meta" },
  ];

  for (const { path, version } of optimizedPaths) {
    try {
      if (existsSync(path)) {
        const content = readFileSync(path, "utf-8").trim();
        if (content.length > 50) {
          // Try to load optimization metadata
          const metaPath = path.replace(".txt", "").replace("optimized_prompt", "optimization_result") + ".json";
          let meta = null;
          try {
            if (existsSync(metaPath)) {
              meta = JSON.parse(readFileSync(metaPath, "utf-8"));
            }
          } catch {
            // ignore
          }

          return Response.json({
            version,
            promptLength: content.length,
            optimized: true,
            optimizer: version === "optimized-hrpo" ? "Hierarchical Reflective (HRPO)" : "MetaPrompt",
            meta,
          });
        }
      }
    } catch {
      // fall through
    }
  }

  return Response.json({
    version: "v1-default",
    promptLength: 0,
    optimized: false,
    optimizer: null,
    meta: null,
  });
}

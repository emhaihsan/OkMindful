import { Opik } from "opik";
import type { Trace, Span } from "opik";

const OPIK_API_KEY = process.env.OPIK_API_KEY || "";
const OPIK_WORKSPACE = process.env.OPIK_WORKSPACE || "";
const OPIK_PROJECT = process.env.OPIK_PROJECT || "okmindful";

let _client: Opik | null = null;

/**
 * Get or create the singleton Opik client.
 * Returns null if API key / workspace are not configured.
 */
export function getOpikClient(): Opik | null {
  if (!OPIK_API_KEY || !OPIK_WORKSPACE) return null;
  if (!_client) {
    _client = new Opik({
      apiKey: OPIK_API_KEY,
      workspaceName: OPIK_WORKSPACE,
      projectName: OPIK_PROJECT,
    });
  }
  return _client;
}

export function isOpikEnabled() {
  return !!(OPIK_API_KEY && OPIK_WORKSPACE);
}

export function getOpikConfig() {
  return {
    workspace: OPIK_WORKSPACE,
    project: OPIK_PROJECT,
    enabled: isOpikEnabled(),
    apiKey: OPIK_API_KEY ? "set" : "missing",
  };
}

export type { Trace, Span };

"use client";

import { useCallback, useEffect, useState } from "react";
import { streamChat, type ChatContext } from "../lib/stream-chat";
import { Markdown } from "./Markdown";

interface CoachAdviceProps {
  /** Which page this card is on — used as cache namespace */
  page: "dashboard" | "pomodoro" | "commitments";
  /** A string that, when changed, forces a new advice fetch (e.g. session count, commitment count) */
  triggerKey: string;
  /** User stats context to send to the AI */
  context: ChatContext;
  /** Short hint about what kind of advice to give */
  hint: string;
}

function cacheKey(page: string) {
  return `okmindful_coach_${page}`;
}

interface CachedAdvice {
  text: string;
  date: string;
  triggerKey: string;
}

function loadCached(page: string): CachedAdvice | null {
  try {
    const raw = localStorage.getItem(cacheKey(page));
    if (!raw) return null;
    return JSON.parse(raw) as CachedAdvice;
  } catch {
    return null;
  }
}

function saveCached(page: string, text: string, triggerKey: string) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    localStorage.setItem(cacheKey(page), JSON.stringify({ text, date: today, triggerKey }));
  } catch { /* ok */ }
}

export function CoachAdvice({ page, triggerKey, context, hint }: CoachAdviceProps) {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    setStreaming("");
    setAdvice("");

    const prompt = `You are a brief motivational coach. Give a short (2-3 sentences max) encouraging message and one practical tip. Context: ${hint}. Keep it warm, concise, and actionable. Always respond in the same language the user writes in. Do not use markdown headers. Do not repeat the user's stats back to them.`;

    try {
      const { content } = await streamChat(
        [{ role: "user", content: prompt }],
        (token) => setStreaming((prev) => prev + token),
        context,
      );
      const text = content || "Keep going! Every small step counts.";
      setAdvice(text);
      setStreaming("");
      saveCached(page, text, triggerKey);
    } catch {
      const fallback = "Stay focused and keep pushing forward! You're doing great.";
      setAdvice(fallback);
      setStreaming("");
      saveCached(page, fallback, triggerKey);
    } finally {
      setLoading(false);
    }
  }, [page, triggerKey, context, hint]);

  useEffect(() => {
    const cached = loadCached(page);
    // Use cache if same day AND same trigger key
    if (cached && cached.date === today && cached.triggerKey === triggerKey) {
      setAdvice(cached.text);
      return;
    }
    fetchAdvice();
  }, [page, triggerKey, today, fetchAdvice]);

  const displayText = advice || streaming;

  return (
    <div
      className="neo-surface"
      style={{
        padding: "16px 18px",
        background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(141,177,94,0.08))",
        border: "1.5px solid rgba(251,191,36,0.15)",
        borderRadius: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>AI Coach</span>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          style={{
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.6)",
            cursor: loading ? "wait" : "pointer",
            color: "var(--ink-soft)",
          }}
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>
        {displayText ? (
          <Markdown content={displayText} />
        ) : (
          <span style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>Getting advice...</span>
        )}
      </div>
    </div>
  );
}

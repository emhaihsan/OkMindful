import Link from "next/link";

const FEATURES = [
  {
    title: "Commitment Engine",
    desc: "Create commitments with optional financial stakes. Miss your target? The money goes to charity.",
    tint: "var(--yellow)",
  },
  {
    title: "Pomodoro Timer",
    desc: "Create tasks, set session targets, and run a disciplined focus timer. Every session is logged.",
    tint: "var(--teal)",
  },
  {
    title: "AI Advisor",
    desc: "Gemini Flash-powered productivity coach that plans, reviews, and adapts your strategy.",
    tint: "var(--pink)",
  },
  {
    title: "Opik Observability",
    desc: "Every AI interaction is traced — spans, token usage, and feedback scores for full transparency.",
    tint: "var(--blue)",
  },
];

const STEPS = [
  { num: "01", title: "Set a Resolution", desc: "Define what you want to achieve and pick a timeframe.", tint: "var(--yellow)" },
  { num: "02", title: "Choose Your Mode", desc: "Go honor-system or raise the stakes with real money.", tint: "var(--teal)" },
  { num: "03", title: "Focus & Check In", desc: "Use the Pomodoro timer daily and check in on your commitments.", tint: "var(--pink)" },
  { num: "04", title: "Win or Learn", desc: "Complete your challenge to reclaim your stake — or let it go to a good cause.", tint: "var(--lime)" },
];

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ─── Glass Header ─── */}
      <header style={{ padding: "14px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div
          className="container"
          style={{
            padding: "10px 18px",
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: "var(--yellow)",
                display: "grid", placeItems: "center",
                fontWeight: 800, fontSize: 13,
                border: "1.5px solid rgba(0,0,0,0.08)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              OK
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>OKMindful</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link
              href="/auth/login"
              style={{
                padding: "7px 14px", fontSize: 13, fontWeight: 500,
                borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.08)",
                background: "transparent", textDecoration: "none", color: "var(--ink)",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
            </Link>
            <Link className="neo-btn" style={{ padding: "7px 16px", fontSize: 13 }} href="/auth/register">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="container" style={{ flex: 1 }}>
        <section style={{ padding: "56px 0 24px" }}>
          <div className="grid cols-2" style={{ alignItems: "center", gap: 40 }}>
            <div className="animate-slide-up">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "rgba(45,212,191,0.12)", color: "var(--ink)",
                fontSize: 12, fontWeight: 600,
              }}>
                Resolution Engine &middot; 2026
              </div>
              <h1 className="h1" style={{ marginTop: 20 }}>
                Build real
                <br />
                <span style={{ background: "linear-gradient(135deg, var(--teal), var(--blue))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  accountability.
                </span>
              </h1>
              <p className="p" style={{ marginTop: 18, fontSize: 16, maxWidth: 440, lineHeight: 1.7 }}>
                Create commitments, stake real money, track progress with Pomodoro,
                and get AI-powered coaching — all with full LLM observability.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                <Link className="neo-btn" style={{ padding: "12px 24px", fontSize: 15 }} href="/auth/register">
                  Get Started Free
                </Link>
                <Link className="neo-btn secondary" style={{ padding: "12px 24px", fontSize: 15 }} href="/auth/login">
                  Sign In
                </Link>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.04)" }}>Gemini Flash</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.04)" }}>Opik Traced</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.04)" }}>Supabase</span>
              </div>
            </div>

            {/* Hero visual — glass commitment card */}
            <div className="neo-surface animate-fade-in" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div className="h3" style={{ fontSize: 17 }}>Sample Commitment</div>
                <span style={{
                  padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: "rgba(45,212,191,0.15)", color: "var(--ink)",
                }}>Active</span>
              </div>
              <div className="p" style={{ marginTop: 10, fontStyle: "italic" }}>&ldquo;2 Pomodoro sessions per day for 30 days&rdquo;</div>
              <div className="grid cols-3" style={{ marginTop: 16 }}>
                {[
                  { val: "30", label: "days", tint: "var(--yellow)" },
                  { val: "$50", label: "staked", tint: "var(--teal)" },
                  { val: "60", label: "sessions", tint: "var(--pink)" },
                ].map((s) => (
                  <div key={s.label} className="neo-surface-flat" style={{ padding: "12px 10px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: s.tint }} />
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{s.val}</div>
                    <div className="p" style={{ fontSize: 11, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: "68%" }} />
                </div>
                <div className="p" style={{ marginTop: 8, fontSize: 13 }}>20 of 30 days completed</div>
              </div>
              <div className="neo-surface-flat" style={{ padding: "10px 12px", marginTop: 14 }}>
                <div className="p" style={{ fontSize: 12 }}>
                  <b>Stake rule:</b> Miss 2 consecutive days → auto-donate. Complete → money back.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section style={{ padding: "40px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div className="h2">Everything you need to stay accountable</div>
            <p className="p" style={{ marginTop: 8, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              Four integrated tools that work together to keep you on track.
            </p>
          </div>
          <div className="grid cols-2" style={{ gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="neo-surface" style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: f.tint, borderRadius: "20px 0 0 20px" }} />
                <div className="h3">{f.title}</div>
                <div className="p" style={{ marginTop: 6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section style={{ padding: "24px 0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div className="h2">How it works</div>
          </div>
          <div className="grid cols-4" style={{ gap: 14 }}>
            {STEPS.map((s) => (
              <div key={s.num} className="neo-surface" style={{ padding: 18, textAlign: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: s.tint, display: "inline-grid", placeItems: "center",
                  fontWeight: 700, fontSize: 13,
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}>
                  {s.num}
                </div>
                <div className="h3" style={{ marginTop: 12 }}>{s.title}</div>
                <div className="p" style={{ marginTop: 6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Tech Stack ─── */}
        <section style={{ padding: "16px 0" }}>
          <div className="neo-surface" style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="h3" style={{ fontSize: 16 }}>Built with</div>
                <div className="p" style={{ marginTop: 4 }}>
                  Next.js &bull; React 19 &bull; TypeScript &bull; Supabase &bull; Gemini Flash &bull; Opik
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Liquid Glass UI", "LLM Observability", "Open Source"].map((t) => (
                  <span key={t} style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 10px", borderRadius: 999, background: "rgba(0,0,0,0.04)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section style={{ padding: "40px 0 56px", textAlign: "center" }}>
          <div className="h2">Ready to commit?</div>
          <p className="p" style={{ marginTop: 10, maxWidth: 380, marginLeft: "auto", marginRight: "auto", fontSize: 15 }}>
            Start building real accountability for your 2026 resolutions.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="neo-btn" style={{ padding: "13px 28px", fontSize: 15 }} href="/auth/register">
              Get Started Free
            </Link>
            <Link className="neo-btn secondary" style={{ padding: "13px 28px", fontSize: 15 }} href="/auth/login">
              Sign In
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ padding: "24px 0 32px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="p" style={{ fontSize: 12 }}>
            OKMindful &copy; 2026 &bull; Gemini Flash + Opik
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.03)" }}>Liquid Glass UI</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.03)" }}>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";

const FEATURES = [
  {
    title: "Commitment Engine",
    desc: "Create commitments with optional financial stakes. Miss your target? The money goes to charity. Hit it? You get it back.",
    tint: "var(--yellow)",
    icon: "🎯",
  },
  {
    title: "Pomodoro Timer",
    desc: "Create tasks, set session targets, and run a disciplined focus timer. Every session is logged and tracked.",
    tint: "var(--teal)",
    icon: "⏱",
  },
  {
    title: "AI Advisor",
    desc: "Gemini Flash-powered productivity coach that plans, reviews, and adapts your strategy in real time.",
    tint: "var(--pink)",
    icon: "🤖",
  },
  {
    title: "Opik Observability",
    desc: "Every AI interaction is traced with Opik — spans, token usage, and feedback scores for full transparency.",
    tint: "var(--blue)",
    icon: "📊",
  },
];

const STEPS = [
  { num: "01", title: "Set a Resolution", desc: "Define what you want to achieve and pick a timeframe.", tint: "var(--yellow)" },
  { num: "02", title: "Choose Your Mode", desc: "Go honor-system with Commit Only, or raise the stakes with Commit + Stake.", tint: "var(--teal)" },
  { num: "03", title: "Focus & Check In", desc: "Use the Pomodoro timer daily and check in on your commitments.", tint: "var(--pink)" },
  { num: "04", title: "Win or Learn", desc: "Complete your challenge to reclaim your stake — or let it go to a good cause.", tint: "var(--lime)" },
];

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ─── Minimal Landing Header ─── */}
      <header style={{ padding: "16px 0" }}>
        <div
          className="container neo-surface"
          style={{ padding: "10px 16px", background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="neo-surface" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--yellow)", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 14 }}>
              OK
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>OKMindful</div>
              <div className="p" style={{ fontSize: 11 }}>Commit &bull; Stake &bull; Win</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link className="neo-btn secondary" style={{ padding: "8px 14px", fontSize: 13 }} href="/auth/login">
              Sign In
            </Link>
            <Link className="neo-btn" style={{ padding: "8px 14px", fontSize: 13, background: "var(--yellow)" }} href="/auth/register">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="container" style={{ flex: 1 }}>
        <section style={{ padding: "40px 0 16px" }}>
          <div className="grid cols-2" style={{ alignItems: "center", gap: 32 }}>
            <div>
              <div className="neo-badge" style={{ background: "var(--teal)" }}>
                <span>Resolution Engine</span>
                <span className="kbd">2026</span>
              </div>
              <h1 className="h1" style={{ marginTop: 18 }}>
                Next-level
                <br />
                commitments.
              </h1>
              <p className="p" style={{ marginTop: 16, fontSize: 15, maxWidth: 460, lineHeight: 1.65 }}>
                Build real accountability for your 2026 resolutions. Create commitments,
                stake real money, track progress with Pomodoro, and get AI-powered coaching
                — all with full LLM observability via Opik.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <Link className="neo-btn" style={{ padding: "13px 24px" }} href="/auth/register">
                  Get Started Free
                </Link>
                <Link className="neo-btn secondary" style={{ padding: "13px 24px" }} href="/auth/login">
                  Sign In
                </Link>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                <span className="neo-badge" style={{ background: "var(--yellow)" }}>No Excuses</span>
                <span className="neo-badge" style={{ background: "var(--pink)" }}>Gemini Flash</span>
                <span className="neo-badge" style={{ background: "var(--blue)" }}>Opik Traced</span>
              </div>
            </div>

            {/* Hero visual — mock commitment card */}
            <div className="neo-surface" style={{ padding: 20, background: "var(--paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div className="h3" style={{ fontSize: 18 }}>Sample Commitment</div>
                <span className="neo-badge" style={{ background: "var(--teal)" }}>ACTIVE</span>
              </div>
              <div className="p" style={{ marginTop: 10 }}>&quot;2 Pomodoro sessions per day for 30 days&quot;</div>
              <div className="grid cols-3" style={{ marginTop: 14 }}>
                <div className="neo-surface-flat" style={{ padding: 10, background: "var(--yellow)", textAlign: "center" }}>
                  <div className="p" style={{ fontWeight: 900, color: "var(--ink)" }}>30</div>
                  <div className="p" style={{ fontSize: 11 }}>days</div>
                </div>
                <div className="neo-surface-flat" style={{ padding: 10, background: "var(--teal)", textAlign: "center" }}>
                  <div className="p" style={{ fontWeight: 900, color: "var(--ink)" }}>$50</div>
                  <div className="p" style={{ fontSize: 11 }}>staked</div>
                </div>
                <div className="neo-surface-flat" style={{ padding: 10, background: "var(--pink)", textAlign: "center" }}>
                  <div className="p" style={{ fontWeight: 900, color: "var(--ink)" }}>60</div>
                  <div className="p" style={{ fontSize: 11 }}>sessions</div>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: "68%" }} />
                </div>
                <div className="p" style={{ marginTop: 6 }}>20/30 days completed (68%)</div>
              </div>
              <div className="neo-surface-flat" style={{ padding: 10, marginTop: 12, background: "var(--bg)" }}>
                <div className="p" style={{ fontSize: 12 }}>
                  <b>Stake rule:</b> Miss 2 consecutive days → auto-donate. Complete → money back.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section style={{ padding: "32px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="h2">Everything you need to stay accountable</div>
            <p className="p" style={{ marginTop: 8, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>
              Four integrated tools that work together to keep you on track.
            </p>
          </div>
          <div className="grid cols-2" style={{ gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="neo-surface" style={{ padding: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div className="neo-surface-flat" style={{ width: 44, height: 44, borderRadius: 12, background: f.tint, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="h3">{f.title}</div>
                    <div className="p" style={{ marginTop: 6 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section style={{ padding: "24px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="h2">How it works</div>
          </div>
          <div className="grid cols-4" style={{ gap: 14 }}>
            {STEPS.map((s) => (
              <div key={s.num} className="neo-surface" style={{ padding: 16, textAlign: "center" }}>
                <div className="neo-surface-flat" style={{ width: 40, height: 40, borderRadius: 999, background: s.tint, display: "inline-grid", placeItems: "center", fontWeight: 900, fontSize: 14 }}>
                  {s.num}
                </div>
                <div className="h3" style={{ marginTop: 10 }}>{s.title}</div>
                <div className="p" style={{ marginTop: 6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Tech Stack ─── */}
        <section style={{ padding: "24px 0" }}>
          <div className="neo-surface" style={{ padding: 20, background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div className="h3" style={{ fontSize: 18 }}>Built with</div>
                <div className="p" style={{ marginTop: 6 }}>
                  Next.js &bull; React &bull; TypeScript &bull; Google Gemini Flash &bull; Opik by Comet
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="neo-badge" style={{ background: "var(--yellow)" }}>Neo-Brutalism UI</span>
                <span className="neo-badge" style={{ background: "var(--teal)" }}>LLM Observability</span>
                <span className="neo-badge" style={{ background: "var(--pink)" }}>Open Source</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section style={{ padding: "24px 0 48px", textAlign: "center" }}>
          <div className="h2">Ready to commit?</div>
          <p className="p" style={{ marginTop: 8, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            Start building real accountability for your 2026 resolutions today.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="neo-btn" style={{ padding: "14px 28px", fontSize: 15 }} href="/auth/register">
              Get Started Free
            </Link>
            <Link className="neo-btn" style={{ padding: "14px 28px", fontSize: 15, background: "var(--teal)" }} href="/auth/login">
              Sign In
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ padding: "20px 0 32px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="p" style={{ fontSize: 12 }}>
            OKMindful &copy; 2026 &bull; Powered by Gemini Flash + Opik
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="neo-badge" style={{ background: "var(--paper)", fontSize: 11 }}>Neo-Brutalism</span>
            <span className="neo-badge" style={{ background: "var(--paper)", fontSize: 11 }}>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

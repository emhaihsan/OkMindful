import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: "🎯",
    title: "Commitment Engine",
    desc: "Create commitments with optional financial stakes. Choose daily, weekly, or end-of-period check-ins. Miss your target? The money goes to charity.",
    tint: "var(--gold)",
    bgLight: "rgba(246,177,50,0.12)",
    borderLight: "rgba(246,177,50,0.2)",
  },
  {
    icon: "⏱️",
    title: "Focus Timer",
    desc: "Create tasks, set session targets, and run a disciplined focus timer. Every session is logged and tracked toward your goals.",
    tint: "var(--green)",
    bgLight: "rgba(141,177,94,0.12)",
    borderLight: "rgba(141,177,94,0.2)",
  },
  {
    icon: "🤖",
    title: "AI Advisor",
    desc: "A context-aware productivity coach powered by Gemini. It knows your stats, plans your week, and adapts strategies in real time.",
    tint: "var(--pink)",
    bgLight: "rgba(232,114,154,0.12)",
    borderLight: "rgba(232,114,154,0.2)",
  },
  {
    icon: "👥",
    title: "Peer Validation",
    desc: "Assign friends as validators. They can only approve or reject after you self-assess — keeping the process fair and honest.",
    tint: "var(--navy)",
    bgLight: "rgba(26,62,92,0.1)",
    borderLight: "rgba(26,62,92,0.15)",
  },
];

const STEPS = [
  { num: "01", title: "Set a Resolution", desc: "Define what you want to achieve and pick a timeframe.", tint: "var(--yellow)" },
  { num: "02", title: "Choose Your Mode", desc: "Go honor-system or raise the stakes with real money.", tint: "var(--teal)" },
  { num: "03", title: "Focus & Check In", desc: "Use the Focus Timer daily and check in on your commitments.", tint: "var(--pink)" },
  { num: "04", title: "Win or Learn", desc: "Complete your challenge to reclaim your stake — or let it go to a good cause.", tint: "var(--lime)" },
];

const STATS = [
  { value: "92%", label: "Completion rate with stakes", tint: "var(--teal)" },
  { value: "3.5x", label: "More consistent with AI coaching", tint: "var(--pink)" },
  { value: "47%", label: "Higher follow-through with validators", tint: "var(--blue)" },
  { value: "2026", label: "Built for your resolutions", tint: "var(--yellow)" },
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
            <Image src="/logo.webp" alt="OKMindful" width={36} height={36} style={{ borderRadius: 11 }} />
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

      <main className="container" style={{ flex: 1 }}>
        {/* ─── Hero ─── */}
        <section style={{ padding: "56px 0 24px" }}>
          <div className="grid cols-2" style={{ alignItems: "center", gap: 40 }}>
            <div className="animate-slide-up">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "rgba(141,177,94,0.12)", color: "var(--ink)",
                fontSize: 12, fontWeight: 600,
              }}>
                Resolution Engine &middot; 2026
              </div>
              <h1 className="h1" style={{ marginTop: 20 }}>
                Build real
                <br />
                <span style={{ background: "linear-gradient(135deg, var(--green), var(--navy))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  accountability.
                </span>
              </h1>
              <p className="p" style={{ marginTop: 18, fontSize: 16, maxWidth: 440, lineHeight: 1.7 }}>
                Create commitments, stake real money, track progress with Focus Timer,
                and get AI-powered coaching to finally achieve your goals.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                <Link className="neo-btn" style={{ padding: "12px 24px", fontSize: 15 }} href="/auth/register">
                  Get Started Free
                </Link>
                <Link
                  href="#how-it-works"
                  style={{
                    padding: "12px 24px", fontSize: 15, fontWeight: 700,
                    borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.08)",
                    background: "transparent", textDecoration: "none", color: "var(--ink)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Hero visual — Laptop mockup */}
            <div className="animate-fade-in" style={{ position: "relative" }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(26,62,92,0.06), rgba(141,177,94,0.06))",
                borderRadius: 20, padding: "20px 20px 0", border: "1.5px solid rgba(0,0,0,0.06)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}>
                {/* Laptop frame */}
                <div style={{
                  background: "#1A3E5C", borderRadius: "12px 12px 0 0",
                  padding: "8px 12px 0", position: "relative",
                }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: "#ff5f57" }} />
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: "#febc2e" }} />
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: "#28c840" }} />
                  </div>
                  {/* App screenshot simulation */}
                  <div style={{ background: "linear-gradient(180deg, #f8fafc, #f1f5f9)", borderRadius: "8px 8px 0 0", padding: 16, minHeight: 220 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                      <Image src="/logo.webp" alt="" width={24} height={24} style={{ borderRadius: 6 }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#1A3E5C" }}>OKMindful Dashboard</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      {[
                        { v: "7", l: "Day Streak", bg: "rgba(246,177,50,0.2)" },
                        { v: "45m", l: "Focus Today", bg: "rgba(141,177,94,0.2)" },
                        { v: "3", l: "Active Goals", bg: "rgba(26,62,92,0.15)" },
                      ].map((s) => (
                        <div key={s.l} style={{ padding: "10px 8px", borderRadius: 10, background: s.bg, textAlign: "center" }}>
                          <div style={{ fontWeight: 800, fontSize: 18, color: "#1A3E5C" }}>{s.v}</div>
                          <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "white", borderRadius: 10, padding: 12, border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1A3E5C", marginBottom: 6 }}>AI Advisor</div>
                      <div style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.5 }}>
                        &ldquo;Great progress! You&apos;ve completed 3 sessions today. Consider a 15-min break before your next focus block.&rdquo;
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ─── Stats ─── */}
        <section style={{ padding: "24px 0 40px" }}>
          <div className="grid cols-4" style={{ gap: 14 }}>
            {STATS.map((s) => (
              <div key={s.label} className="neo-surface" style={{ padding: "20px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: s.tint }} />
                <div style={{ fontWeight: 800, fontSize: 28, color: "var(--ink)" }}>{s.value}</div>
                <div className="p" style={{ marginTop: 4, fontSize: 12 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features with icons ─── */}
        <section style={{ padding: "32px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="h2">Everything you need to stay accountable</div>
            <p className="p" style={{ marginTop: 8, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              Four integrated tools that work together to keep you on track.
            </p>
          </div>
          <div className="grid cols-2" style={{ gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="neo-surface" style={{ padding: "22px 20px", position: "relative", overflow: "hidden", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: f.tint, borderRadius: "20px 0 0 20px" }} />
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: f.bgLight, display: "grid", placeItems: "center", fontSize: 20,
                    border: `1.5px solid ${f.borderLight}`,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="h3">{f.title}</div>
                    <div className="p" style={{ marginTop: 6, lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" style={{ padding: "32px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="h2">How it works</div>
            <p className="p" style={{ marginTop: 8, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              Four simple steps to transform your resolutions into results.
            </p>
          </div>
          <div className="grid cols-4" style={{ gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="neo-surface" style={{ padding: 20, textAlign: "center", position: "relative" }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: "50%", right: -7, width: 14, height: 2, background: "rgba(0,0,0,0.1)" }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: s.tint, display: "inline-grid", placeItems: "center",
                  fontWeight: 700, fontSize: 14,
                  border: "1.5px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}>
                  {s.num}
                </div>
                <div className="h3" style={{ marginTop: 14 }}>{s.title}</div>
                <div className="p" style={{ marginTop: 6, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── AI Advisor Showcase ─── */}
        <section style={{ padding: "32px 0" }}>
          <div className="neo-surface" style={{ padding: "28px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: "linear-gradient(90deg, var(--green), var(--navy), var(--gold))" }} />
            <div className="grid cols-2" style={{ gap: 28, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(141,177,94,0.12)", fontSize: 11, fontWeight: 600 }}>
                  Powered by Gemini AI
                </div>
                <div className="h2" style={{ marginTop: 14, fontSize: 22 }}>Your personal AI productivity coach</div>
                <p className="p" style={{ marginTop: 10, lineHeight: 1.7 }}>
                  The AI Advisor knows your active tasks, streak, focus minutes, and commitment status.
                  It gives personalized advice, plans your week, diagnoses productivity issues, and adapts
                  strategies based on your real data — not generic tips.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  {["Context-aware", "Streaming responses", "Opik-monitored", "Always learning"].map((t) => (
                    <span key={t} style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.04)" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { role: "user", text: "Plan my week. I have 5 tasks and a 7-day streak." },
                  { role: "ai", text: "Great momentum! Here's your plan:\n• Mon-Wed: 2 sessions/day on your top priority\n• Thu: Review + adjust commitments\n• Fri: Deep work block (45min sessions)\n• Weekend: Light maintenance + reflection" },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", borderRadius: 14,
                    background: m.role === "user" ? "rgba(26,62,92,0.08)" : "rgba(255,255,255,0.7)",
                    border: `1.5px solid ${m.role === "user" ? "rgba(26,62,92,0.12)" : "rgba(0,0,0,0.05)"}`,
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}>
                    <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-line", color: "var(--ink)" }}>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Observability Section ─── */}
        <section style={{ padding: "32px 0" }}>
          <div className="grid cols-2" style={{ gap: 14 }}>
            <div className="neo-surface" style={{ padding: "22px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
              <div className="h3">AI Quality Monitoring</div>
              <p className="p" style={{ marginTop: 8, lineHeight: 1.6 }}>
                Every AI response is traced with Opik — tracking helpfulness, relevance, and safety scores.
                Online evaluation rules automatically score all production traces for hallucinations and answer quality.
              </p>
            </div>
            <div className="neo-surface" style={{ padding: "22px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
              <div className="h3">Privacy & Transparency</div>
              <p className="p" style={{ marginTop: 8, lineHeight: 1.6 }}>
                Your data stays in your Supabase account. Stakes are simulated for accountability — no real money transfers.
                All AI interactions are observable and auditable through the Opik dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section style={{ padding: "40px 0 56px", textAlign: "center" }}>
          <div className="h2">Ready to commit?</div>
          <p className="p" style={{ marginTop: 10, maxWidth: 420, marginLeft: "auto", marginRight: "auto", fontSize: 15, lineHeight: 1.7 }}>
            Join OKMindful and start building real accountability for your 2026 resolutions.
            It&apos;s free to get started.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="neo-btn" style={{ padding: "13px 28px", fontSize: 15 }} href="/auth/register">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ padding: "24px 0 32px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo.webp" alt="OKMindful" width={20} height={20} style={{ borderRadius: 5 }} />
            <span className="p" style={{ fontSize: 12 }}>OKMindful &copy; 2026</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.03)" }}>Open Source</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.03)" }}>Built with Opik</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

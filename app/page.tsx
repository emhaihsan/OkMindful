"use client";

import { useState } from "react";
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
  {
    num: "01", title: "Set a Resolution", tint: "var(--gold)",
    desc: "Define what you want to achieve, set a timeframe, and optionally stake real money for extra accountability.",
    mockup: [
      { label: "Commitment", value: "Exercise 30min daily", color: "#1A3E5C" },
      { label: "Duration", value: "30 days", color: "#8DB15E" },
      { label: "Mode", value: "Stake $50", color: "#F6B132" },
    ],
    mockupDetail: "Choose honor-system or raise the stakes with real money. If you fail, the funds go to charity.",
  },
  {
    num: "02", title: "Track with Focus Timer", tint: "var(--green)",
    desc: "Use the built-in Pomodoro timer to stay focused. Every session is logged and counted toward your goals.",
    mockup: [
      { label: "Focus", value: "25:00", color: "#E8729A" },
      { label: "Sessions", value: "4/6", color: "#8DB15E" },
      { label: "Today", value: "100min", color: "#1A3E5C" },
    ],
    mockupDetail: "Set tasks, define session targets, and track your progress with a clean, distraction-free timer.",
  },
  {
    num: "03", title: "Check In & Self-Assess", tint: "var(--pink)",
    desc: "Check in daily, weekly, or at the end of your commitment. Self-assess before validators can review.",
    mockup: [
      { label: "Streak", value: "7 days", color: "#F6B132" },
      { label: "Progress", value: "68%", color: "#8DB15E" },
      { label: "Status", value: "On Track", color: "#1A3E5C" },
    ],
    mockupDetail: "Your validators can only approve or reject after you self-assess — keeping the process fair and honest.",
  },
  {
    num: "04", title: "Win or Learn", tint: "var(--navy)",
    desc: "Complete your challenge to reclaim your stake. Miss it? The money goes to a good cause. Either way, you grow.",
    mockup: [
      { label: "Result", value: "Completed!", color: "#8DB15E" },
      { label: "Returned", value: "$50.00", color: "#F6B132" },
      { label: "Sessions", value: "42 total", color: "#1A3E5C" },
    ],
    mockupDetail: "Get a full summary of your journey. Celebrate wins, learn from misses, and start your next challenge.",
  },
];

const STATS = [
  { value: "92%", label: "Completion rate with stakes", tint: "var(--teal)" },
  { value: "3.5x", label: "More consistent with AI coaching", tint: "var(--pink)" },
  { value: "47%", label: "Higher follow-through with validators", tint: "var(--blue)" },
];


function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  return (
    <section id="how-it-works" style={{ padding: "32px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="h2">How it works</div>
        <p className="p" style={{ marginTop: 8, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          Four simple steps to transform your resolutions into results.
        </p>
      </div>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
        {STEPS.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(i)}
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              border: activeStep === i ? "1.5px solid rgba(0,0,0,0.1)" : "1.5px solid rgba(0,0,0,0.06)",
              background: activeStep === i ? s.tint : "rgba(255,255,255,0.6)",
              color: activeStep === i ? "#fff" : "var(--ink)",
              fontWeight: activeStep === i ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: activeStep === i ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {s.num}. {s.title}
          </button>
        ))}
      </div>

      {/* Content: description + laptop mockup */}
      <div className="neo-surface" style={{ padding: "28px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: step.tint }} />
        <div className="grid cols-2" style={{ gap: 32, alignItems: "center" }}>
          {/* Left: description */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: 999,
              background: step.tint, fontWeight: 800, fontSize: 16, color: "#fff",
              border: "1.5px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
              {step.num}
            </div>
            <div className="h2" style={{ marginTop: 16, fontSize: 22 }}>{step.title}</div>
            <p className="p" style={{ marginTop: 10, lineHeight: 1.7, fontSize: 15 }}>{step.desc}</p>
            <p className="p" style={{ marginTop: 12, lineHeight: 1.6, fontSize: 13, fontStyle: "italic", color: "var(--ink-soft)" }}>
              {step.mockupDetail}
            </p>
          </div>

          {/* Right: laptop mockup */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(26,62,92,0.05), rgba(141,177,94,0.05))",
              borderRadius: 16, padding: "16px 16px 0", border: "1.5px solid rgba(0,0,0,0.06)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}>
              {/* Laptop chrome */}
              <div style={{
                background: "#1A3E5C", borderRadius: "10px 10px 0 0",
                padding: "6px 10px 0", position: "relative",
              }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 999, background: "#ff5f57" }} />
                  <div style={{ width: 7, height: 7, borderRadius: 999, background: "#febc2e" }} />
                  <div style={{ width: 7, height: 7, borderRadius: 999, background: "#28c840" }} />
                </div>
                {/* Screen content */}
                <div style={{ background: "#f8fafc", borderRadius: "6px 6px 0 0", padding: 14, minHeight: 180 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                    <Image src="/logo.webp" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
                    <span style={{ fontWeight: 700, fontSize: 11, color: "#1A3E5C" }}>OKMindful</span>
                    <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: "auto" }}>Step {step.num}</span>
                  </div>
                  {/* Mockup stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {step.mockup.map((m) => (
                      <div key={m.label} style={{
                        padding: "8px 6px", borderRadius: 8,
                        background: `${m.color}18`, textAlign: "center",
                        border: `1px solid ${m.color}22`,
                      }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: "#e5e7eb", borderRadius: 999, height: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      background: `linear-gradient(90deg, #8DB15E, #1A3E5C)`,
                      width: `${25 + activeStep * 25}%`,
                      transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 4, textAlign: "right" }}>
                    {25 + activeStep * 25}% complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
          <div className="grid cols-3" style={{ gap: 14 }}>
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

        {/* ─── How It Works (Tabs + Laptop Mockup) ─── */}
        <HowItWorks />

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

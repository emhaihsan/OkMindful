"use client";

import Link from "next/link";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";

const SECTIONS = [
  {
    title: "Getting Started",
    accent: "var(--yellow)",
    items: [
      { q: "What is OKMindful?", a: "OKMindful is an accountability platform that helps you stick to your 2026 goals. Create commitments, stake money, track focus sessions, and get AI-powered coaching." },
      { q: "How do I create a commitment?", a: "Go to the Commitments page, click '+ New Commitment', fill in the title, choose your mode (commit only or commit + stake), set a duration, and optionally assign validators." },
      { q: "What's the difference between Commit and Stake?", a: "Commit Only is honor-system — you track progress but there's no financial consequence. Commit + Stake lets you put money on the line. If you fail, the stake goes to your chosen destination (charity, friend, etc.)." },
    ],
  },
  {
    title: "Validators & Accountability",
    accent: "var(--teal)",
    items: [
      { q: "What are validators?", a: "Validators are friends or peers you assign to your commitment. They review your progress and decide whether to approve or reject your commitment when it's complete." },
      { q: "How do I assign a validator?", a: "When creating a commitment, enter their username or email address in the Validators field. Separate multiple validators with commas." },
      { q: "How does validation work?", a: "When your commitment reaches its deadline, validators can approve (you completed it) or reject (you didn't). If any validator rejects a staked commitment, it's marked as failed." },
    ],
  },
  {
    title: "Balance & Stakes",
    accent: "var(--pink)",
    items: [
      { q: "How does the balance system work?", a: "Every new account starts with a $1,000 demo balance. This is simulated currency — no real money is involved. You can top up anytime from your profile." },
      { q: "What happens if I fail a staked commitment?", a: "The staked amount is recorded as going to your chosen fund destination (charity, organization, or person). In this demo version, no actual transfer occurs." },
      { q: "Can I choose where failed stakes go?", a: "Yes! When creating a staked commitment, you can specify where the money should go if you fail — e.g., a charity like Red Cross, or a friend." },
    ],
  },
  {
    title: "AI Advisor",
    accent: "var(--blue)",
    items: [
      { q: "What can the AI Advisor do?", a: "The AI Advisor is a productivity coach that can help you plan your week, review your progress, diagnose productivity issues, set stake strategies, and motivate you." },
      { q: "Does the AI see my data?", a: "Yes, the AI Advisor has context about your active commitments, tasks, focus sessions, and streak. This lets it give personalized, relevant advice." },
      { q: "Is my conversation private?", a: "Your chat messages are stored in your account and are only visible to you. They are not shared with other users." },
    ],
  },
  {
    title: "Focus Timer",
    accent: "var(--lime)",
    items: [
      { q: "How does the Focus Timer work?", a: "Create a task, set a target number of sessions, then start the timer. Choose any duration that works for you — from 1 minute to 45 minutes. Completed sessions are logged automatically." },
      { q: "Does the timer count toward my streak?", a: "Yes! Completing at least one focus session or checking in on a commitment counts toward your daily streak." },
    ],
  },
  {
    title: "Technical Details",
    accent: "var(--orange)",
    items: [
      { q: "What technologies power OKMindful?", a: "The app is built with Next.js, React, and TypeScript. It uses Supabase for authentication and database, Google Gemini for AI, and Comet Opik for LLM observability and evaluation." },
      { q: "What is LLM observability?", a: "Every AI interaction is automatically traced behind the scenes — including input/output, token usage, response time, and quality scores. This helps ensure the AI gives high-quality advice." },
      { q: "Is OKMindful open source?", a: "Yes! The full source code is available. Check the project repository for details." },
    ],
  },
];

export default function HelpPage() {
  return (
    <AppShell active="home">
      <div className="section-pad">
        <div className="animate-slide-up">
          <h1 className="h2">Help & FAQ</h1>
          <p className="p" style={{ marginTop: 6 }}>
            Everything you need to know about using OKMindful.
          </p>
        </div>

        <div className="grid" style={{ gap: 16, marginTop: 20 }}>
          {SECTIONS.map((section) => (
            <Card key={section.title} title={section.title} accent={section.accent}>
              <div className="grid" style={{ gap: 10 }}>
                {section.items.map((item) => (
                  <div key={item.q} className="neo-surface-flat" style={{ padding: "12px 14px" }}>
                    <div className="h3" style={{ fontSize: 14 }}>{item.q}</div>
                    <div className="p" style={{ marginTop: 6, lineHeight: 1.6 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p className="p">
            Still have questions? <Link href="/chat" style={{ fontWeight: 700, color: "var(--ink)" }}>Ask the AI Advisor →</Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}

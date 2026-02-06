"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { AuthGuard } from "./AuthGuard";

type Active = "home" | "dashboard" | "commitments" | "profile" | "chat" | "pomodoro";

const NAV: { href: string; label: string; key: Active; tint: string }[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", tint: "var(--teal)" },
  { href: "/commitments", label: "Commitments", key: "commitments", tint: "var(--orange)" },
  { href: "/pomodoro", label: "Pomodoro", key: "pomodoro", tint: "var(--lime)" },
  { href: "/chat", label: "Advisor", key: "chat", tint: "var(--pink)" },
  { href: "/profile", label: "Profile", key: "profile", tint: "var(--blue)" },
];

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: Active;
}) {
  const { profile, signOut } = useAuth();

  return (
    <AuthGuard>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ padding: "16px 0" }}>
          <div
            className="container neo-surface"
            style={{
              padding: "10px 16px",
              background: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="neo-surface"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "var(--yellow)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                OK
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>OKMindful</div>
                <div className="p" style={{ fontSize: 11 }}>Commit &bull; Stake &bull; Win</div>
              </div>
            </Link>

            <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {NAV.map((n) => (
                <Link
                  key={n.key}
                  href={n.href}
                  className="neo-btn"
                  style={{
                    padding: "8px 12px",
                    fontSize: 13,
                    background: active === n.key ? n.tint : "var(--paper)",
                  }}
                >
                  {n.label}
                </Link>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 4 }}>
                <span className="neo-badge" style={{ background: "var(--yellow)", fontSize: 11 }}>
                  {profile?.username ?? "..."}
                </span>
                <button className="neo-btn secondary" style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => signOut()}>
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </header>

        <main className="container" style={{ flex: 1 }}>{children}</main>

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
    </AuthGuard>
  );
}

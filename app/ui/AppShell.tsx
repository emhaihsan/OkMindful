"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { AuthGuard } from "./AuthGuard";
import { ChatBubble } from "./ChatBubble";

type Active = "home" | "dashboard" | "commitments" | "profile" | "chat" | "pomodoro" | "help";

const NAV: { href: string; label: string; key: Active; tint: string }[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", tint: "var(--teal)" },
  { href: "/commitments", label: "Commitments", key: "commitments", tint: "var(--orange)" },
  { href: "/pomodoro", label: "Focus Timer", key: "pomodoro", tint: "var(--lime)" },
  { href: "/chat", label: "Advisor", key: "chat", tint: "var(--pink)" },
  { href: "/profile", label: "Profile", key: "profile", tint: "var(--blue)" },
  { href: "/help", label: "Help", key: "help", tint: "var(--orange)" },
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
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: "var(--yellow)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  border: "1.5px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                OK
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>OKMindful</div>
              </div>
            </Link>

            <nav style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              {NAV.map((n) => {
                const isActive = active === n.key;
                return (
                  <Link
                    key={n.key}
                    href={n.href}
                    style={{
                      padding: "7px 13px",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: 10,
                      background: isActive ? n.tint : "transparent",
                      color: "var(--ink)",
                      border: isActive ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
                      boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      textDecoration: "none",
                    }}
                  >
                    {n.label}
                  </Link>
                );
              })}

              <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)", margin: "0 6px" }} />

              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "rgba(0,0,0,0.04)",
                  color: "var(--ink-soft)",
                }}>
                  {profile?.username ?? "..."}
                </span>
                <button
                  onClick={() => signOut()}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 8,
                    border: "1.5px solid rgba(0,0,0,0.08)",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--ink-soft)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </header>

        <main className="container" style={{ flex: 1 }}>{children}</main>
        {active !== "chat" && <ChatBubble />}

        <footer style={{ padding: "24px 0 32px" }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="p" style={{ fontSize: 12 }}>
              OKMindful &copy; 2026
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.03)" }}>Open Source</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}

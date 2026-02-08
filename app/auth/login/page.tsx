"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function LoginPage() {
  const { signIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    const err = await signIn(email.trim(), password);
    if (err) {
      setLoading(false);
      setError(err);
    } else {
      window.location.href = "/dashboard";
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="p" style={{ fontWeight: 800 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }} className="animate-fade-in">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: "var(--yellow)",
              display: "inline-grid", placeItems: "center",
              fontWeight: 800, fontSize: 16,
              border: "1.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            OK
          </div>
          <h1 className="h2" style={{ marginTop: 14 }}>Welcome back</h1>
          <p className="p" style={{ marginTop: 6 }}>Sign in to your OKMindful account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="neo-surface" style={{ padding: "26px 24px" }}>
            <div className="grid" style={{ gap: 16 }}>
              <div>
                <label className="p" style={{ fontWeight: 700, display: "block", marginBottom: 6, fontSize: 13 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="neo-input"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="p" style={{ fontWeight: 700, display: "block", marginBottom: 6, fontSize: 13 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="neo-input"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(244,114,182,0.12)", border: "1.5px solid rgba(244,114,182,0.2)" }}>
                  <div className="p" style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{error}</div>
                </div>
              )}

              <button type="submit" className="neo-btn" style={{ background: "var(--yellow)", width: "100%" }} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p className="p">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ fontWeight: 700, color: "var(--ink)" }}>
              Register
            </Link>
          </p>
          <p className="p" style={{ marginTop: 8 }}>
            <Link href="/" style={{ color: "var(--ink-soft)" }}>Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

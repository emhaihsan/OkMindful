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
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push("/dashboard");
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
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="neo-surface" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--yellow)", display: "inline-grid", placeItems: "center", fontWeight: 900, fontSize: 18 }}>
            OK
          </div>
          <h1 className="h2" style={{ marginTop: 12 }}>Welcome back</h1>
          <p className="p" style={{ marginTop: 6 }}>Sign in to your OKMindful account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="neo-surface" style={{ padding: 24 }}>
            <div className="grid" style={{ gap: 14 }}>
              <div>
                <label className="p" style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Email</label>
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
                <label className="p" style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Password</label>
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
                <div className="neo-surface-flat" style={{ padding: 10, background: "var(--pink)" }}>
                  <div className="p" style={{ fontWeight: 800, color: "var(--ink)" }}>{error}</div>
                </div>
              )}

              <button type="submit" className="neo-btn" style={{ background: "var(--yellow)", width: "100%" }} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p className="p">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ fontWeight: 800, textDecoration: "underline" }}>
              Register
            </Link>
          </p>
          <p className="p" style={{ marginTop: 8 }}>
            <Link href="/" style={{ textDecoration: "underline" }}>Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

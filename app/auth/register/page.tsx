"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function RegisterPage() {
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    const err = await signUp(email.trim(), password, username.trim());
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
          <h1 className="h2" style={{ marginTop: 12 }}>Create your account</h1>
          <p className="p" style={{ marginTop: 6 }}>Join OKMindful and start building real accountability</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="neo-surface" style={{ padding: 24 }}>
            <div className="grid" style={{ gap: 14 }}>
              <div>
                <label className="p" style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alice"
                  className="neo-input"
                  autoComplete="username"
                />
                <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                  Unique username — others will use this to assign you as a validator.
                </div>
              </div>
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
                  placeholder="Min 6 characters"
                  className="neo-input"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="neo-surface-flat" style={{ padding: 10, background: "var(--pink)" }}>
                  <div className="p" style={{ fontWeight: 800, color: "var(--ink)" }}>{error}</div>
                </div>
              )}

              <button type="submit" className="neo-btn" style={{ background: "var(--yellow)", width: "100%" }} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p className="p">
            Already have an account?{" "}
            <Link href="/auth/login" style={{ fontWeight: 800, textDecoration: "underline" }}>
              Sign In
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

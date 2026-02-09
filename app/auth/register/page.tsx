"use client";

import { useState } from "react";
import Image from "next/image";
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
          <Image src="/logo.webp" alt="OKMindful" width={48} height={48} style={{ borderRadius: 14 }} />
          <h1 className="h2" style={{ marginTop: 14 }}>Create your account</h1>
          <p className="p" style={{ marginTop: 6 }}>Join OKMindful and start building real accountability</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="neo-surface" style={{ padding: "26px 24px" }}>
            <div className="grid" style={{ gap: 16 }}>
              <div>
                <label className="p" style={{ fontWeight: 700, display: "block", marginBottom: 6, fontSize: 13 }}>Username</label>
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
                  placeholder="Min 6 characters"
                  className="neo-input"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(232,114,154,0.12)", border: "1.5px solid rgba(232,114,154,0.2)" }}>
                  <div className="p" style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{error}</div>
                </div>
              )}

              <button type="submit" className="neo-btn" style={{ background: "var(--yellow)", width: "100%" }} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p className="p">
            Already have an account?{" "}
            <Link href="/auth/login" style={{ fontWeight: 700, color: "var(--ink)" }}>
              Sign In
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

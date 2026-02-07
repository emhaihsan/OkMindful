"use client";

import { useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";

export default function CommitmentsPage() {
  const store = useStore();

  const [tab, setTab] = useState<"mine" | "validating">("mine");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mode, setMode] = useState<"commit" | "stake">("commit");
  const [stakeAmount, setStakeAmount] = useState(50);
  const [duration, setDuration] = useState(30);
  const [validators, setValidators] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { setFormError("Title is required."); return; }
    const vList = validators.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
    if (mode === "stake" && vList.length === 0) {
      setFormError("Stake mode requires at least one validator.");
      return;
    }
    setFormError("");
    setCreating(true);
    try {
      await store.addCommitment({
        title: title.trim(),
        description: desc.trim(),
        mode,
        stakeAmount: mode === "stake" ? stakeAmount : 0,
        durationDays: duration,
        startDate: new Date().toISOString().slice(0, 10),
        validators: vList,
      });
      setTitle(""); setDesc(""); setMode("commit"); setStakeAmount(50);
      setDuration(30); setValidators(""); setShowForm(false);
    } catch {
      setFormError("Failed to create commitment. Check validator usernames exist.");
    } finally {
      setCreating(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const mine = store.myCommitments();
  const validating = store.validatingCommitments();
  const activeCount = mine.filter((c) => c.status === "active").length;
  const totalStake = mine.filter((c) => c.status === "active" && c.mode === "stake").reduce((a, c) => a + c.stakeAmount, 0);

  return (
    <AppShell active="commitments">
      <div className="section-pad">
        <div className="page-header">
          <div>
            <h1 className="h2">Commitments</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Create commitments, choose commit or stake mode, and assign validators.
            </p>
          </div>
          <button className="neo-btn" style={{ background: "var(--yellow)" }} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "+ New Commitment"}
          </button>
        </div>

        <div className="grid cols-3" style={{ marginTop: 16 }}>
          <Stat label="My Active" value={String(activeCount)} tint="var(--yellow)" />
          <Stat label="Total Stake" value={`$${totalStake}`} tint="var(--teal)" />
          <Stat label="Validating" value={String(validating.filter((c) => c.status === "active").length)} tint="var(--orange)" />
        </div>

        {/* ─── Create Form ─── */}
        {showForm && (
          <div style={{ marginTop: 16 }} className="animate-fade-in">
            <Card title="New Commitment" accent="var(--orange)">
              <div className="grid" style={{ gap: 12 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Commitment title..." className="neo-input" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)..." rows={2} className="neo-input" style={{ resize: "vertical" }} />

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Mode:</span>
                  <button className="neo-btn" onClick={() => setMode("commit")} style={{ padding: "7px 14px", fontSize: 13, background: mode === "commit" ? "var(--yellow)" : "transparent", border: mode === "commit" ? undefined : "1.5px solid rgba(0,0,0,0.08)" }}>Commit Only</button>
                  <button className="neo-btn" onClick={() => setMode("stake")} style={{ padding: "7px 14px", fontSize: 13, background: mode === "stake" ? "var(--teal)" : "transparent", border: mode === "stake" ? undefined : "1.5px solid rgba(0,0,0,0.08)" }}>Commit + Stake</button>
                </div>

                {mode === "stake" && (
                  <div className="animate-fade-in" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Stake ($):</span>
                    {[10, 25, 50, 100, 250].map((amt) => (
                      <button key={amt} className="neo-btn" onClick={() => setStakeAmount(amt)} style={{ padding: "6px 12px", fontSize: 13, background: stakeAmount === amt ? "var(--pink)" : "transparent", border: stakeAmount === amt ? undefined : "1.5px solid rgba(0,0,0,0.08)" }}>
                        ${amt}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Duration:</span>
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button key={d} className="neo-btn" onClick={() => setDuration(d)} style={{ padding: "6px 12px", fontSize: 13, background: duration === d ? "var(--blue)" : "transparent", border: duration === d ? undefined : "1.5px solid rgba(0,0,0,0.08)" }}>{d}d</button>
                  ))}
                </div>

                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Validators{mode === "stake" ? " (required)" : " (optional)"}:</span>
                    {mode === "stake" && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(244,114,182,0.12)" }}>Required for stake</span>}
                  </div>
                  <input value={validators} onChange={(e) => setValidators(e.target.value)} placeholder="Enter usernames: alice, bob" className="neo-input" style={{ marginTop: 6 }} />
                  <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                    Enter the usernames of registered users who will validate your commitment.
                  </div>
                </div>

                {formError && (
                  <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(244,114,182,0.12)", border: "1.5px solid rgba(244,114,182,0.2)" }}>
                    <div className="p" style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>{formError}</div>
                  </div>
                )}

                <button className="neo-btn" onClick={handleCreate} style={{ background: "var(--yellow)" }} disabled={creating}>
                  {creating ? "Creating..." : "Create Commitment"}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
          <button
            onClick={() => setTab("mine")}
            style={{
              padding: "7px 16px", fontSize: 13, fontWeight: tab === "mine" ? 700 : 500,
              borderRadius: 10, border: tab === "mine" ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
              background: tab === "mine" ? "var(--yellow)" : "transparent",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            My Commitments ({mine.length})
          </button>
          <button
            onClick={() => setTab("validating")}
            style={{
              padding: "7px 16px", fontSize: 13, fontWeight: tab === "validating" ? 700 : 500,
              borderRadius: 10, border: tab === "validating" ? "1.5px solid rgba(0,0,0,0.08)" : "1.5px solid transparent",
              background: tab === "validating" ? "var(--orange)" : "transparent",
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            Validating ({validating.length})
          </button>
        </div>

        {/* ─── My Commitments ─── */}
        <div className="grid" style={{ gap: 12, marginTop: 14 }}>
          {tab === "mine" && mine.map((c) => {
            const checkedToday = !!c.dailyCheckins[today];
            const totalCheckins = Object.keys(c.dailyCheckins).length;
            const progress = Math.round((totalCheckins / c.durationDays) * 100);
            return (
              <Card key={c.id} title={c.title} accent={c.mode === "stake" ? "var(--teal)" : "var(--yellow)"}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    {c.description && <div className="p">{c.description}</div>}
                    <div className="p" style={{ marginTop: 6, fontWeight: 700 }}>
                      {c.mode === "stake" ? "Stake" : "Commit"} · {c.durationDays} days
                      {c.mode === "stake" && ` · $${c.stakeAmount}`}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: c.status === "active" ? "rgba(96,165,250,0.12)" : c.status === "completed" ? "rgba(45,212,191,0.15)" : "rgba(244,114,182,0.12)",
                  }}>
                    {c.status}
                  </span>
                </div>

                {c.validators.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {c.validators.map((v) => {
                      const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                      const bg = vs === "approved" ? "rgba(45,212,191,0.15)" : vs === "rejected" ? "rgba(244,114,182,0.15)" : "rgba(0,0,0,0.04)";
                      return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs}</span>;
                    })}
                  </div>
                )}

                <div className="progress-bar" style={{ marginTop: 12 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>

                {c.status === "active" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: checkedToday ? "var(--teal)" : "var(--yellow)", padding: "7px 14px", fontSize: 13 }} onClick={() => store.checkinCommitment(c.id)} disabled={checkedToday}>
                      {checkedToday ? "Checked in today" : "Check in today"}
                    </button>
                    <button
                      onClick={() => store.deleteCommitment(c.id)}
                      style={{
                        padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 10,
                        border: "1.5px solid rgba(0,0,0,0.08)", background: "transparent",
                        cursor: "pointer", color: "var(--ink-soft)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </Card>
            );
          })}

          {tab === "mine" && mine.length === 0 && (
            <div className="neo-surface" style={{ padding: "24px 20px", textAlign: "center" }}>
              <div className="h3">No commitments yet</div>
              <div className="p" style={{ marginTop: 6 }}>Click &quot;+ New Commitment&quot; to get started.</div>
            </div>
          )}

          {/* ─── Validating for Others ─── */}
          {tab === "validating" && validating.map((c) => {
            const totalCheckins = Object.keys(c.dailyCheckins).length;
            const progress = Math.round((totalCheckins / c.durationDays) * 100);
            const myVS = c.validationStatus?.[store.currentUser] || "pending";
            return (
              <Card key={c.id} title={c.title} accent="var(--orange)">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="p"><b>Owner:</b> {c.owner}</div>
                    {c.description && <div className="p" style={{ marginTop: 4 }}>{c.description}</div>}
                    <div className="p" style={{ marginTop: 6, fontWeight: 700 }}>
                      {c.mode === "stake" ? "Stake" : "Commit"} · {c.durationDays} days
                      {c.mode === "stake" && ` · $${c.stakeAmount}`} · {progress}%
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: c.status === "active" ? "rgba(96,165,250,0.12)" : c.status === "completed" ? "rgba(45,212,191,0.15)" : "rgba(244,114,182,0.12)",
                  }}>
                    {c.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                  {c.validators.map((v) => {
                    const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                    const bg = vs === "approved" ? "rgba(45,212,191,0.15)" : vs === "rejected" ? "rgba(244,114,182,0.15)" : "rgba(0,0,0,0.04)";
                    return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs} {v.toLowerCase() === store.currentUser ? "(you)" : ""}</span>;
                  })}
                </div>

                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days checked in</div>

                {c.status === "active" && myVS === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: "var(--teal)", padding: "7px 14px", fontSize: 13 }} onClick={() => store.validateCommitment(c.id, store.currentUser, true)}>
                      Approve
                    </button>
                    <button className="neo-btn" style={{ background: "var(--pink)", padding: "7px 14px", fontSize: 13 }} onClick={() => store.validateCommitment(c.id, store.currentUser, false)}>
                      Reject
                    </button>
                  </div>
                )}
                {myVS !== "pending" && (
                  <div className="p" style={{ marginTop: 10, fontWeight: 700 }}>
                    Your decision: {myVS === "approved" ? "Approved ✓" : "Rejected ✗"}
                  </div>
                )}
              </Card>
            );
          })}

          {tab === "validating" && validating.length === 0 && (
            <div className="neo-surface" style={{ padding: "24px 20px", textAlign: "center" }}>
              <div className="h3">No commitments to validate</div>
              <div className="p" style={{ marginTop: 6 }}>
                Other users can assign you as a validator using your username.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

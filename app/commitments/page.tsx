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
              Create commitments, choose commit or stake mode, and assign validators by username.
            </p>
          </div>
          <button className="neo-btn" style={{ background: "var(--yellow)" }} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "+ New Commitment"}
          </button>
        </div>

        <div className="grid cols-3" style={{ marginTop: 16 }}>
          <Stat label="My Active" value={String(activeCount)} tint="var(--yellow)" />
          <Stat label="Total Stake" value={`$${totalStake}`} tint="var(--teal)" />
          <Stat label="Validating" value={String(validating.filter((c) => c.status === "active").length)} tint="var(--orange)" />
        </div>

        {/* ─── Create Form ─── */}
        {showForm && (
          <div style={{ marginTop: 16 }}>
            <Card title="New Commitment" accent="var(--orange)">
              <div className="grid" style={{ gap: 10 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Commitment title..." className="neo-input" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)..." rows={2} className="neo-input" style={{ resize: "vertical" }} />

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Mode:</span>
                  <button className="neo-btn" onClick={() => setMode("commit")} style={{ background: mode === "commit" ? "var(--yellow)" : "var(--paper)" }}>Commit Only</button>
                  <button className="neo-btn" onClick={() => setMode("stake")} style={{ background: mode === "stake" ? "var(--teal)" : "var(--paper)" }}>Commit + Stake</button>
                </div>

                {mode === "stake" && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 800 }}>Stake ($):</span>
                    {[10, 25, 50, 100, 250].map((amt) => (
                      <button key={amt} className="neo-btn" onClick={() => setStakeAmount(amt)} style={{ padding: "8px 12px", background: stakeAmount === amt ? "var(--pink)" : "var(--paper)" }}>
                        ${amt}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="p" style={{ fontWeight: 800 }}>Duration (days):</span>
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button key={d} className="neo-btn" onClick={() => setDuration(d)} style={{ padding: "8px 12px", background: duration === d ? "var(--blue)" : "var(--paper)" }}>{d}</button>
                  ))}
                </div>

                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 800 }}>Validators{mode === "stake" ? " (required)" : " (optional)"}:</span>
                    {mode === "stake" && <span className="neo-badge" style={{ background: "var(--pink)", fontSize: 11 }}>Required for stake</span>}
                  </div>
                  <input value={validators} onChange={(e) => setValidators(e.target.value)} placeholder="Enter usernames: alice, bob" className="neo-input" style={{ marginTop: 6 }} />
                  <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                    Enter the usernames of registered users who will validate your commitment.
                  </div>
                </div>

                {formError && (
                  <div className="neo-surface-flat" style={{ padding: 10, background: "var(--pink)" }}>
                    <div className="p" style={{ fontWeight: 800, color: "var(--ink)" }}>{formError}</div>
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
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="neo-btn" onClick={() => setTab("mine")} style={{ background: tab === "mine" ? "var(--yellow)" : "var(--paper)" }}>
            My Commitments ({mine.length})
          </button>
          <button className="neo-btn" onClick={() => setTab("validating")} style={{ background: tab === "validating" ? "var(--orange)" : "var(--paper)" }}>
            Validating for Others ({validating.length})
          </button>
        </div>

        {/* ─── My Commitments ─── */}
        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          {tab === "mine" && mine.map((c) => {
            const checkedToday = !!c.dailyCheckins[today];
            const totalCheckins = Object.keys(c.dailyCheckins).length;
            const progress = Math.round((totalCheckins / c.durationDays) * 100);
            return (
              <Card key={c.id} title={c.title} accent={c.mode === "stake" ? "var(--teal)" : "var(--yellow)"}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    {c.description && <div className="p">{c.description}</div>}
                    <div className="p" style={{ marginTop: 6, fontWeight: 800 }}>
                      {c.mode === "stake" ? "Stake" : "Commit"} &bull; {c.durationDays} days
                      {c.mode === "stake" && ` • $${c.stakeAmount}`}
                    </div>
                  </div>
                  <span className="neo-badge" style={{ background: c.status === "active" ? "var(--blue)" : c.status === "completed" ? "var(--teal)" : "var(--pink)" }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                {/* Validator status */}
                {c.validators.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {c.validators.map((v) => {
                      const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                      const bg = vs === "approved" ? "var(--teal)" : vs === "rejected" ? "var(--pink)" : "var(--paper)";
                      return (
                        <span key={v} className="neo-badge" style={{ background: bg, fontSize: 12 }}>
                          {v}: {vs}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="progress-bar" style={{ marginTop: 12 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>

                {c.status === "active" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: checkedToday ? "var(--teal)" : "var(--yellow)" }} onClick={() => store.checkinCommitment(c.id)} disabled={checkedToday}>
                      {checkedToday ? "Checked in today" : "Check in today"}
                    </button>
                    <button className="neo-btn secondary" style={{ padding: "8px 12px" }} onClick={() => store.deleteCommitment(c.id)}>Delete</button>
                  </div>
                )}
              </Card>
            );
          })}

          {tab === "mine" && mine.length === 0 && (
            <div className="neo-surface" style={{ padding: 20, textAlign: "center" }}>
              <div className="p" style={{ fontWeight: 800 }}>No commitments yet.</div>
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
                    <div className="p" style={{ marginTop: 6, fontWeight: 800 }}>
                      {c.mode === "stake" ? "Stake" : "Commit"} &bull; {c.durationDays} days
                      {c.mode === "stake" && ` • $${c.stakeAmount}`} &bull; Progress: {progress}%
                    </div>
                  </div>
                  <span className="neo-badge" style={{ background: c.status === "active" ? "var(--blue)" : c.status === "completed" ? "var(--teal)" : "var(--pink)" }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                {/* All validators status */}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {c.validators.map((v) => {
                    const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                    const bg = vs === "approved" ? "var(--teal)" : vs === "rejected" ? "var(--pink)" : "var(--paper)";
                    return (
                      <span key={v} className="neo-badge" style={{ background: bg, fontSize: 12 }}>
                        {v}: {vs} {v.toLowerCase() === store.currentUser ? "(you)" : ""}
                      </span>
                    );
                  })}
                </div>

                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6 }}>{totalCheckins}/{c.durationDays} days checked in</div>

                {c.status === "active" && myVS === "pending" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: "var(--teal)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, true)}>
                      Approve
                    </button>
                    <button className="neo-btn" style={{ background: "var(--pink)" }} onClick={() => store.validateCommitment(c.id, store.currentUser, false)}>
                      Reject
                    </button>
                  </div>
                )}
                {myVS !== "pending" && (
                  <div className="p" style={{ marginTop: 10, fontWeight: 800 }}>
                    Your decision: {myVS === "approved" ? "Approved ✓" : "Rejected ✗"}
                  </div>
                )}
              </Card>
            );
          })}

          {tab === "validating" && validating.length === 0 && (
            <div className="neo-surface" style={{ padding: 20, textAlign: "center" }}>
              <div className="p" style={{ fontWeight: 800 }}>No commitments to validate.</div>
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

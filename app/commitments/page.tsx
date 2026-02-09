"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";
import { createClient } from "../lib/supabase";

/* ─── Confirmation Modal ─── */
function ConfirmModal({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 400, width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="h3" style={{ fontSize: 16 }}>{title}</div>
        <p className="p" style={{ marginTop: 10, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600, borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.08)", background: "transparent",
              cursor: "pointer", color: "var(--ink-soft)",
            }}
          >
            Cancel
          </button>
          <button
            className="neo-btn"
            onClick={onConfirm}
            style={{ background: confirmColor, padding: "8px 18px", fontSize: 13 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const CHARITIES = [
  { value: "WHO", label: "World Health Organization (WHO)" },
  { value: "UNICEF", label: "UNICEF" },
  { value: "Red Cross", label: "International Red Cross" },
  { value: "WWF", label: "World Wildlife Fund (WWF)" },
  { value: "Doctors Without Borders", label: "Doctors Without Borders (MSF)" },
];

export default function CommitmentsPage() {
  const store = useStore();
  const { user, profile } = useAuth();

  // Balance
  const [balance, setBalance] = useState<number | null>(null);
  const loadBalance = useCallback(async () => {
    if (!user) return;
    const sb = createClient();
    const { data } = await sb.from("profiles").select("balance").eq("id", user.id).single();
    setBalance((data as { balance: number } | null)?.balance ?? 1000);
  }, [user]);
  useEffect(() => { loadBalance(); }, [loadBalance]);

  async function handleTopup() {
    if (!user) return;
    const newBal = (balance ?? 0) + 500;
    setBalance(newBal);
    const sb = createClient();
    await sb.from("profiles").update({ balance: newBal }).eq("id", user.id);
  }

  const [tab, setTab] = useState<"mine" | "validating">("mine");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mode, setMode] = useState<"commit" | "stake">("commit");
  const [stakeAmount, setStakeAmount] = useState(50);
  const [customStake, setCustomStake] = useState("");
  const [durationType, setDurationType] = useState<"preset" | "custom" | "date">("preset");
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [fundDestination, setFundDestination] = useState("WHO");
  const [validators, setValidators] = useState("");
  const [checkinFreq, setCheckinFreq] = useState<"daily" | "weekly" | "end">("daily");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  // Confirmation popup state
  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel: string; confirmColor: string; action: () => void;
  } | null>(null);

  function askConfirm(title: string, message: string, confirmLabel: string, confirmColor: string, action: () => void) {
    setConfirm({ title, message, confirmLabel, confirmColor, action });
  }

  function executeConfirm() {
    if (confirm) confirm.action();
    setConfirm(null);
  }

  function getEffectiveDuration(): number {
    if (durationType === "date" && deadlineDate) {
      const diff = Math.ceil((new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    }
    if (durationType === "custom" && customDuration) return Math.max(1, parseInt(customDuration) || 30);
    return duration;
  }

  function getEffectiveStake(): number {
    if (customStake) return Math.max(0, parseInt(customStake) || 0);
    return stakeAmount;
  }

  async function handleCreate() {
    if (!title.trim()) { setFormError("Title is required."); return; }
    const vList = validators.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
    if (mode === "stake" && vList.length === 0) {
      setFormError("Stake mode requires at least one validator.");
      return;
    }
    const effDuration = getEffectiveDuration();
    if (effDuration < 1) { setFormError("Duration must be at least 1 day."); return; }
    const effStake = mode === "stake" ? getEffectiveStake() : 0;
    if (mode === "stake" && effStake < 1) { setFormError("Stake must be at least $1."); return; }
    if (mode === "stake" && balance !== null && effStake > balance) {
      setFormError(`Insufficient balance. You have $${balance} but need $${effStake}. Top up first.`);
      return;
    }

    setFormError("");
    setCreating(true);
    try {
      await store.addCommitment({
        title: title.trim(),
        description: desc.trim(),
        mode,
        stakeAmount: effStake,
        durationDays: effDuration,
        startDate: new Date().toISOString().slice(0, 10),
        deadlineDate: durationType === "date" ? deadlineDate : "",
        fundDestination: mode === "stake" ? fundDestination.trim() : "",
        validators: vList,
      });
      setTitle(""); setDesc(""); setMode("commit"); setStakeAmount(50);
      setCustomStake(""); setDuration(30); setCustomDuration("");
      setDeadlineDate(""); setFundDestination("WHO"); setValidators(""); setCheckinFreq("daily");
      // Refresh balance after stake deduction
      if (mode === "stake") loadBalance();
      setDurationType("preset"); setShowForm(false);
    } catch {
      setFormError("Failed to create commitment. Make sure validator usernames or emails are valid.");
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
              Set your resolutions, put money on the line, and let your friends hold you accountable.
            </p>
          </div>
          <button className="neo-btn" style={{ background: "var(--yellow)" }} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "+ New Commitment"}
          </button>
        </div>

        <div className="grid cols-4" style={{ marginTop: 16 }}>
          <Stat label="Balance" value={balance !== null ? `$${balance}` : "..."} tint="var(--blue)" />
          <Stat label="My Active" value={String(activeCount)} tint="var(--yellow)" />
          <Stat label="Staked" value={`$${totalStake}`} tint="var(--teal)" />
          <Stat label="Validating" value={String(validating.filter((c) => c.status === "active").length)} tint="var(--orange)" />
        </div>
        {balance !== null && balance < 100 && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="p" style={{ fontSize: 12, fontWeight: 600 }}>Low balance?</span>
            <button className="neo-btn" onClick={handleTopup} style={{ background: "var(--teal)", padding: "6px 14px", fontSize: 12 }}>+ Top Up $500</button>
          </div>
        )}

        {/* ─── Create Form ─── */}
        {showForm && (
          <div style={{ marginTop: 16 }} className="animate-fade-in">
            <Card title="New Commitment" accent="var(--orange)">
              <div className="grid" style={{ gap: 12 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you committing to?" className="neo-input" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Add details (optional)..." rows={2} className="neo-input" style={{ resize: "vertical" }} />

                {/* Mode */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Mode:</span>
                  <button className="neo-btn" onClick={() => setMode("commit")} style={{ padding: "7px 14px", fontSize: 13, background: mode === "commit" ? "var(--yellow)" : "transparent", color: mode === "commit" ? "#fff" : "var(--ink)", border: mode === "commit" ? undefined : "1.5px solid var(--ink)" }}>Commit Only</button>
                  <button className="neo-btn" onClick={() => setMode("stake")} style={{ padding: "7px 14px", fontSize: 13, background: mode === "stake" ? "var(--teal)" : "transparent", color: mode === "stake" ? "#fff" : "var(--ink)", border: mode === "stake" ? undefined : "1.5px solid var(--ink)" }}>Commit + Stake</button>
                </div>

                {/* Stake Amount */}
                {mode === "stake" && (
                  <div className="animate-fade-in grid" style={{ gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Stake ($):</span>
                      {[10, 25, 50, 100, 250].map((amt) => (
                        <button key={amt} className="neo-btn" onClick={() => { setStakeAmount(amt); setCustomStake(""); }} style={{ padding: "6px 12px", fontSize: 13, background: !customStake && stakeAmount === amt ? "var(--pink)" : "#fff", color: !customStake && stakeAmount === amt ? "#fff" : "var(--ink)", border: "1.5px solid rgba(0,0,0,0.08)" }}>
                          ${amt}
                        </button>
                      ))}
                      <input value={customStake} onChange={(e) => setCustomStake(e.target.value.replace(/\D/g, ""))} placeholder="Custom" className="neo-input" style={{ width: 80 }} />
                    </div>

                    {/* Fund Destination */}
                    <div>
                      <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>If I fail, donate to:</span>
                      <select value={fundDestination} onChange={(e) => setFundDestination(e.target.value)} className="neo-input" style={{ marginTop: 6 }}>
                        {CHARITIES.map((ch) => (
                          <option key={ch.value} value={ch.value}>{ch.label}</option>
                        ))}
                      </select>
                      <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                        Your staked amount will be donated to this organization if you don&apos;t complete.
                      </div>
                    </div>
                    {/* Balance indicator */}
                    <div className="neo-surface-flat" style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="p" style={{ fontSize: 13, fontWeight: 600 }}>Your balance: ${balance ?? "..."}</span>
                      {balance !== null && getEffectiveStake() > balance && (
                        <span className="p" style={{ fontSize: 12, color: "var(--pink)", fontWeight: 600 }}>Insufficient. Top up on Profile page</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div className="grid" style={{ gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Duration:</span>
                    <button className="neo-btn" onClick={() => setDurationType("preset")} style={{ padding: "5px 10px", fontSize: 12, background: durationType === "preset" ? "var(--blue)" : "#fff", color: durationType === "preset" ? "#fff" : "var(--ink)", border: "1.5px solid rgba(0,0,0,0.08)" }}>Preset</button>
                    <button className="neo-btn" onClick={() => setDurationType("custom")} style={{ padding: "5px 10px", fontSize: 12, background: durationType === "custom" ? "var(--blue)" : "#fff", color: durationType === "custom" ? "#fff" : "var(--ink)", border: "1.5px solid rgba(0,0,0,0.08)" }}>Custom Days</button>
                    <button className="neo-btn" onClick={() => setDurationType("date")} style={{ padding: "5px 10px", fontSize: 12, background: durationType === "date" ? "var(--blue)" : "#fff", color: durationType === "date" ? "#fff" : "var(--ink)", border: "1.5px solid rgba(0,0,0,0.08)" }}>Pick Date</button>
                  </div>
                  {durationType === "preset" && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[7, 14, 30, 60, 90].map((d) => (
                        <button key={d} className="neo-btn" onClick={() => setDuration(d)} style={{ padding: "6px 12px", fontSize: 13, background: duration === d ? "var(--blue)" : "#fff", color: duration === d ? "#fff" : "var(--ink)", border: "1.5px solid rgba(0,0,0,0.08)" }}>{d} days</button>
                      ))}
                    </div>
                  )}
                  {durationType === "custom" && (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" min={1} max={365} value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} placeholder="Number of days" className="neo-input" style={{ width: 160 }} />
                      <span className="p" style={{ fontSize: 13 }}>days</span>
                    </div>
                  )}
                  {durationType === "date" && (
                    <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} className="neo-input" style={{ width: 200 }} />
                  )}
                </div>

                {/* Check-in Frequency */}
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Check-in style:</span>
                    {(["daily", "weekly", "end"] as const).map((f) => (
                      <button key={f} className="neo-btn" onClick={() => setCheckinFreq(f)} style={{ padding: "6px 12px", fontSize: 13, background: checkinFreq === f ? "var(--lime)" : "var(--bg)", color: checkinFreq === f ? "#fff" : "var(--ink)", border: checkinFreq === f ? undefined : "1.5px solid rgba(0,0,0,0.08)" }}>
                        {f === "daily" ? "Daily" : f === "weekly" ? "Weekly" : "End of Period"}
                      </button>
                    ))}
                  </div>
                  <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                    {checkinFreq === "daily" ? "Check in every day to maintain your streak." : checkinFreq === "weekly" ? "Check in once per week to report progress." : "Self-assess at the end of the commitment period."}
                  </div>
                </div>

                {/* Validators */}
                <div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="p" style={{ fontWeight: 700, fontSize: 13 }}>Validators{mode === "stake" ? " (required)" : " (optional)"}:</span>
                    {mode === "stake" && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(232,114,154,0.12)" }}>Required for stake</span>}
                  </div>
                  <input value={validators} onChange={(e) => setValidators(e.target.value)} placeholder="Enter usernames or emails: alice, bob@email.com" className="neo-input" style={{ marginTop: 6 }} />
                  <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                    Validators can only approve/reject after you self-assess your commitment.
                  </div>
                </div>

                {formError && (
                  <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(232,114,154,0.12)", border: "1.5px solid rgba(232,114,154,0.2)" }}>
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
                      {c.deadlineDate && ` · Due ${c.deadlineDate}`}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(141,177,94,0.15)" }}>
                        {c.checkinFrequency === "weekly" ? "Weekly check-in" : c.checkinFrequency === "end" ? "End-of-period review" : "Daily check-in"}
                      </span>
                      {c.selfAssigned && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(141,177,94,0.15)" }}>Self-assessed</span>}
                    </div>
                    {c.fundDestination && (
                      <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                        If failed &rarr; {c.fundDestination}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, height: "fit-content",
                    background: c.status === "active" ? "rgba(26,62,92,0.1)" : c.status === "completed" ? "rgba(141,177,94,0.15)" : "rgba(232,114,154,0.12)",
                  }}>
                    {c.status}
                  </span>
                </div>

                {c.validators.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {c.validators.map((v) => {
                      const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                      const bg = vs === "approved" ? "rgba(141,177,94,0.15)" : vs === "rejected" ? "rgba(232,114,154,0.15)" : "rgba(0,0,0,0.04)";
                      return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs}</span>;
                    })}
                    {!c.selfAssigned && c.validators.length > 0 && (
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "rgba(246,177,50,0.12)", color: "var(--ink-soft)" }}>Awaiting your self-assessment</span>
                    )}
                  </div>
                )}

                <div className="progress-bar" style={{ marginTop: 12 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days ({progress}%)</div>

                {c.status === "active" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: checkedToday ? "var(--teal)" : "var(--yellow)", padding: "7px 14px", fontSize: 13 }} onClick={() => askConfirm("Check In", `Mark today's check-in for "${c.title}"? This cannot be undone.`, "Check In", "var(--yellow)", () => store.checkinCommitment(c.id))} disabled={checkedToday}>
                      {checkedToday ? "Checked in today" : "Check in today"}
                    </button>
                    {c.validators.length > 0 && !c.selfAssigned && (
                      <button className="neo-btn" style={{ background: "var(--lime)", padding: "7px 14px", fontSize: 13 }} onClick={() => askConfirm("Self-Assess Complete", `Confirm that you have completed "${c.title}"? Your validators will then be able to review. This cannot be undone.`, "Confirm", "var(--lime)", () => store.selfAssignCommitment(c.id))}>
                        Self-Assess Complete
                      </button>
                    )}
                    <button
                      onClick={() => askConfirm("Delete Commitment", `Are you sure you want to delete "${c.title}"? This cannot be undone.${c.mode === "stake" ? " Your staked amount will not be refunded." : ""}`, "Delete", "var(--pink)", () => store.deleteCommitment(c.id))}
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
                    {c.fundDestination && (
                      <div className="p" style={{ marginTop: 4, fontSize: 12 }}>
                        If failed → {c.fundDestination}
                      </div>
                    )}
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: c.status === "active" ? "rgba(26,62,92,0.1)" : c.status === "completed" ? "rgba(141,177,94,0.15)" : "rgba(232,114,154,0.12)",
                  }}>
                    {c.status}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                  {c.validators.map((v) => {
                    const vs = c.validationStatus?.[v.toLowerCase()] || "pending";
                    const bg = vs === "approved" ? "rgba(141,177,94,0.15)" : vs === "rejected" ? "rgba(232,114,154,0.15)" : "rgba(0,0,0,0.04)";
                    return <span key={v} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg }}>{v}: {vs} {v.toLowerCase() === store.currentUser ? "(you)" : ""}</span>;
                  })}
                </div>

                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="p" style={{ marginTop: 6, fontSize: 12 }}>{totalCheckins}/{c.durationDays} days checked in</div>

                {c.status === "active" && myVS === "pending" && c.selfAssigned && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="neo-btn" style={{ background: "var(--teal)", padding: "7px 14px", fontSize: 13 }} onClick={() => askConfirm("Approve Commitment", `Approve "${c.title}" by ${c.owner}? This means you confirm they completed their goal. This cannot be undone.`, "Approve", "var(--teal)", () => store.validateCommitment(c.id, store.currentUser, true))}>
                      Approve
                    </button>
                    <button className="neo-btn" style={{ background: "var(--pink)", padding: "7px 14px", fontSize: 13 }} onClick={() => askConfirm("Reject Commitment", `Reject "${c.title}" by ${c.owner}? This means you believe they did not complete their goal.${c.mode === "stake" ? " Their staked amount will be forfeited." : ""} This cannot be undone.`, "Reject", "var(--pink)", () => store.validateCommitment(c.id, store.currentUser, false))}>
                      Reject
                    </button>
                  </div>
                )}
                {c.status === "active" && myVS === "pending" && !c.selfAssigned && (
                  <div className="neo-surface-flat" style={{ padding: "10px 14px", marginTop: 12 }}>
                    <div className="p" style={{ fontSize: 12, fontWeight: 600 }}>
                      Waiting for {c.owner} to self-assess before you can validate.
                    </div>
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
                Friends can assign you as their validator using your username ({profile?.username || "..."}) or email.
              </div>
            </div>
          )}
        </div>

        {/* ─── Disclaimer ─── */}
        <div style={{ marginTop: 28, padding: "14px 18px", borderRadius: 16, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="p" style={{ fontSize: 12, lineHeight: 1.7 }}>
            <b>Disclaimer:</b> OKMindful uses a demo balance system for accountability purposes.
            Stakes are simulated, no real money is transferred. Fund destinations are recorded
            as declared intent only. This platform is designed to help you achieve your goals
            and is not a financial or gambling service.
          </div>
        </div>
      </div>
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmColor={confirm.confirmColor}
          onConfirm={executeConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </AppShell>
  );
}

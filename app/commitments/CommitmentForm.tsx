"use client";

import { useState } from "react";
import { Card } from "../ui/Card";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";
import { CHARITIES } from "../lib/constants";

interface CommitmentFormProps {
  balance: number | null;
  onCreated: () => void;
  onClose: () => void;
}

export function CommitmentForm({ balance, onCreated, onClose }: CommitmentFormProps) {
  const store = useStore();
  const { user } = useAuth();

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
      onCreated();
      onClose();
    } catch {
      setFormError("Failed to create commitment. Make sure validator usernames or emails are valid.");
    } finally {
      setCreating(false);
    }
  }

  return (
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
  );
}

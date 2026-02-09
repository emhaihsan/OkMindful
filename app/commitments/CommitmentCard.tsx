"use client";

import { Card } from "../ui/Card";
import { useStore } from "../lib/store";
import type { Commitment } from "../lib/types";

interface CommitmentCardProps {
  commitment: Commitment;
  today: string;
  onConfirm: (title: string, message: string, confirmLabel: string, confirmColor: string, action: () => void) => void;
}

export function CommitmentCard({ commitment: c, today, onConfirm }: CommitmentCardProps) {
  const store = useStore();
  const checkedToday = !!c.dailyCheckins[today];
  const totalCheckins = Object.keys(c.dailyCheckins).length;
  const progress = Math.round((totalCheckins / c.durationDays) * 100);

  return (
    <Card title={c.title} accent={c.mode === "stake" ? "var(--teal)" : "var(--yellow)"}>
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
          <button
            className="neo-btn"
            style={{ background: checkedToday ? "var(--teal)" : "var(--yellow)", padding: "7px 14px", fontSize: 13 }}
            onClick={() => onConfirm("Check In", `Mark today's check-in for "${c.title}"? This cannot be undone.`, "Check In", "var(--yellow)", () => store.checkinCommitment(c.id))}
            disabled={checkedToday}
          >
            {checkedToday ? "Checked in today" : "Check in today"}
          </button>
          {c.validators.length > 0 && !c.selfAssigned && (
            <button
              className="neo-btn"
              style={{ background: "var(--lime)", padding: "7px 14px", fontSize: 13 }}
              onClick={() => onConfirm("Self-Assess Complete", `Confirm that you have completed "${c.title}"? Your validators will then be able to review. This cannot be undone.`, "Confirm", "var(--lime)", () => store.selfAssignCommitment(c.id))}
            >
              Self-Assess Complete
            </button>
          )}
          <button
            onClick={() => onConfirm("Delete Commitment", `Are you sure you want to delete "${c.title}"? This cannot be undone.${c.mode === "stake" ? " Your staked amount will not be refunded." : ""}`, "Delete", "var(--pink)", () => store.deleteCommitment(c.id))}
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
}

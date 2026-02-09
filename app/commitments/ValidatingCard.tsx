"use client";

import { Card } from "../ui/Card";
import { useStore } from "../lib/store";
import type { Commitment } from "../lib/types";

interface ValidatingCardProps {
  commitment: Commitment;
  onConfirm: (title: string, message: string, confirmLabel: string, confirmColor: string, action: () => void) => void;
}

export function ValidatingCard({ commitment: c, onConfirm }: ValidatingCardProps) {
  const store = useStore();
  const totalCheckins = Object.keys(c.dailyCheckins).length;
  const progress = Math.round((totalCheckins / c.durationDays) * 100);
  const myVS = c.validationStatus?.[store.currentUser] || "pending";

  return (
    <Card title={c.title} accent="var(--orange)">
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
          <button
            className="neo-btn"
            style={{ background: "var(--teal)", padding: "7px 14px", fontSize: 13 }}
            onClick={() => onConfirm("Approve Commitment", `Approve "${c.title}" by ${c.owner}? This means you confirm they completed their goal. This cannot be undone.`, "Approve", "var(--teal)", () => store.validateCommitment(c.id, store.currentUser, true))}
          >
            Approve
          </button>
          <button
            className="neo-btn"
            style={{ background: "var(--pink)", padding: "7px 14px", fontSize: 13 }}
            onClick={() => onConfirm("Reject Commitment", `Reject "${c.title}" by ${c.owner}? This means you believe they did not complete their goal.${c.mode === "stake" ? " Their staked amount will be forfeited." : ""} This cannot be undone.`, "Reject", "var(--pink)", () => store.validateCommitment(c.id, store.currentUser, false))}
          >
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
}

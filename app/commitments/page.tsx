"use client";

import { useState } from "react";
import { AppShell } from "../ui/AppShell";
import { Stat } from "../ui/Stat";
import { ConfirmModal, useConfirm } from "../ui/ConfirmModal";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth-context";
import { useBalance } from "../lib/hooks/useBalance";
import { CommitmentForm } from "./CommitmentForm";
import { CommitmentCard } from "./CommitmentCard";
import { ValidatingCard } from "./ValidatingCard";

export default function CommitmentsPage() {
  const store = useStore();
  const { user, profile } = useAuth();
  const { balance, topUp } = useBalance(user?.id);
  const { confirm, askConfirm, execute, cancel } = useConfirm();

  const [tab, setTab] = useState<"mine" | "validating">("mine");
  const [showForm, setShowForm] = useState(false);

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
            <button className="neo-btn" onClick={() => topUp()} style={{ background: "var(--teal)", padding: "6px 14px", fontSize: 12 }}>+ Top Up $500</button>
          </div>
        )}

        {showForm && (
          <CommitmentForm
            balance={balance}
            onCreated={() => { if (store.myCommitments().some((c) => c.mode === "stake")) { /* balance refreshed via hook */ } }}
            onClose={() => setShowForm(false)}
          />
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

        {/* ─── Commitment Lists ─── */}
        <div className="grid" style={{ gap: 12, marginTop: 14 }}>
          {tab === "mine" && mine.map((c) => (
            <CommitmentCard key={c.id} commitment={c} today={today} onConfirm={askConfirm} />
          ))}

          {tab === "mine" && mine.length === 0 && (
            <div className="neo-surface" style={{ padding: "24px 20px", textAlign: "center" }}>
              <div className="h3">No commitments yet</div>
              <div className="p" style={{ marginTop: 6 }}>Click &quot;+ New Commitment&quot; to get started.</div>
            </div>
          )}

          {tab === "validating" && validating.map((c) => (
            <ValidatingCard key={c.id} commitment={c} onConfirm={askConfirm} />
          ))}

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
          onConfirm={execute}
          onCancel={cancel}
        />
      )}
    </AppShell>
  );
}

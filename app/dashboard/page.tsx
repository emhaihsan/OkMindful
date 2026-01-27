import Link from "next/link";
import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";

export default function DashboardPage() {
  return (
    <AppShell active="dashboard">
      <div style={{ padding: "20px 0 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="h2">Dashboard Komitmen</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Fokus hari ini: 2 tugas kecil, 1 sesi fokus, 0 alasan.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link className="neo-btn secondary" href="/pomodoro">
              Start Pomodoro
            </Link>
            <button className="neo-btn" style={{ background: "var(--yellow)" }}>
              Buat komitmen baru
            </button>
          </div>
        </div>

        <div className="grid cols-3" style={{ marginTop: 16 }}>
          <Stat label="Streak" value="7 hari" tint="var(--yellow)" />
          <Stat label="Stake aktif" value="Rp 100.000" tint="var(--teal)" />
          <Stat label="Risk" value="Low" tint="var(--blue)" />
        </div>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          <Card title="Komitmen aktif" accent="var(--pink)">
            <div className="grid" style={{ gap: 12 }}>
              <div className="neo-surface" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="h3">Pomodoro 2x per hari</div>
                    <div className="p">Mode: Stake • Target: 30 hari</div>
                  </div>
                  <span className="neo-badge" style={{ background: "var(--teal)" }}>
                    ON TRACK
                  </span>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="p" style={{ fontWeight: 800, marginBottom: 6 }}>
                    Progress minggu ini
                  </div>
                  <div className="neo-surface-flat" style={{ padding: 10, background: "var(--bg)" }}>
                    <div
                      style={{
                        height: 18,
                        border: "2px solid var(--ink)",
                        borderRadius: 999,
                        background: "var(--paper)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ width: "70%", height: "100%", background: "var(--yellow)" }} />
                    </div>
                    <div className="p" style={{ marginTop: 8 }}>
                      14/20 sesi tercapai • sisa 6
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--yellow)" }}>
                    Check-in hari ini
                  </button>
                  <button className="neo-btn secondary">Edit aturan</button>
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div className="h3">No sugar 5 hari/minggu</div>
                    <div className="p">Mode: Komitmen • Target: 8 minggu</div>
                  </div>
                  <span className="neo-badge" style={{ background: "var(--blue)" }}>
                    STABLE
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--lime)" }}>
                    Log hari ini
                  </button>
                  <button className="neo-btn secondary">Tambah reminder</button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Stake & Donasi" accent="var(--teal)">
            <div className="grid" style={{ gap: 12 }}>
              <div className="neo-surface-flat" style={{ padding: 14, background: "var(--bg)" }}>
                <div className="h3">Aturan utama</div>
                <p className="p" style={{ marginTop: 6 }}>
                  Jika gagal 2 hari berturut-turut, stake otomatis masuk donasi.
                  Jika berhasil, stake balik full.
                </p>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Saldo stake</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="neo-badge" style={{ background: "var(--yellow)" }}>
                    Terkunci: Rp 100.000
                  </span>
                  <span className="neo-badge" style={{ background: "var(--pink)" }}>
                    Potensi donasi: Rp 0
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--teal)" }}>
                    Top up stake
                  </button>
                  <button className="neo-btn secondary">Pilih tujuan donasi</button>
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Aktivitas terakhir</div>
                <div className="p" style={{ marginTop: 6 }}>
                  - Check-in sukses (Pomodoro) • +1 streak
                  <br />
                  - 2 sesi fokus tercatat • 50 menit
                  <br />
                  - Advisor menyarankan: “turunin friction, naikkin konsistensi”
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

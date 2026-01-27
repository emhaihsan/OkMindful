import Link from "next/link";
import { AppShell } from "./ui/AppShell";
import { Card } from "./ui/Card";
import { Stat } from "./ui/Stat";

export default function HomePage() {
  return (
    <AppShell active="home">
      <section style={{ padding: "28px 0" }}>
        <div className="grid cols-2" style={{ alignItems: "start" }}>
          <div>
            <div className="neo-badge" style={{ background: "var(--teal)" }}>
              <span>New Year Resolution Engine</span>
              <span className="kbd">2026</span>
            </div>
            <h1 className="h1" style={{ marginTop: 14 }}>
              Komitmen next level.
              <br />
              Stake kalau perlu.
            </h1>
            <p className="p" style={{ marginTop: 12, fontSize: 16, maxWidth: 520 }}>
              Buat komitmen harian/mingguan. Pilih mode:
              <b> Komitmen</b> (tanpa uang) atau <b>Komitmen + Stake</b>.
              Kalau gagal: disumbangkan. Kalau berhasil: duit balik.
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <Link className="neo-btn" href="/dashboard">
                Mulai sekarang
              </Link>
              <Link className="neo-btn secondary" href="/chat">
                Ngobrol sama advisor
              </Link>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              <span className="neo-badge" style={{ background: "var(--yellow)" }}>
                Anti-alasan
              </span>
              <span className="neo-badge" style={{ background: "var(--pink)" }}>
                Kontras keras
              </span>
              <span className="neo-badge" style={{ background: "var(--blue)" }}>
                Accountability
              </span>
            </div>
          </div>

          <div>
            <Card
              title="Buat komitmen pertama"
              accent="var(--pink)"
              footer={
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--yellow)" }}>
                    Komitmen doang
                  </button>
                  <button className="neo-btn" style={{ background: "var(--teal)" }}>
                    Komitmen + Stake
                  </button>
                </div>
              }
            >
              <div className="grid" style={{ gap: 12 }}>
                <div className="neo-surface-flat" style={{ padding: 12 }}>
                  <div className="h3">Resolusi</div>
                  <div className="p">&quot;Pomodoro 2x per hari selama 30 hari&quot;</div>
                </div>
                <div className="grid cols-2">
                  <Stat label="Durasi" value="30 hari" tint="var(--yellow)" />
                  <Stat label="Target" value="60 sesi" tint="var(--teal)" />
                </div>
                <div className="neo-surface-flat" style={{ padding: 12 }}>
                  <div className="h3">Aturan stake</div>
                  <div className="p">
                    Stake Rp 100.000. Jika kamu gagal 2 hari berturut-turut,
                    otomatis masuk donasi.
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section style={{ padding: "10px 0 36px" }}>
        <div className="grid cols-3">
          <Card title="Dashboard" accent="var(--yellow)" ctaHref="/dashboard" ctaLabel="Lihat komitmen">
            <p className="p">
              Pantau streak, status stake, progress mingguan, dan alarm &quot;risk of fail&quot;.
            </p>
          </Card>
          <Card title="Pomodoro" accent="var(--teal)" ctaHref="/pomodoro" ctaLabel="Mulai fokus">
            <p className="p">Timer brutalist yang simple, tapi disiplin. Ada log sesi harian.</p>
          </Card>
          <Card title="Productivity Advisor" accent="var(--pink)" ctaHref="/chat" ctaLabel="Chat sekarang">
            <p className="p">Agent yang bantu bikin rencana, check-in, dan ngasih saran adaptif.</p>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

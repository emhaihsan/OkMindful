import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";
import { Stat } from "../ui/Stat";

export default function ProfilePage() {
  return (
    <AppShell active="profile">
      <div style={{ padding: "20px 0 34px" }}>
        <div className="grid cols-2" style={{ alignItems: "start" }}>
          <Card title="User" accent="var(--yellow)">
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <div
                className="neo-surface"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 24,
                  background: "var(--blue)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 24,
                }}
              >
                OK
              </div>
              <div>
                <div className="h2">Kamu</div>
                <div className="p">Role: Resolution Builder • Level: 3</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="neo-badge" style={{ background: "var(--teal)" }}>
                    Streak 7
                  </span>
                  <span className="neo-badge" style={{ background: "var(--pink)" }}>
                    Stake safe
                  </span>
                </div>
              </div>
            </div>

            <div className="grid cols-3" style={{ marginTop: 16 }}>
              <Stat label="Komitmen" value="4" tint="var(--yellow)" />
              <Stat label="Sukses" value="82%" tint="var(--lime)" />
              <Stat label="Fokus" value="12h" tint="var(--teal)" />
            </div>
          </Card>

          <Card title="Statistik" accent="var(--pink)">
            <div className="grid" style={{ gap: 12 }}>
              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Grafik weekly (mock)</div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "flex-end" }}>
                  {[
                    { h: 30, c: "var(--yellow)" },
                    { h: 54, c: "var(--teal)" },
                    { h: 20, c: "var(--blue)" },
                    { h: 68, c: "var(--pink)" },
                    { h: 44, c: "var(--lime)" },
                    { h: 60, c: "var(--orange)" },
                    { h: 40, c: "var(--yellow)" },
                  ].map((b, idx) => (
                    <div
                      key={idx}
                      className="neo-surface-flat"
                      style={{ width: 22, height: b.h + 20, background: b.c, borderRadius: 14 }}
                    />
                  ))}
                </div>
                <div className="p" style={{ marginTop: 10 }}>
                  Sesi fokus lebih tinggi di hari kerja. Weekend drop.
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Badge</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="neo-badge" style={{ background: "var(--yellow)" }}>
                    Early Starter
                  </span>
                  <span className="neo-badge" style={{ background: "var(--teal)" }}>
                    Focus Machine
                  </span>
                  <span className="neo-badge" style={{ background: "var(--pink)" }}>
                    No Excuses
                  </span>
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Log ringkas</div>
                <div className="p" style={{ marginTop: 6 }}>
                  - 12 sesi pomodoro minggu ini
                  <br />
                  - 1 hari off (sakit)
                  <br />
                  - 0 hari gagal stake
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

import { AppShell } from "../ui/AppShell";
import { Card } from "../ui/Card";

const demoMessages = [
  {
    from: "agent" as const,
    text: "Halo! Aku Productivity Advisor kamu. Resolusi kamu apa minggu ini?",
  },
  {
    from: "user" as const,
    text: "Aku pengen konsisten pomodoro 2x per hari, tapi suka kebawa meeting.",
  },
  {
    from: "agent" as const,
    text: "Oke. Kita bikin plan yang tahan gangguan: 1 sesi sebelum meeting pertama, 1 sesi setelah makan siang. Mau aku bikin checklist + aturan stake?",
  },
];

export default function ChatPage() {
  return (
    <AppShell active="chat">
      <div style={{ padding: "20px 0 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 className="h2">Chat • Productivity Advisor</h1>
            <p className="p" style={{ marginTop: 6 }}>
              Mock UI agent (belum terhubung LLM). Fokus: rencana, check-in, evaluasi.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="neo-badge" style={{ background: "var(--teal)" }}>
              Online
            </span>
            <button className="neo-btn secondary">Reset chat</button>
          </div>
        </div>

        <div className="grid cols-2" style={{ marginTop: 16, alignItems: "start" }}>
          <Card title="Percakapan" accent="var(--yellow)">
            <div className="grid" style={{ gap: 10 }}>
              {demoMessages.map((m, idx) => {
                const isUser = m.from === "user";
                return (
                  <div
                    key={idx}
                    className="neo-surface"
                    style={{
                      padding: 12,
                      background: isUser ? "var(--blue)" : "var(--paper)",
                      marginLeft: isUser ? "auto" : 0,
                      maxWidth: 520,
                    }}
                  >
                    <div className="h3">{isUser ? "Kamu" : "Advisor"}</div>
                    <div className="p" style={{ marginTop: 6, color: "var(--ink)" }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}

              <div className="neo-surface-flat" style={{ padding: 12, background: "var(--bg)" }}>
                <div className="p" style={{ fontWeight: 800, marginBottom: 8 }}>
                  Input (mock)
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    placeholder="Tulis pesan..."
                    style={{
                      flex: 1,
                      minWidth: 220,
                      padding: "12px 12px",
                      borderRadius: 12,
                      border: "3px solid var(--ink)",
                      boxShadow: "4px 4px 0 var(--ink)",
                      outline: "none",
                      background: "var(--paper)",
                      fontWeight: 600,
                    }}
                  />
                  <button className="neo-btn">Kirim</button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Tools" accent="var(--pink)">
            <div className="grid" style={{ gap: 12 }}>
              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Quick prompts</div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <button className="neo-btn" style={{ background: "var(--yellow)" }}>
                    Buat plan 7 hari
                  </button>
                  <button className="neo-btn" style={{ background: "var(--teal)" }}>
                    Aturan stake aman
                  </button>
                  <button className="neo-btn" style={{ background: "var(--lime)" }}>
                    Review hari ini
                  </button>
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Context snapshot</div>
                <div className="p" style={{ marginTop: 6 }}>
                  - Komitmen aktif: 2
                  <br />
                  - Sesi fokus hari ini: 1/2
                  <br />
                  - Risiko gagal stake: rendah
                </div>
              </div>

              <div className="neo-surface" style={{ padding: 14 }}>
                <div className="h3">Next suggestion</div>
                <div className="p" style={{ marginTop: 6 }}>
                  Kurangi friction: siapkan task list 3 item sebelum mulai pomodoro.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

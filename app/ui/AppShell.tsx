import Link from "next/link";

type Active = "home" | "dashboard" | "profile" | "chat" | "pomodoro";

export function AppShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: Active;
}) {
  return (
    <div>
      <header style={{ padding: "18px 0" }}>
        <div
          className="container neo-surface"
          style={{
            padding: 14,
            background: "var(--paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              className="neo-surface"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "var(--yellow)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
              }}
            >
              OK
            </div>
            <div>
              <div style={{ fontWeight: 900, letterSpacing: "-0.04em" }}>OKMindful</div>
              <div className="p" style={{ fontSize: 12 }}>
                Commit • Stake • Win
              </div>
            </div>
          </Link>

          <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NavLink href="/" label="Landing" active={active === "home"} tint="var(--yellow)" />
            <NavLink
              href="/dashboard"
              label="Dashboard"
              active={active === "dashboard"}
              tint="var(--teal)"
            />
            <NavLink
              href="/profile"
              label="User"
              active={active === "profile"}
              tint="var(--blue)"
            />
            <NavLink href="/chat" label="Chat" active={active === "chat"} tint="var(--pink)" />
            <NavLink
              href="/pomodoro"
              label="Pomodoro"
              active={active === "pomodoro"}
              tint="var(--lime)"
            />
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer style={{ padding: "18px 0 34px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span className="neo-badge" style={{ background: "var(--paper)" }}>
            Neo Brutal • Hard shadow
          </span>
          <span className="neo-badge" style={{ background: "var(--paper)" }}>
            UI Mock v0
          </span>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  tint,
}: {
  href: string;
  label: string;
  active: boolean;
  tint: string;
}) {
  return (
    <Link
      href={href}
      className="neo-btn"
      style={{
        padding: "10px 12px",
        background: active ? tint : "var(--paper)",
      }}
    >
      {label}
    </Link>
  );
}

import Link from "next/link";

export function Card({
  title,
  accent,
  children,
  footer,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="neo-surface animate-fade-in" style={{ padding: "20px 18px 18px", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: -11,
          left: 18,
          padding: "5px 12px",
          background: accent,
          borderRadius: 999,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "-0.01em",
          color: "#fff",
          border: "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {title}
      </div>

      <div style={{ paddingTop: 18 }}>{children}</div>

      {(footer || (ctaHref && ctaLabel)) && (
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>{footer}</div>
          {ctaHref && ctaLabel && (
            <Link className="neo-btn secondary" href={ctaHref}>
              {ctaLabel}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

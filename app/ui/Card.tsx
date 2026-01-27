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
    <section className="neo-surface" style={{ padding: 16, position: "relative" }}>
      <div
        className="neo-surface-flat"
        style={{
          position: "absolute",
          top: -10,
          left: 16,
          padding: "6px 10px",
          background: accent,
          borderRadius: 999,
          fontWeight: 900,
          boxShadow: "3px 3px 0 var(--ink)",
        }}
      >
        {title}
      </div>

      <div style={{ paddingTop: 26 }}>{children}</div>

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

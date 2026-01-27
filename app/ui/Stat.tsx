export function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="neo-surface" style={{ padding: 14, background: tint }}>
      <div className="p" style={{ color: "var(--ink)", fontWeight: 900 }}>
        {label}
      </div>
      <div className="h2" style={{ marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}

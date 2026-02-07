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
    <div className="neo-surface" style={{ padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: tint,
          borderRadius: "20px 0 0 20px",
        }}
      />
      <div className="p" style={{ fontWeight: 600, fontSize: 12, letterSpacing: "0.02em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div className="h2" style={{ marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

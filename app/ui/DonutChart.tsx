"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, size = 180, strokeWidth = 28, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>No data yet</div>
        </div>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedOffset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const pct = s.value / total;
      const dashLength = pct * circumference;
      const gap = circumference - dashLength;
      const offset = -accumulatedOffset + circumference * 0.25;
      accumulatedOffset += dashLength;
      return { ...s, dashLength, gap, offset, pct };
    });

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dashLength} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }}
          />
        ))}
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ textAlign: "center" }}>
          {centerValue && (
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>{centerValue}</div>
          )}
          {centerLabel && (
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-soft)", marginTop: 2 }}>{centerLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DonutLegend({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {segments
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: s.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", flex: 1 }}>
              {s.label}
            </span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
              {s.value}m ({total > 0 ? Math.round((s.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
    </div>
  );
}

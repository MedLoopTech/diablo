const C = { line: "#DEE9E1", primary: "#14664F", marigold: "#EFA63C", inkSoft: "#4C6A61" };

/**
 * The 90-day winding path. Geometry, milestones, and progress-dash math are
 * ported verbatim from design-reference/sehat-90-prototype.jsx (JourneyPath).
 */
export function JourneyPath({ day }: { day: number }) {
  const W = 300, H = 64;
  const milestones = [
    { d: 1, label: "Start" },
    { d: 14, label: "Baseline" },
    { d: 45, label: "Mid-point" },
    { d: 75, label: "Med review" },
    { d: 90, label: "HbA1c" },
  ];
  const x = (d: number) => 14 + (d / 90) * (W - 28);
  const wave = (px: number) => 34 + Math.sin(px / 34) * 10;
  let path = `M ${x(0)} ${wave(x(0))}`;
  for (let d = 2; d <= 90; d += 2) path += ` L ${x(d)} ${wave(x(d))}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <path d={path} fill="none" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
      <path
        d={path}
        fill="none"
        stroke={C.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="500"
        strokeDashoffset={500 - (Math.min(day, 90) / 90) * 500}
        pathLength={500}
      />
      {milestones.map((m) => (
        <g key={m.d}>
          <circle cx={x(m.d)} cy={wave(x(m.d))} r="5" fill={m.d <= day ? C.primary : "#fff"} stroke={m.d <= day ? C.primary : C.line} strokeWidth="2" />
          <text x={x(m.d)} y={wave(x(m.d)) + 18} textAnchor="middle" fontSize="8" fill={C.inkSoft} fontFamily="var(--font-outfit)">
            {m.label}
          </text>
        </g>
      ))}
      <circle cx={x(Math.min(day, 90))} cy={wave(x(Math.min(day, 90)))} r="8" fill={C.marigold} stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

/** Small fasting-trend line, scaled to the data. */
export function FastingTrend({ points }: { points: { value: number }[] }) {
  const W = 280, H = 90;
  if (points.length < 2) return null;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals, 90);
  const max = Math.max(...vals, 160);
  const sx = (i: number) => (i / (points.length - 1)) * W;
  const sy = (v: number) => 10 + (1 - (v - min) / (max - min || 1)) * (H - 30);
  const line = points.map((p, i) => `${sx(i).toFixed(1)},${sy(p.value).toFixed(1)}`).join(" ");
  const targetY = sy(126);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", marginTop: 10 }}>
      <polyline points={line} fill="none" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1={targetY} x2={W} y2={targetY} stroke={C.line} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="0" y={H - 2} fontSize="9" fill={C.inkSoft} fontFamily="var(--font-outfit)">
        Target: under 126 mg/dL fasting
      </text>
    </svg>
  );
}

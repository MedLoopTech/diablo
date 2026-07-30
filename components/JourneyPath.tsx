const C = { line: "#DEE9E1", primary: "#14664F", marigold: "#EFA63C", inkSoft: "#4C6A61" };

// Three program phases and their color tints.
const PHASES = [
  { label: "Baseline",       start: 1,  end: 30,  fill: "#DEF0E8", textColor: "#14664F" },
  { label: "Intervention",   start: 31, end: 60,  fill: "#FDF3DC", textColor: "#9A6A14" },
  { label: "Stabilization",  start: 61, end: 90,  fill: "#E8F4FF", textColor: "#1E5A8A" },
];

/**
 * The 90-day winding path. Geometry, milestones, and progress-dash math are
 * ported verbatim from design-reference/sehat-90-prototype.jsx (JourneyPath).
 * Phase bands (Baseline / Intervention / Stabilization) added per memo §4.
 */
export function JourneyPath({ day }: { day: number }) {
  const W = 300, H = 80;
  // Path centered at y=46 (shifted down 12px vs original to make room for phase labels).
  const wave = (px: number) => 46 + Math.sin(px / 34) * 10;

  const milestones = [
    { d: 1,  label: "Start" },
    { d: 14, label: "Baseline" },
    { d: 45, label: "Mid-point" },
    { d: 75, label: "Med review" },
    { d: 90, label: "HbA1c" },
  ];
  const x = (d: number) => 14 + (d / 90) * (W - 28);

  let path = `M ${x(0)} ${wave(x(0))}`;
  for (let d = 2; d <= 90; d += 2) path += ` L ${x(d)} ${wave(x(d))}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      {/* Phase band backgrounds */}
      {PHASES.map((ph) => {
        const x1 = x(ph.start - 1);
        const x2 = x(ph.end);
        const midX = (x1 + x2) / 2;
        return (
          <g key={ph.label}>
            <rect
              x={x1}
              y={14}
              width={x2 - x1}
              height={H - 14}
              fill={ph.fill}
              opacity={0.7}
              rx={4}
            />
            <text
              x={midX}
              y={10}
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={ph.textColor}
              fontFamily="var(--font-outfit)"
            >
              {ph.label}
            </text>
          </g>
        );
      })}

      {/* Track line (grey background) */}
      <path d={path} fill="none" stroke={C.line} strokeWidth="3" strokeLinecap="round" />

      {/* Progress line (green fill up to current day) */}
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

      {/* Milestone dots and labels */}
      {milestones.map((m) => (
        <g key={m.d}>
          <circle
            cx={x(m.d)}
            cy={wave(x(m.d))}
            r="5"
            fill={m.d <= day ? C.primary : "#fff"}
            stroke={m.d <= day ? C.primary : C.line}
            strokeWidth="2"
          />
          <text
            x={x(m.d)}
            y={wave(x(m.d)) + 18}
            textAnchor="middle"
            fontSize="8"
            fill={C.inkSoft}
            fontFamily="var(--font-outfit)"
          >
            {m.label}
          </text>
        </g>
      ))}

      {/* Current position dot (marigold) */}
      <circle
        cx={x(Math.min(day, 90))}
        cy={wave(x(Math.min(day, 90)))}
        r="8"
        fill={C.marigold}
        stroke="#fff"
        strokeWidth="2.5"
      />
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

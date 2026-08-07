const MILESTONES = [
  { d: 1, label: "Start" },
  { d: 14, label: "Baseline" },
  { d: 45, label: "Med review" },
  { d: 90, label: "HbA1c" },
];

/** The 90-day winding path from design-reference/sehat-90-prototype.jsx, adapted as the journey section's visual spine. */
export function JourneyPath() {
  const W = 700;
  const H = 120;
  const x = (d: number) => 20 + (d / 90) * (W - 40);
  const wave = (px: number) => 60 + Math.sin(px / 60) * 26;

  let path = `M ${x(0)} ${wave(x(0))}`;
  for (let d = 2; d <= 90; d += 2) path += ` L ${x(d)} ${wave(x(d))}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="The 90-day program path">
      <path d={path} fill="none" stroke="#DEE9E1" strokeWidth="4" strokeLinecap="round" />
      <path d={path} fill="none" stroke="#14664F" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 10" />
      {MILESTONES.map((m) => (
        <g key={m.d}>
          <circle cx={x(m.d)} cy={wave(x(m.d))} r="9" fill="#14664F" stroke="#fff" strokeWidth="3" />
          <text
            x={x(m.d)}
            y={wave(x(m.d)) + (m.d === 45 ? -20 : 28)}
            textAnchor="middle"
            fontSize="13"
            fontWeight={600}
            fill="#0C332B"
            fontFamily="var(--font-outfit)"
          >
            {m.label}
          </text>
          <text
            x={x(m.d)}
            y={wave(x(m.d)) + (m.d === 45 ? -6 : 42)}
            textAnchor="middle"
            fontSize="11"
            fill="#4C6A61"
            fontFamily="var(--font-outfit)"
          >
            Day {m.d}
          </text>
        </g>
      ))}
    </svg>
  );
}

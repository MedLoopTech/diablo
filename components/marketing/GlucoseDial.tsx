"use client";

import { useEffect, useState } from "react";

type Reading = { frac: number; value: number; label: string };

const READINGS: Reading[] = [
  { frac: 0.08, value: 118, label: "fasting" },
  { frac: 0.32, value: 132, label: "pre-lunch" },
  { frac: 0.52, value: 168, label: "post-lunch" },
  { frac: 0.74, value: 141, label: "pre-dinner" },
];

const zoneColor = (v: number) => (v < 130 ? "#14664F" : v < 180 ? "#EFA63C" : "#DF5F4C");

/** The glucose-horizon dial from design-reference/sehat-90-prototype.jsx, adapted as the landing hero's product visual. */
export function GlucoseDial() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => (c >= READINGS.length ? 1 : c + 1));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const readings = READINGS.slice(0, count);
  const latest = readings[readings.length - 1];

  const W = 320;
  const H = 190;
  const cx = W / 2;
  const cy = 172;
  const r = 128;
  const toXY = (frac: number, radius = r): [number, number] => {
    const a = Math.PI - frac * Math.PI;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Glucose horizon dial showing today's readings">
      <path d={arcPath} fill="none" stroke="#1E4B3C" strokeWidth="12" strokeLinecap="round" />
      <path d={arcPath} fill="none" stroke="#2A6350" strokeWidth="12" strokeLinecap="round" strokeDasharray="230 460" strokeDashoffset="-46" />
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const [x1, y1] = toXY(f, r - 14);
        const [x2, y2] = toXY(f, r - 24);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2A6350" strokeWidth="2" />;
      })}
      {["6am", "2pm", "10pm"].map((t, i) => {
        const [x, y] = toXY(i * 0.5, r + 16);
        return (
          <text key={t} x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="#8FB0A3" fontFamily="var(--font-outfit)">
            {t}
          </text>
        );
      })}
      {readings.map((rd, i) => {
        const [x, y] = toXY(rd.frac);
        const isLatest = i === readings.length - 1;
        return (
          <g key={i} style={{ transition: "opacity 0.4s ease" }}>
            {isLatest && <circle cx={x} cy={y} r={13} fill={zoneColor(rd.value)} opacity={0.25} />}
            <circle cx={x} cy={y} r={isLatest ? 8 : 6} fill={zoneColor(rd.value)} stroke="#06231D" strokeWidth="2.5" />
          </g>
        );
      })}
      <text x={cx} y={cy - 40} textAnchor="middle" fontFamily="var(--font-fraunces)" fontWeight="600" fontSize="46" fill="#F3F7F3">
        {latest.value}
      </text>
      <text x={cx} y={cy - 18} textAnchor="middle" fontFamily="var(--font-outfit)" fontSize="11" fill="#8FB0A3" letterSpacing="0.12em">
        MG/DL · {latest.label.toUpperCase()}
      </text>
    </svg>
  );
}

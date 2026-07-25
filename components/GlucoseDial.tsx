import { zoneColor } from "@/lib/glucose";

// Palette constants used by the SVG (kept local so this stays a pure component).
const C = {
  line: "#DEE9E1",
  mint: "#E3F0E8",
  ink: "#0C332B",
  inkSoft: "#4C6A61",
};

export type DialReading = { frac: number; value: number; label: string };

/**
 * Signature glucose-horizon dial. Arc geometry, tick math, in-range band, and
 * zone coloring are ported verbatim from design-reference/sehat-90-prototype.jsx
 * (GlucoseDial). Only the data source changed: real readings, not mock props.
 */
export function GlucoseDial({ readings }: { readings: DialReading[] }) {
  const W = 280,
    H = 150,
    cx = W / 2,
    cy = 138,
    r = 112;
  const toXY = (frac: number, radius = r): [number, number] => {
    const a = Math.PI - frac * Math.PI;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const latest = readings.length ? readings[readings.length - 1] : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <path d={arcPath} fill="none" stroke={C.line} strokeWidth="10" strokeLinecap="round" />
      {/* in-range band */}
      <path
        d={arcPath}
        fill="none"
        stroke={C.mint}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="200 400"
        strokeDashoffset="-40"
      />
      {/* hour ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const [x1, y1] = toXY(f, r - 12);
        const [x2, y2] = toXY(f, r - 20);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth="2" />;
      })}
      {["6am", "2pm", "10pm"].map((t, i) => {
        const [x, y] = toXY(i * 0.5, r + 14);
        return (
          <text key={t} x={x} y={y + 4} textAnchor="middle" fontSize="9" fill={C.inkSoft} fontFamily="var(--font-outfit)">
            {t}
          </text>
        );
      })}
      {/* readings */}
      {readings.map((rd, i) => {
        const [x, y] = toXY(rd.frac);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === readings.length - 1 ? 8 : 5.5}
            fill={zoneColor(rd.value)}
            stroke="#fff"
            strokeWidth="2"
          />
        );
      })}
      {/* center number */}
      {latest ? (
        <>
          <text x={cx} y={cy - 34} textAnchor="middle" fontFamily="var(--font-fraunces)" fontWeight="600" fontSize="42" fill={C.ink}>
            {latest.value}
          </text>
          <text x={cx} y={cy - 16} textAnchor="middle" fontFamily="var(--font-outfit)" fontSize="10" fill={C.inkSoft} letterSpacing="0.12em">
            MG/DL · {latest.label.toUpperCase()}
          </text>
        </>
      ) : (
        <text x={cx} y={cy - 22} textAnchor="middle" fontFamily="var(--font-outfit)" fontSize="11" fill={C.inkSoft} letterSpacing="0.08em">
          NO READINGS YET TODAY
        </text>
      )}
    </svg>
  );
}

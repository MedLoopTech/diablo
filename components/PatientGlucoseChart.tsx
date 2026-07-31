"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type Reading = {
  id: string;
  value_mgdl: number;
  context: string;
  flag: string;
  taken_at: string;
};

function dotColor(flag: string) {
  if (flag === "urgent") return "#E05252";
  if (flag === "routine") return "#EFA63C";
  return "#14664F";
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
  });
}

// Custom dot that colors by flag
function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: Reading;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload.flag === "urgent" ? 6 : 4}
      fill={dotColor(payload.flag)}
      stroke="#fff"
      strokeWidth={1.5}
    />
  );
}

export function PatientGlucoseChart({ readings }: { readings: Reading[] }) {
  if (readings.length === 0) {
    return (
      <div className="py-10 text-center font-body text-[13px] text-ink-soft">
        No readings yet.
      </div>
    );
  }

  // Chronological order for chart
  const sorted = [...readings].sort(
    (a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime()
  );

  const data = sorted.map((r) => ({
    ...r,
    time: new Date(r.taken_at).getTime(),
  }));

  const urgentCount = readings.filter((r) => r.flag === "urgent").length;
  const routineCount = readings.filter((r) => r.flag === "routine").length;
  const avg = Math.round(
    readings.reduce((s, r) => s + r.value_mgdl, 0) / readings.length
  );
  const inRange = readings.filter((r) => r.value_mgdl < 180 && r.value_mgdl > 70).length;
  const inRangePct = Math.round((inRange / readings.length) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Stats summary row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "avg", value: `${avg}`, unit: "mg/dL", tone: "" },
          { label: "in range", value: `${inRangePct}%`, unit: "<180", tone: "text-primary-deep" },
          { label: "routine flags", value: String(routineCount), unit: "≥180", tone: routineCount > 0 ? "text-marigold-dark" : "" },
          { label: "urgent flags", value: String(urgentCount), unit: "≥250 / ≤70", tone: urgentCount > 0 ? "text-coral" : "" },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] border border-line bg-paper px-3 py-2 text-center">
            <div className="font-body text-[10px] uppercase tracking-wide text-ink-soft">{s.label}</div>
            <div className={`font-display text-[20px] font-semibold ${s.tone || "text-ink"}`}>{s.value}</div>
            <div className="font-body text-[10px] text-ink-soft">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DEE9E1" vertical={false} />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: "#4C6A61" }}
            tickLine={false}
            axisLine={{ stroke: "#DEE9E1" }}
            minTickGap={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#4C6A61" }}
            tickLine={false}
            axisLine={false}
            domain={[50, "dataMax + 20"]}
            width={36}
          />
          {/* Target bands */}
          <ReferenceLine
            y={70}
            stroke="#E05252"
            strokeDasharray="4 4"
            label={{ value: "low 70", fontSize: 9, fill: "#E05252", position: "insideTopLeft" }}
          />
          <ReferenceLine
            y={180}
            stroke="#EFA63C"
            strokeDasharray="4 4"
            label={{ value: "flag 180", fontSize: 9, fill: "#9A6A14", position: "insideTopRight" }}
          />
          <ReferenceLine
            y={250}
            stroke="#E05252"
            strokeDasharray="4 4"
            label={{ value: "urgent 250", fontSize: 9, fill: "#E05252", position: "insideTopRight" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #DEE9E1",
              fontFamily: "var(--font-outfit)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#4C6A61", fontWeight: 600 }}
            labelFormatter={(ts) =>
              new Date(ts as number).toLocaleString("en-US", {
                timeZone: "Asia/Karachi",
                dateStyle: "medium",
                timeStyle: "short",
              })
            }
            formatter={(v, _, entry) => {
              const r = entry.payload as Reading;
              return [`${v} mg/dL · ${r.context}${r.flag !== "none" ? ` · ${r.flag}` : ""}`, "glucose"] as [string, string];
            }}
          />
          <Line
            type="monotone"
            dataKey="value_mgdl"
            stroke="#DEE9E1"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 font-body text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> In range
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-marigold" /> Routine flag ≥180
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-coral" /> Urgent ≥250 / ≤70
        </span>
      </div>
    </div>
  );
}

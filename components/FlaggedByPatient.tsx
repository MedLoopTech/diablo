"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Scatter,
  ComposedChart,
} from "recharts";

type FlaggedReading = {
  id: string;
  patient_id: string;
  value_mgdl: number;
  context: string;
  flag: "routine" | "urgent";
  taken_at: string;
  patient_name: string | null;
};

type PatientGroup = {
  patient_id: string;
  patient_name: string | null;
  urgentCount: number;
  routineCount: number;
  readings: FlaggedReading[];
};

function MiniSparkline({ readings }: { readings: FlaggedReading[] }) {
  const sorted = [...readings]
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime())
    .slice(-12);

  const data = sorted.map((r) => ({ v: r.value_mgdl, flag: r.flag }));

  return (
    <ResponsiveContainer width={120} height={36}>
      <ComposedChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="#DEE9E1"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Scatter dataKey="v" isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.flag === "urgent" ? "#E05252" : "#EFA63C"}
            />
          ))}
        </Scatter>
        <ReferenceLine y={180} stroke="#EFA63C" strokeWidth={0.75} strokeDasharray="2 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function FlaggedByPatient({ flagged }: { flagged: FlaggedReading[] }) {
  if (flagged.length === 0) {
    return (
      <div className="rounded-card border border-line bg-card p-6 text-center font-body text-[13px] text-ink-soft">
        No flagged readings.
      </div>
    );
  }

  // Group by patient, sort: urgent-first → most flags → most recent
  const groupMap = new Map<string, PatientGroup>();
  for (const r of flagged) {
    const g = groupMap.get(r.patient_id) ?? {
      patient_id: r.patient_id,
      patient_name: r.patient_name,
      urgentCount: 0,
      routineCount: 0,
      readings: [],
    };
    if (r.flag === "urgent") g.urgentCount++;
    else g.routineCount++;
    g.readings.push(r);
    groupMap.set(r.patient_id, g);
  }

  const groups = Array.from(groupMap.values()).sort(
    (a, b) =>
      b.urgentCount - a.urgentCount ||
      b.routineCount - a.routineCount ||
      new Date(b.readings[0].taken_at).getTime() - new Date(a.readings[0].taken_at).getTime()
  );

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => {
        const lastReading = [...g.readings].sort(
          (a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
        )[0];
        const lastValue = lastReading.value_mgdl;
        const lastTime = new Date(lastReading.taken_at).toLocaleDateString("en-US", {
          timeZone: "Asia/Karachi",
          month: "short",
          day: "numeric",
        });

        return (
          <Link
            key={g.patient_id}
            href={`/staff/patients/${g.patient_id}`}
            className="flex items-center gap-3 rounded-card border border-line bg-card px-3.5 py-3 hover:border-primary"
          >
            {/* Patient info */}
            <div className="flex-1 min-w-0">
              <div className="font-body text-[14px] font-bold text-ink truncate">
                {g.patient_name ?? "Patient"}
              </div>
              <div className="mt-0.5 font-body text-[11.5px] text-ink-soft">
                last {lastValue} mg/dL · {lastTime}
              </div>
            </div>

            {/* Sparkline */}
            <div className="shrink-0">
              <MiniSparkline readings={g.readings} />
            </div>

            {/* Badge counts */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {g.urgentCount > 0 && (
                <span className="rounded-full bg-coral px-2 py-0.5 font-body text-[11px] font-bold text-white">
                  {g.urgentCount} urgent
                </span>
              )}
              {g.routineCount > 0 && (
                <span className="rounded-full bg-mint px-2 py-0.5 font-body text-[11px] font-bold text-primary-deep">
                  {g.routineCount} routine
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

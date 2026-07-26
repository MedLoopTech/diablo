"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CohortTrendChart({ data }: { data: { date: string; avgFasting: number }[] }) {
  if (data.length < 2) {
    return <div className="py-10 text-center font-body text-[13px] text-ink-soft">Not enough data yet for a trend.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14664F" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#14664F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#DEE9E1" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#4C6A61" }} tickLine={false} axisLine={{ stroke: "#DEE9E1" }} minTickGap={24} />
        <YAxis tick={{ fontSize: 11, fill: "#4C6A61" }} tickLine={false} axisLine={false} domain={["dataMin - 10", "dataMax + 10"]} width={40} />
        <ReferenceLine y={126} stroke="#EFA63C" strokeDasharray="4 4" label={{ value: "target 126", fontSize: 10, fill: "#9A6A14", position: "insideTopRight" }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #DEE9E1", fontFamily: "var(--font-outfit)", fontSize: 12 }}
          labelStyle={{ color: "#4C6A61" }}
          formatter={(v) => [`${v} mg/dL`, "avg fasting"] as [string, string]}
        />
        <Area type="monotone" dataKey="avgFasting" stroke="#14664F" strokeWidth={2.5} fill="url(#g)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

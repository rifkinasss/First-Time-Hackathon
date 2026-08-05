"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendPoint } from "@/lib/frms-types";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><span className="tooltip-date">{label ? formatDate(label) : ""}</span>
    {payload.map((item) => <div key={item.dataKey} className="tooltip-row"><span><i style={{ background: item.color }} />{item.dataKey === "actualFR" ? "Actual FR" : "SPO target"}</span><strong>{Number(item.value).toFixed(4)} <small>l/BCM</small></strong></div>)}
  </div>;
}

export function FuelTrendChart({ data, height = 270 }: { data: TrendPoint[]; height?: number }) {
  return <div className="trend-chart" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#26333a" strokeDasharray="3 5" />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#73828a", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis tick={{ fill: "#73828a", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(value) => Number(value).toFixed(2)} width={39} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3b4b52", strokeDasharray: "3 3" }} />
        <Line type="monotone" dataKey="actualFR" stroke="#f1a33b" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#f1a33b", stroke: "#10181d", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="spoFR" stroke="#56c4a8" strokeWidth={1.7} strokeDasharray="6 5" dot={false} activeDot={{ r: 3, fill: "#56c4a8", stroke: "#10181d", strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}

export function OverviewTrendChart({ data, height = 290 }: { data: TrendPoint[]; height?: number }) {
  return <div className="trend-chart" style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#26333a" strokeDasharray="3 5" />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#73828a", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis tick={{ fill: "#73828a", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(value) => Number(value).toFixed(1)} width={34} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#3b4b52", strokeDasharray: "3 3" }} />
        <Line type="monotone" dataKey="actualFR" name="Actual FR" stroke="#f1a33b" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#f1a33b", stroke: "#10181d", strokeWidth: 2 }} />
        <Line type="monotone" dataKey="spoFR" name="SPO target" stroke="#56c4a8" strokeWidth={1.7} strokeDasharray="6 5" dot={false} activeDot={{ r: 3, fill: "#56c4a8", stroke: "#10181d", strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}

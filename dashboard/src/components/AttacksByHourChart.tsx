"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AttacksByHourProps {
  data: Record<string, number>;
}

export default function AttacksByHourChart({ data }: AttacksByHourProps) {
  const chartData = Object.entries(data).map(([hour, count]) => ({
    hour,
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />

        <XAxis
          dataKey="hour"
          stroke="#64748b"
          style={{ fontSize: "12px" }}
        />

        <YAxis
          stroke="#64748b"
          style={{ fontSize: "12px" }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.2)",
          }}
          labelStyle={{ color: "#cbd5e1" }}
          itemStyle={{ color: "#60a5fa" }}
          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
        />

        <Bar
          dataKey="count"
          fill="url(#colorGradient)"
          radius={[8, 8, 0, 0]}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />

        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

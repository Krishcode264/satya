"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AttacksByPageProps {
  data: Record<string, number>;
}

export default function AttacksByPageChart({ data }: AttacksByPageProps) {
  const chartData = Object.entries(data).map(([page, count]) => ({
    page,
    count,
  }));

  const COLORS = [
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#0ea5e9", // Light Blue
    "#22d3ee", // Bright Cyan
    "#60a5fa", // Lighter Blue
    "#2dd4bf", // Teal
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="page"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          startAngle={90}
          endAngle={-270}
          paddingAngle={2}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-in-out"
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.2)",
          }}
          labelStyle={{ color: "#cbd5e1" }}
          itemStyle={{ color: "#60a5fa" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

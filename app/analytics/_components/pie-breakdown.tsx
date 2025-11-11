"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const DEFAULT_COLORS = ["#6366f1", "#22d3ee", "#f97316", "#14b8a6", "#ec4899"];

interface PieBreakdownProps {
  data: { name: string; value: number }[];
  colors?: string[];
}

export function PieBreakdown({ data, colors = DEFAULT_COLORS }: PieBreakdownProps) {
  return (
    <div className="mt-4 flex h-64 items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${Number(value).toFixed(0)}`} contentStyle={{ borderRadius: 16 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

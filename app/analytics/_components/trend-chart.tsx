"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

interface TrendChartProps {
  data: { month: string; total: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
          <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ borderRadius: 16 }} />
          <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export interface WeeklyRevenue {
  week_label: string;
  revenue: number;
}

interface RevenueChartProps {
  data: WeeklyRevenue[];
  title?: string;
  subtitle?: string;
}

export function RevenueChart({
  data,
  title = "Revenue trend",
  subtitle = "Weekly revenue, last 12 weeks (UGX '000)"
}: RevenueChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs">
          <button className="rounded-md bg-white px-3 py-1 font-medium text-slate-900 shadow-sm">
            12w
          </button>
          <button className="rounded-md px-3 py-1 text-slate-500 hover:text-slate-700">
            6m
          </button>
          <button className="rounded-md px-3 py-1 text-slate-500 hover:text-slate-700">
            1y
          </button>
        </div>
      </div>

      <div className="min-h-[200px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="week_label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={formatValue}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "12px"
              }}
              formatter={(value) => [`UGX ${formatValue(Number(value) || 0)}`, "Revenue"]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar
              dataKey="revenue"
              fill="#1E9E5A"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

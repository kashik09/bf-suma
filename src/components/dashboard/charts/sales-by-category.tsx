"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface CategorySales {
  category_name: string;
  total_sales: number;
  percentage: number;
}

interface SalesByCategoryProps {
  data: CategorySales[];
  title?: string;
}

const COLORS = [
  "#1E9E5A", // brand green
  "#00aadb", // sky blue
  "#f48132", // earth orange
  "#f9a533", // amber
  "#ec297b", // pink
  "#8b5cf6", // purple
  "#14b8a6"  // teal
];

export function SalesByCategory({
  data,
  title = "Sales by category"
}: SalesByCategoryProps) {
  const total = data.reduce((sum, item) => sum + item.total_sales, 0);

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-[180px] w-[180px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="total_sales"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px"
                }}
                formatter={(value) => [`${Number(value || 0).toLocaleString()}`, "Sales"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">100%</span>
            <span className="text-xs text-slate-500">of sales</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {data.map((item, index) => (
            <div key={item.category_name} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600">{item.category_name}</span>
              </div>
              <span className="font-medium text-slate-900">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

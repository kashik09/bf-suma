import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: "bg-slate-50 text-slate-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
  info: "bg-sky-50 text-sky-600"
};

const trendColors = {
  positive: "text-emerald-600",
  negative: "text-rose-600"
};

export function KpiCard({
  icon,
  label,
  value,
  subtext,
  trend,
  variant = "default"
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2.5", variantStyles[variant])}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? trendColors.positive : trendColors.negative
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {subtext && (
          <p className="mt-1 text-xs text-slate-400">{subtext}</p>
        )}
      </div>
    </div>
  );
}

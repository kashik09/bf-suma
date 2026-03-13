import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantStyles = {
  default: {
    card: "bg-slate-50 border-slate-200",
    iconWrap: "bg-slate-100",
    icon: "text-slate-600",
    value: "text-slate-900"
  },
  success: {
    card: "bg-emerald-50 border-emerald-200",
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-600",
    value: "text-emerald-700"
  },
  warning: {
    card: "bg-amber-50 border-amber-200",
    iconWrap: "bg-amber-100",
    icon: "text-amber-600",
    value: "text-amber-700"
  },
  danger: {
    card: "bg-rose-50 border-rose-200",
    iconWrap: "bg-rose-100",
    icon: "text-rose-600",
    value: "text-rose-700"
  },
  info: {
    card: "bg-sky-50 border-sky-200",
    iconWrap: "bg-sky-100",
    icon: "text-sky-600",
    value: "text-sky-700"
  }
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default"
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
        styles.card
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={cn("text-2xl font-bold", styles.value)}>{value}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", styles.iconWrap)}>
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
      </div>
    </div>
  );
}

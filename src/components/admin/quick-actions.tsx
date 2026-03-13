import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

const variantStyles = {
  default: "bg-slate-50 hover:bg-slate-100 border-slate-200",
  primary: "bg-brand-50 hover:bg-brand-100 border-brand-200",
  success: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
  warning: "bg-amber-50 hover:bg-amber-100 border-amber-200"
};

const iconVariantStyles = {
  default: "text-slate-600",
  primary: "text-brand-600",
  success: "text-emerald-600",
  warning: "text-amber-600"
};

export function QuickActions({ actions, title = "Quick Actions" }: QuickActionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const variant = action.variant || "default";

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm",
                variantStyles[variant]
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconVariantStyles[variant])} />
              <div>
                <p className="text-sm font-medium text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

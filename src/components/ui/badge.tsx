import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border border-slate-200 bg-slate-100 text-slate-700",
  success: "border border-brand-200 bg-brand-50 text-brand-700",
  warning: "border border-amber-200 bg-amber-50 text-amber-700",
  danger: "border border-rose-200 bg-rose-50 text-rose-700",
  info: "border border-sky-200 bg-sky-50 text-sky-700"
};

export function Badge({
  className,
  variant = "neutral",
  children
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

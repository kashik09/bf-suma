import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  variant?: "default" | "danger";
  max?: number;
}

export function NavBadge({ count, variant = "default", max = 99 }: NavBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={cn(
        "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
        variant === "danger"
          ? "bg-rose-500 text-white"
          : "bg-brand-500 text-white"
      )}
    >
      {displayCount}
    </span>
  );
}

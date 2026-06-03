import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "brand" | "amber" | "sky" | "pink";
}

const colorStyles = {
  brand: "bg-brand-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  pink: "bg-pink-500"
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3"
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = "md",
  color = "brand"
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-slate-600">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-slate-900">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-slate-100", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

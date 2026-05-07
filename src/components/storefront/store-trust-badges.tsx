import { ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreTrustBadgesProps {
  className?: string;
  onDark?: boolean;
}

const badges = [
  { label: "Secure checkout", Icon: ShieldCheck },
  { label: "Local delivery", Icon: Truck }
];

export function StoreTrustBadges({ className, onDark = false }: StoreTrustBadgesProps) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3", className)}>
      {badges.map((badge) => (
        <li
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
            onDark
              ? "border border-white/20 bg-white/5 text-white"
              : "border border-slate-200 bg-slate-50 text-slate-700"
          )}
          key={badge.label}
        >
          <badge.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{badge.label}</span>
        </li>
      ))}
    </ul>
  );
}

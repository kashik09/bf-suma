import { cn } from "@/lib/utils";

interface StoreTrustBadgesProps {
  className?: string;
  onDark?: boolean;
}

const badges = [
  {
    label: "Secure checkout",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M12 2 4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5l-8-3Zm0 4.1 4 1.5V11c0 3.4-2 6.7-4 7.8-2-1.1-4-4.4-4-7.8V7.6l4-1.5Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    label: "7-day returns",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M12 4a8 8 0 1 0 7.8 6h-2.2A6 6 0 1 1 12 6v2l4-3-4-3v2Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    label: "Local delivery",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M3 6h12v9h2.3l2.7 2.7V19h-1a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3V6Zm2 2v9h1a2 2 0 0 1 4 0h3V8H5Zm12 2h2l2 2h-4v-2Z"
          fill="currentColor"
        />
      </svg>
    )
  }
];

export function StoreTrustBadges({ className, onDark = false }: StoreTrustBadgesProps) {
  return (
    <ul className={cn("grid gap-2 sm:grid-cols-3", className)}>
      {badges.map((badge) => (
        <li
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold",
            onDark
              ? "border border-white/20 bg-white/5 text-white"
              : "border border-slate-200 bg-slate-50 text-slate-700"
          )}
          key={badge.label}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </li>
      ))}
    </ul>
  );
}

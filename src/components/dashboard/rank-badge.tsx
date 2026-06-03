import { cn } from "@/lib/utils";

export type PartnerRank = "DISTRIBUTOR" | "SILVER" | "GOLD" | "DIAMOND";

interface RankBadgeProps {
  rank: PartnerRank;
  size?: "sm" | "md";
}

const rankStyles: Record<PartnerRank, { bg: string; text: string; label: string }> = {
  DIAMOND: {
    bg: "bg-sky-100",
    text: "text-sky-700",
    label: "Diamond"
  },
  GOLD: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Gold"
  },
  SILVER: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    label: "Silver"
  },
  DISTRIBUTOR: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Distributor"
  }
};

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const style = rankStyles[rank];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        style.bg,
        style.text,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      {style.label}
    </span>
  );
}

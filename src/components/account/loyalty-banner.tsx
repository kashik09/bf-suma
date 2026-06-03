import { Award } from "lucide-react";

interface LoyaltyBannerProps {
  firstName: string;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  points: number;
  nextTierPoints: number;
  nextTier: string;
}

const tierStyles = {
  BRONZE: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  SILVER: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  GOLD: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  PLATINUM: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" }
};

export function LoyaltyBanner({
  firstName,
  tier,
  points,
  nextTierPoints,
  nextTier
}: LoyaltyBannerProps) {
  const style = tierStyles[tier];
  const progress = Math.min((points / nextTierPoints) * 100, 100);
  const pointsRemaining = Math.max(nextTierPoints - points, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text} ${style.border} border`}>
            <Award className="h-3.5 w-3.5" />
            {tier.charAt(0) + tier.slice(1).toLowerCase()} Member
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Welcome back, {firstName}.
            </h2>
            <p className="text-sm text-slate-500">
              Here&apos;s your wellness journey at a glance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {points.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">SumaPoints</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Progress to {nextTier}</span>
          <span className="text-slate-500">
            {pointsRemaining.toLocaleString()} points away
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          <span>0</span>
          <span>{nextTierPoints.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

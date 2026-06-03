import { RankBadge, type PartnerRank } from "@/components/dashboard";
import { formatCurrency } from "@/lib/utils";
import type { PartnerLeaderboardItem, PayoutStatus } from "@/types";

interface PartnersLeaderboardProps {
  partners: PartnerLeaderboardItem[];
  limit?: number;
}

const payoutStatusStyles: Record<PayoutStatus, { bg: string; text: string; label: string }> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Pending payout"
  },
  PROCESSING: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    label: "Processing"
  },
  PAID: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Active"
  }
};

function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const style = payoutStatusStyles[status];
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

export function PartnersLeaderboard({ partners, limit = 10 }: PartnersLeaderboardProps) {
  const displayPartners = partners.slice(0, limit);

  if (displayPartners.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        No partners found. Invite partners to grow your network.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Partner
            </th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Rank
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Downline
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Volume
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Commission
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {displayPartners.map((partner) => (
            <tr key={partner.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {partner.customer_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{partner.customer_name}</p>
                    <p className="text-xs text-slate-500">
                      {partner.partner_code}
                      {partner.region ? ` · ${partner.region}` : ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <RankBadge rank={partner.rank as PartnerRank} size="sm" />
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">
                {partner.downline_count}
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                {formatCurrency(partner.total_volume, "UGX")}
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-600">
                {formatCurrency(partner.commission_earned, "UGX")}
              </td>
              <td className="px-4 py-3 text-right">
                <PayoutStatusBadge status={partner.payout_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

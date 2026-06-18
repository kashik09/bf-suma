export const dynamic = "force-dynamic";

import { Download, Plus, TrendingUp, Users, Wallet, Network } from "lucide-react";
import { PartnersLeaderboard } from "@/components/admin/partners-leaderboard";
import { KpiCard } from "@/components/dashboard";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { formatCurrency } from "@/lib/utils";
import { getPartnersLeaderboard, getPartnerStats, partnersTableExists } from "@/services/partners";

export default async function AdminPartnersPage() {
  await requireAdminSession();

  const hasPartnersTable = await partnersTableExists();

  if (!hasPartnersTable) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Partners & Distributors"
          description="Manage your BF Suma partner network, track commissions, and process payouts."
        />
        <Card className="p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Partners system not configured</h3>
          <p className="mt-2 text-sm text-slate-500">
            The partners database table needs to be created. Run the migration to enable partner management.
          </p>
          <pre className="mt-4 rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600">
            npx supabase db push
          </pre>
        </Card>
      </div>
    );
  }

  const [partnerStats, partnersLeaderboard] = await Promise.all([
    getPartnerStats(),
    getPartnersLeaderboard(20)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partners & Distributors</h1>
          <p className="text-sm text-slate-500">
            BF Suma &quot;Join Us&quot; network — sales volume, downline and commissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Payout report
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" />
            Invite partner
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Network volume (mo)"
          value={formatCurrency(partnerStats.network_volume)}
          trend={{ value: 14.2, isPositive: true }}
          variant="success"
        />
        <KpiCard
          icon={<Wallet className="h-5 w-5" />}
          label="Commissions due"
          value={formatCurrency(partnerStats.commissions_due)}
          subtext={`${partnerStats.pending_payouts} pending approval`}
          variant="warning"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Active partners"
          value={partnerStats.active_partners.toString()}
          variant="info"
        />
        <KpiCard
          icon={<Network className="h-5 w-5" />}
          label="Total downline"
          value={partnerStats.total_downline.toString()}
          subtext="across all tiers"
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="search"
              placeholder="Search partners..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">All ranks</option>
            <option value="DIAMOND">Diamond</option>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
          <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">All statuses</option>
            <option value="PAID">Active (Paid)</option>
            <option value="PENDING">Pending payout</option>
            <option value="PROCESSING">Processing</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Filter
          </button>
        </form>
      </Card>

      {/* Leaderboard Table */}
      <Card>
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Partner leaderboard</h2>
            <span className="text-xs text-slate-400">Ranked by monthly volume</span>
          </div>
        </div>
        <PartnersLeaderboard partners={partnersLeaderboard} limit={20} />
        {partnersLeaderboard.length === 0 && (
          <div className="p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No partners found matching your criteria.</p>
          </div>
        )}
      </Card>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {partnersLeaderboard.length} of {partnerStats.total_partners} partners
        </p>
        <div className="flex gap-2">
          <button
            disabled
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Previous
          </button>
          <button
            disabled
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

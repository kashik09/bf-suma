import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { PartnerLeaderboardItem, PartnerStats, PartnerRank, PayoutStatus } from "@/types";

/**
 * Get partner leaderboard ordered by total volume
 */
export async function getPartnersLeaderboard(limit = 10): Promise<PartnerLeaderboardItem[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("partners")
    .select(`
      id,
      partner_code,
      rank,
      region,
      total_volume,
      commission_earned,
      payout_status,
      customer:customers!customer_id (
        first_name,
        last_name
      )
    `)
    .order("total_volume", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching partners leaderboard:", error);
    return [];
  }

  // Get downline counts for each partner
  const partnersWithDownline = await Promise.all(
    (data || []).map(async (partner) => {
      const { count } = await supabase
        .from("partners")
        .select("*", { count: "exact", head: true })
        .eq("sponsor_id", partner.id);

      const customer = partner.customer as { first_name: string; last_name: string } | null;

      return {
        id: partner.id,
        partner_code: partner.partner_code,
        customer_name: customer
          ? `${customer.first_name} ${customer.last_name}`
          : "Unknown",
        region: partner.region,
        rank: partner.rank as PartnerRank,
        downline_count: count || 0,
        total_volume: partner.total_volume,
        commission_earned: partner.commission_earned,
        payout_status: partner.payout_status as PayoutStatus
      };
    })
  );

  return partnersWithDownline;
}

/**
 * Get aggregate partner statistics
 */
export async function getPartnerStats(): Promise<PartnerStats> {
  const supabase = createServiceRoleSupabaseClient();

  // Get total and active partners count
  const { count: totalPartners } = await supabase
    .from("partners")
    .select("*", { count: "exact", head: true });

  // Active = has volume in last 30 days (simplified: total_volume > 0)
  const { count: activePartners } = await supabase
    .from("partners")
    .select("*", { count: "exact", head: true })
    .gt("total_volume", 0);

  // Get aggregate volume and commissions
  const { data: aggregates } = await supabase
    .from("partners")
    .select("total_volume, commission_earned, payout_status");

  let networkVolume = 0;
  let commissionsDue = 0;
  let pendingPayouts = 0;

  if (aggregates) {
    for (const partner of aggregates) {
      networkVolume += partner.total_volume || 0;
      if (partner.payout_status === "PENDING") {
        commissionsDue += partner.commission_earned || 0;
        pendingPayouts++;
      }
    }
  }

  // Get total downline (all partners that have a sponsor)
  const { count: totalDownline } = await supabase
    .from("partners")
    .select("*", { count: "exact", head: true })
    .not("sponsor_id", "is", null);

  return {
    total_partners: totalPartners || 0,
    active_partners: activePartners || 0,
    network_volume: networkVolume,
    commissions_due: commissionsDue,
    pending_payouts: pendingPayouts,
    total_downline: totalDownline || 0
  };
}

/**
 * Get downline count for a specific partner
 */
export async function getDownlineCount(partnerId: string): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();

  const { count } = await supabase
    .from("partners")
    .select("*", { count: "exact", head: true })
    .eq("sponsor_id", partnerId);

  return count || 0;
}

/**
 * Check if partners table exists (for graceful degradation)
 */
export async function partnersTableExists(): Promise<boolean> {
  const supabase = createServiceRoleSupabaseClient();

  const { error } = await supabase
    .from("partners")
    .select("id", { count: "exact", head: true })
    .limit(1);

  // If table doesn't exist, error will be returned
  return !error;
}

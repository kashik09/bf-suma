import type { AnalyticsOverview } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const supabase = await createServerSupabaseClient();

  const [ordersResult, customersResult] = await Promise.all([
    supabase.from("orders").select("total", { count: "exact" }),
    supabase.from("customers").select("id", { count: "exact" })
  ]);

  const orderRows = ordersResult.data ?? [];
  const totalRevenue = orderRows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const totalOrders = ordersResult.count ?? 0;

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
    activeCustomers: customersResult.count ?? 0
  };
}

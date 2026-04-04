import { unstable_cache } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { InquiryStatus, OrderStatus } from "@/types";

interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

interface DashboardRecentBlogPost {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  slug: string;
  updatedAt: string;
}

interface DashboardRecentInquiry {
  id: string;
  name: string;
  status: InquiryStatus;
  createdAt: string;
}

interface DashboardActionItem {
  id: string;
  label: string;
  description: string;
  href: string;
  severity: "warning" | "danger" | "info";
}

interface DashboardTrend {
  value: number;
  isPositive: boolean;
}

interface DashboardCriticalAlert {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: "warning" | "danger";
}

export interface AdminDashboardSnapshot {
  kpis: {
    totalRevenue: number;
    revenueTrend: DashboardTrend | null;
    totalOrders: number;
    ordersTrend: DashboardTrend | null;
    pendingOrders: number;
    canceledOrders: number;
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalCustomers: number;
    draftBlogPosts: number;
    publishedBlogPosts: number;
    newInquiries: number;
    inProgressInquiries: number;
    failedNotifications: number;
    stalledNotifications: number;
    stuckIdempotencyKeys: number;
  };
  recentOrders: DashboardRecentOrder[];
  recentBlogPosts: DashboardRecentBlogPost[];
  recentInquiries: DashboardRecentInquiry[];
  pendingActions: DashboardActionItem[];
  criticalAlerts: DashboardCriticalAlert[];
  degraded: boolean;
  warnings: string[];
}

function hasErrorCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string | null };
  return candidate.code === code;
}

function toRoundedPercent(delta: number, base: number): number {
  if (!Number.isFinite(delta) || !Number.isFinite(base) || base <= 0) return 0;
  return Math.round((delta / base) * 100);
}

async function fetchAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const supabase = createServiceRoleSupabaseClient();
  const warnings: string[] = [];
  const nowMs = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentWindowStart = new Date(nowMs - sevenDaysMs).toISOString();
  const previousWindowStart = new Date(nowMs - sevenDaysMs * 2).toISOString();
  const stalledWindowStart = new Date(nowMs - 15 * 60 * 1000).toISOString();

  let orders: Array<{ id: string; total: number; status: OrderStatus; created_at: string }> = [];
  let recentOrders: Array<{
    id: string;
    order_number: string;
    total: number;
    status: OrderStatus;
    created_at: string;
    customer_id: string;
  }> = [];
  let products: Array<{ id: string; stock_qty: number; status: string }> = [];
  let totalCustomers = 0;
  let draftBlogPosts = 0;
  let publishedBlogPosts = 0;
  let recentBlogPosts: DashboardRecentBlogPost[] = [];
  let newInquiries = 0;
  let inProgressInquiries = 0;
  let recentInquiries: DashboardRecentInquiry[] = [];
  let failedNotifications = 0;
  let stalledNotifications = 0;
  let stuckIdempotencyKeys = 0;

  try {
    const [ordersRes, productsRes, customersRes, recentOrdersRes] = await Promise.all([
      supabase.from("orders").select("id, total, status, created_at"),
      supabase.from("products").select("id, stock_qty, status"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id, order_number, total, status, created_at, customer_id")
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (productsRes.error) throw productsRes.error;
    if (customersRes.error) throw customersRes.error;
    if (recentOrdersRes.error) throw recentOrdersRes.error;

    orders = (ordersRes.data || []) as Array<{ id: string; total: number; status: OrderStatus; created_at: string }>;
    products = (productsRes.data || []) as Array<{ id: string; stock_qty: number; status: string }>;
    totalCustomers = customersRes.count || 0;
    recentOrders = (recentOrdersRes.data || []) as Array<{
      id: string;
      order_number: string;
      total: number;
      status: OrderStatus;
      created_at: string;
      customer_id: string;
    }>;
  } catch (error) {
    warnings.push(`Core commerce metrics unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    const [draftCountRes, publishedCountRes, recentBlogRes] = await Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
      supabase
        .from("blog_posts")
        .select("id, title, status, slug, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5)
    ]);

    if (draftCountRes.error) throw draftCountRes.error;
    if (publishedCountRes.error) throw publishedCountRes.error;
    if (recentBlogRes.error) throw recentBlogRes.error;

    draftBlogPosts = draftCountRes.count || 0;
    publishedBlogPosts = publishedCountRes.count || 0;
    recentBlogPosts = (recentBlogRes.data || []).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      slug: row.slug,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    if (hasErrorCode(error, "PGRST205")) {
      warnings.push("Blog table missing in schema cache. Apply latest migrations and reload PostgREST.");
    } else {
      warnings.push(`Blog metrics unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  try {
    const [newCountRes, inProgressCountRes, recentInquiriesRes] = await Promise.all([
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "NEW"),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
      supabase
        .from("inquiries")
        .select("id, name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6)
    ]);

    if (newCountRes.error) throw newCountRes.error;
    if (inProgressCountRes.error) throw inProgressCountRes.error;
    if (recentInquiriesRes.error) throw recentInquiriesRes.error;

    newInquiries = newCountRes.count || 0;
    inProgressInquiries = inProgressCountRes.count || 0;
    recentInquiries = (recentInquiriesRes.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      createdAt: row.created_at
    }));
  } catch (error) {
    warnings.push(`Inquiry metrics unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  try {
    const [failedNotificationRes, stalledNotificationRes] = await Promise.all([
      supabase
        .from("order_notification_outbox")
        .select("id", { count: "exact", head: true })
        .eq("status", "FAILED"),
      supabase
        .from("order_notification_outbox")
        .select("id", { count: "exact", head: true })
        .in("status", ["PENDING", "PROCESSING"])
        .lt("available_at", stalledWindowStart)
    ]);

    if (failedNotificationRes.error) throw failedNotificationRes.error;
    if (stalledNotificationRes.error) throw stalledNotificationRes.error;

    failedNotifications = failedNotificationRes.count || 0;
    stalledNotifications = stalledNotificationRes.count || 0;
  } catch (error) {
    if (hasErrorCode(error, "PGRST205")) {
      warnings.push("Notification outbox table missing in schema cache. Apply latest migrations.");
    } else {
      warnings.push(`Notification queue metrics unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  try {
    const { count, error } = await supabase
      .from("order_idempotency_keys")
      .select("idempotency_key", { count: "exact", head: true })
      .eq("status", "IN_PROGRESS")
      .lt("updated_at", stalledWindowStart);

    if (error) throw error;
    stuckIdempotencyKeys = count || 0;
  } catch (error) {
    if (hasErrorCode(error, "PGRST205")) {
      warnings.push("Order idempotency table missing in schema cache. Apply latest migrations.");
    } else {
      warnings.push(`Order idempotency metrics unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const canceledOrders = orders.filter((order) => order.status === "CANCELED").length;
  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.status === "ACTIVE").length;
  const lowStockProducts = products.filter(
    (product) => product.status === "ACTIVE" && Number(product.stock_qty) > 0 && Number(product.stock_qty) <= 10
  ).length;
  const outOfStockProducts = products.filter(
    (product) => product.status === "OUT_OF_STOCK" || Number(product.stock_qty) <= 0
  ).length;

  const currentWindowOrders = orders.filter((order) => order.created_at >= currentWindowStart);
  const previousWindowOrders = orders.filter(
    (order) => order.created_at >= previousWindowStart && order.created_at < currentWindowStart
  );
  const currentWindowRevenue = currentWindowOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const previousWindowRevenue = previousWindowOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const revenueTrendValue = toRoundedPercent(currentWindowRevenue - previousWindowRevenue, previousWindowRevenue);
  const ordersTrendValue = toRoundedPercent(
    currentWindowOrders.length - previousWindowOrders.length,
    previousWindowOrders.length
  );
  const revenueTrend = previousWindowRevenue > 0
    ? { value: Math.abs(revenueTrendValue), isPositive: revenueTrendValue >= 0 }
    : null;
  const ordersTrend = previousWindowOrders.length > 0
    ? { value: Math.abs(ordersTrendValue), isPositive: ordersTrendValue >= 0 }
    : null;

  let mappedRecentOrders: DashboardRecentOrder[] = [];
  if (recentOrders.length > 0) {
    const customerIds = [...new Set(recentOrders.map((order) => order.customer_id).filter(Boolean))];
    const customerNameById = new Map<string, string>();

    if (customerIds.length > 0) {
      const { data: customerRows, error: customerError } = await supabase
        .from("customers")
        .select("id, first_name, last_name")
        .in("id", customerIds);

      if (customerError) {
        warnings.push(`Customer name lookup failed: ${customerError.message}`);
      } else {
        for (const customer of customerRows || []) {
          customerNameById.set(customer.id, `${customer.first_name} ${customer.last_name}`.trim());
        }
      }
    }

    mappedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: customerNameById.get(order.customer_id) || "Guest",
      total: Number(order.total) || 0,
      status: order.status,
      createdAt: order.created_at
    }));
  }

  const pendingActions: DashboardActionItem[] = [];
  const criticalAlerts: DashboardCriticalAlert[] = [];

  if (pendingOrders > 0) {
    pendingActions.push({
      id: "pending-orders",
      label: `${pendingOrders} pending order(s)`,
      description: "Orders are waiting for confirmation or processing.",
      href: "/admin/orders?status=PENDING",
      severity: "warning"
    });
  }

  if (lowStockProducts > 0 || outOfStockProducts > 0) {
    pendingActions.push({
      id: "stock-alerts",
      label: `${lowStockProducts + outOfStockProducts} stock alert(s)`,
      description: "Low or out-of-stock products need immediate review.",
      href: "/admin/products?status=OUT_OF_STOCK",
      severity: outOfStockProducts > 0 ? "danger" : "warning"
    });
  }

  if (draftBlogPosts > 0) {
    pendingActions.push({
      id: "blog-drafts",
      label: `${draftBlogPosts} draft blog post(s)`,
      description: "Draft posts are ready for review and publishing.",
      href: "/admin/blog?status=DRAFT",
      severity: "info"
    });
  }

  if (newInquiries > 0 || inProgressInquiries > 0) {
    pendingActions.push({
      id: "inquiry-queue",
      label: `${newInquiries + inProgressInquiries} open inquiry(ies)`,
      description: "Customer contacts need triage and follow-up.",
      href: "/admin/contacts?status=NEW",
      severity: "warning"
    });
  }

  if (failedNotifications > 0) {
    criticalAlerts.push({
      id: "failed-notifications",
      title: `${failedNotifications} failed order notification(s)`,
      description: "Order notification delivery failed. Investigate outbox and delivery integrations.",
      href: "/admin/orders",
      severity: "danger"
    });
  }

  if (stalledNotifications > 0) {
    criticalAlerts.push({
      id: "stalled-notifications",
      title: `${stalledNotifications} stalled notification job(s)`,
      description: "Notification events have been pending too long and may need replay.",
      href: "/admin/orders",
      severity: "warning"
    });
  }

  if (stuckIdempotencyKeys > 0) {
    criticalAlerts.push({
      id: "stuck-idempotency",
      title: `${stuckIdempotencyKeys} stuck idempotency key(s)`,
      description: "Checkout sessions are stuck in progress and may block customer retries.",
      href: "/admin/orders?status=PENDING",
      severity: "danger"
    });
  }

  if (canceledOrders > 0) {
    criticalAlerts.push({
      id: "canceled-orders",
      title: `${canceledOrders} canceled order(s)`,
      description: "Canceled orders may indicate fulfillment failures or checkout friction.",
      href: "/admin/orders?status=CANCELED",
      severity: canceledOrders >= 10 ? "danger" : "warning"
    });
  }

  return {
    kpis: {
      totalRevenue,
      revenueTrend,
      totalOrders,
      ordersTrend,
      pendingOrders,
      canceledOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      draftBlogPosts,
      publishedBlogPosts,
      newInquiries,
      inProgressInquiries,
      failedNotifications,
      stalledNotifications,
      stuckIdempotencyKeys
    },
    recentOrders: mappedRecentOrders,
    recentBlogPosts,
    recentInquiries,
    pendingActions,
    criticalAlerts,
    degraded: warnings.length > 0,
    warnings
  };
}

// Cache dashboard data for 10 seconds to reduce database load on refreshes
export const getAdminDashboardSnapshot = unstable_cache(
  fetchAdminDashboardSnapshot,
  ["admin-dashboard-snapshot"],
  { revalidate: 10, tags: ["admin-dashboard"] }
);

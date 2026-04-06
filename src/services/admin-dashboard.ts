import { unstable_cache } from "next/cache";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { getBlogReadiness } from "@/services/blog";
import { getStorefrontCatalogHealth } from "@/services/products";
import type { BlogPostStatus, InquiryStatus, OrderStatus } from "@/types";
import type { Database } from "@/types/database";

type TableName = keyof Database["public"]["Tables"];
type HealthStatus = "healthy" | "warning" | "critical";

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
  status: BlogPostStatus;
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

export interface DashboardSystemHealthItem {
  id: string;
  title: string;
  status: HealthStatus;
  message: string;
  actionLabel: string;
  href: string;
}

export interface DashboardDecisionItem {
  id: string;
  title: string;
  context: string;
  recommendation: string;
  href: string;
  priority: "high" | "medium" | "low";
}

export interface DashboardProductPerformanceItem {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  orderCount: number;
  attention: string | null;
  href: string;
}

export interface AdminDashboardSnapshot {
  kpis: {
    totalRevenue: number;
    revenueTrend: DashboardTrend | null;
    totalOrders: number;
    ordersTrend: DashboardTrend | null;
    ordersToday: number;
    ordersThisWeek: number;
    failedCheckoutAttempts24h: number;
    pendingOrders: number;
    canceledOrders: number;
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalCustomers: number;
    draftBlogPosts: number;
    reviewBlogPosts: number;
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
  decisions: DashboardDecisionItem[];
  systemHealth: {
    overallStatus: HealthStatus;
    checks: DashboardSystemHealthItem[];
  };
  revenueIntelligence: {
    ordersToday: number;
    ordersThisWeek: number;
    failedCheckoutAttempts24h: number;
    topProducts: DashboardProductPerformanceItem[];
    attentionNeeded: DashboardActionItem[];
  };
  degraded: boolean;
  warnings: string[];
}

interface ProductPerformanceAccumulator {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  orderIds: Set<string>;
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

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (!error || typeof error !== "object") return "Unknown error";

  const candidate = error as { message?: string; details?: string; hint?: string };
  return candidate.message || candidate.details || candidate.hint || "Unknown error";
}

function getTodayStartUtcIso(nowMs: number): string {
  const date = new Date(nowMs);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

function pushUniqueWarning(warnings: string[], value: string) {
  if (!warnings.includes(value)) {
    warnings.push(value);
  }
}

async function probeTableSchema(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  table: TableName,
  selectColumns: string
): Promise<{ status: HealthStatus; message: string }> {
  const { error } = await supabase.from(table).select(selectColumns).limit(1);

  if (!error) {
    return {
      status: "healthy",
      message: `${table} schema is available.`
    };
  }

  const message = normalizeErrorMessage(error);

  if (hasErrorCode(error, "PGRST205")) {
    return {
      status: "critical",
      message: `${table} table is missing in schema cache.`
    };
  }

  if (hasErrorCode(error, "PGRST204") || message.toLowerCase().includes("column")) {
    return {
      status: "critical",
      message: `${table} schema mismatch: ${message}`
    };
  }

  return {
    status: "warning",
    message: `${table} health probe failed: ${message}`
  };
}

function getOverallHealthStatus(checks: DashboardSystemHealthItem[]): HealthStatus {
  if (checks.some((check) => check.status === "critical")) return "critical";
  if (checks.some((check) => check.status === "warning")) return "warning";
  return "healthy";
}

async function fetchAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const supabase = createServiceRoleSupabaseClient();
  const warnings: string[] = [];
  const nowMs = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentWindowStart = new Date(nowMs - sevenDaysMs).toISOString();
  const previousWindowStart = new Date(nowMs - sevenDaysMs * 2).toISOString();
  const stalledWindowStart = new Date(nowMs - 15 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(nowMs - oneDayMs).toISOString();
  const todayStart = getTodayStartUtcIso(nowMs);

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
  let reviewBlogPosts = 0;
  let publishedBlogPosts = 0;
  let recentBlogPosts: DashboardRecentBlogPost[] = [];
  let newInquiries = 0;
  let inProgressInquiries = 0;
  let recentInquiries: DashboardRecentInquiry[] = [];
  let failedNotifications = 0;
  let stalledNotifications = 0;
  let stuckIdempotencyKeys = 0;
  let failedCheckoutAttempts24h = 0;
  let topProducts: DashboardProductPerformanceItem[] = [];

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
    pushUniqueWarning(warnings, `Core commerce metrics unavailable: ${normalizeErrorMessage(error)}`);
  }

  try {
    const [draftCountRes, reviewCountRes, publishedCountRes, recentBlogRes] = await Promise.all([
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "REVIEW"),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
      supabase
        .from("blog_posts")
        .select("id, title, status, slug, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5)
    ]);

    if (draftCountRes.error) throw draftCountRes.error;
    if (reviewCountRes.error) throw reviewCountRes.error;
    if (publishedCountRes.error) throw publishedCountRes.error;
    if (recentBlogRes.error) throw recentBlogRes.error;

    draftBlogPosts = draftCountRes.count || 0;
    reviewBlogPosts = reviewCountRes.count || 0;
    publishedBlogPosts = publishedCountRes.count || 0;
    recentBlogPosts = (recentBlogRes.data || []).map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status as BlogPostStatus,
      slug: row.slug,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    if (hasErrorCode(error, "PGRST205")) {
      pushUniqueWarning(warnings, "Blog table missing in schema cache. Apply latest migrations and reload PostgREST.");
    } else {
      pushUniqueWarning(warnings, `Blog metrics unavailable: ${normalizeErrorMessage(error)}`);
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
      status: row.status as InquiryStatus,
      createdAt: row.created_at
    }));
  } catch (error) {
    pushUniqueWarning(warnings, `Inquiry metrics unavailable: ${normalizeErrorMessage(error)}`);
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
      pushUniqueWarning(warnings, "Notification outbox table missing in schema cache. Apply latest migrations.");
    } else {
      pushUniqueWarning(warnings, `Notification queue metrics unavailable: ${normalizeErrorMessage(error)}`);
    }
  }

  try {
    const [stuckRes, failedAttemptsRes] = await Promise.all([
      supabase
        .from("order_idempotency_keys")
        .select("idempotency_key", { count: "exact", head: true })
        .eq("status", "IN_PROGRESS")
        .lt("updated_at", stalledWindowStart),
      supabase
        .from("order_idempotency_keys")
        .select("idempotency_key", { count: "exact", head: true })
        .eq("status", "FAILED")
        .gte("updated_at", oneDayAgo)
    ]);

    if (stuckRes.error) throw stuckRes.error;
    if (failedAttemptsRes.error) throw failedAttemptsRes.error;

    stuckIdempotencyKeys = stuckRes.count || 0;
    failedCheckoutAttempts24h = failedAttemptsRes.count || 0;
  } catch (error) {
    if (hasErrorCode(error, "PGRST205")) {
      pushUniqueWarning(warnings, "Order idempotency table missing in schema cache. Apply latest migrations.");
    } else {
      pushUniqueWarning(warnings, `Order idempotency metrics unavailable: ${normalizeErrorMessage(error)}`);
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const canceledOrders = orders.filter((order) => order.status === "CANCELED").length;
  const ordersToday = orders.filter((order) => order.created_at >= todayStart).length;
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
  const ordersThisWeek = currentWindowOrders.length;
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
        pushUniqueWarning(warnings, `Customer name lookup failed: ${customerError.message}`);
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

  const productInventoryById = new Map(products.map((product) => [product.id, product]));
  const weeklyOrderIds = currentWindowOrders
    .filter((order) => order.status !== "CANCELED")
    .map((order) => order.id);

  if (weeklyOrderIds.length > 0) {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("order_id, product_id, product_name_snapshot, quantity, line_total")
      .in("order_id", weeklyOrderIds);

    if (orderItemsError) {
      pushUniqueWarning(warnings, `Product performance metrics unavailable: ${orderItemsError.message}`);
    } else {
      const aggregates = new Map<string, ProductPerformanceAccumulator>();

      (orderItems || []).forEach((row) => {
        const productId = String(row.product_id);
        const current = aggregates.get(productId) || {
          productId,
          productName: (row.product_name_snapshot || productId).toString(),
          unitsSold: 0,
          revenue: 0,
          orderIds: new Set<string>()
        };

        current.unitsSold += Math.round(Number(row.quantity) || 0);
        current.revenue += Math.round(Number(row.line_total) || 0);
        current.orderIds.add(String(row.order_id));

        aggregates.set(productId, current);
      });

      topProducts = [...aggregates.values()]
        .map((entry) => {
          const inventory = productInventoryById.get(entry.productId);
          let attention: string | null = null;

          if (inventory) {
            if (inventory.status === "OUT_OF_STOCK" || Number(inventory.stock_qty) <= 0) {
              attention = "Top seller is out of stock. Restock immediately.";
            } else if (Number(inventory.stock_qty) <= 10 && entry.unitsSold >= 5) {
              attention = "Fast-moving product with low stock. Plan replenishment.";
            }
          }

          return {
            productId: entry.productId,
            productName: entry.productName,
            unitsSold: entry.unitsSold,
            revenue: entry.revenue,
            orderCount: entry.orderIds.size,
            attention,
            href: `/admin/products/${entry.productId}`
          };
        })
        .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
        .slice(0, 5);
    }
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
      description: "Draft posts need editorial review preparation.",
      href: "/admin/blog?status=DRAFT",
      severity: "info"
    });
  }

  if (reviewBlogPosts > 0) {
    pendingActions.push({
      id: "blog-review",
      label: `${reviewBlogPosts} blog post(s) in review`,
      description: "Posts are ready for final QA and publishing decisions.",
      href: "/admin/blog?status=REVIEW",
      severity: "warning"
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

  if (failedCheckoutAttempts24h > 0) {
    criticalAlerts.push({
      id: "failed-checkout-attempts",
      title: `${failedCheckoutAttempts24h} failed checkout attempt(s) in 24h`,
      description: "Retry failures can indicate payment or inventory friction. Review order pipeline now.",
      href: "/admin/orders",
      severity: failedCheckoutAttempts24h >= 5 ? "danger" : "warning"
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

  const systemHealthChecks: DashboardSystemHealthItem[] = [];

  const criticalEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  const missingCriticalEnv = criticalEnvVars.filter((name) => !process.env[name] || process.env[name]?.trim() === "");

  if (missingCriticalEnv.length > 0) {
    systemHealthChecks.push({
      id: "env-critical",
      title: "Critical Environment Config",
      status: "critical",
      message: `Missing env vars: ${missingCriticalEnv.join(", ")}`,
      actionLabel: "Fix Environment",
      href: "/admin"
    });
  } else {
    systemHealthChecks.push({
      id: "env-critical",
      title: "Critical Environment Config",
      status: "healthy",
      message: "Core Supabase environment variables are configured.",
      actionLabel: "Inspect",
      href: "/admin"
    });
  }

  if (!process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET.trim() === "") {
    systemHealthChecks.push({
      id: "env-admin-secret",
      title: "Admin Session Secret",
      status: "warning",
      message: "ADMIN_SESSION_SECRET is missing. Session signing falls back to service role key.",
      actionLabel: "Harden",
      href: "/admin"
    });
  } else {
    systemHealthChecks.push({
      id: "env-admin-secret",
      title: "Admin Session Secret",
      status: "healthy",
      message: "Dedicated admin session secret is configured.",
      actionLabel: "Inspect",
      href: "/admin"
    });
  }

  if (process.env.NEWSLETTER_WELCOME_EMAIL_ENABLED !== "false") {
    const missingNewsletterVars = ["RESEND_API_KEY", "RESEND_FROM_EMAIL"].filter(
      (name) => !process.env[name] || process.env[name]?.trim() === ""
    );

    systemHealthChecks.push({
      id: "env-newsletter",
      title: "Newsletter Delivery Config",
      status: missingNewsletterVars.length > 0 ? "warning" : "healthy",
      message: missingNewsletterVars.length > 0
        ? `Missing email env vars: ${missingNewsletterVars.join(", ")}`
        : "Newsletter email config is ready.",
      actionLabel: "Review",
      href: "/admin"
    });
  }

  const tableChecks = await Promise.all([
    probeTableSchema(supabase, "orders", "id, total, status"),
    probeTableSchema(supabase, "products", "id, stock_qty, status"),
    probeTableSchema(supabase, "order_items", "id, order_id, product_id"),
    probeTableSchema(supabase, "order_idempotency_keys", "idempotency_key, status, updated_at"),
    probeTableSchema(supabase, "order_notification_outbox", "id, status, available_at"),
    probeTableSchema(supabase, "blog_posts", "id, status, internal_tags, channel_targets"),
    probeTableSchema(supabase, "inquiries", "id, status"),
    probeTableSchema(supabase, "admin_users", "id, role, is_active")
  ]);

  const tableTitles = [
    "Orders Table",
    "Products Table",
    "Order Items Table",
    "Idempotency Table",
    "Notification Outbox Table",
    "Blog Table",
    "Inquiry Table",
    "Admin Users Table"
  ];

  const tableHrefs = [
    "/admin/orders",
    "/admin/products",
    "/admin/orders",
    "/admin/orders",
    "/admin/orders",
    "/admin/blog",
    "/admin/contacts",
    "/admin"
  ];

  tableChecks.forEach((result, index) => {
    systemHealthChecks.push({
      id: `table-${index}`,
      title: tableTitles[index],
      status: result.status,
      message: result.message,
      actionLabel: "Open",
      href: tableHrefs[index]
    });
  });

  try {
    const catalogHealth = await getStorefrontCatalogHealth();
    if (!catalogHealth.commerceReady) {
      systemHealthChecks.push({
        id: "api-commerce",
        title: "Commerce API State",
        status: "critical",
        message: catalogHealth.degradedReason || "Commerce catalog is in fallback mode.",
        actionLabel: "Review Catalog",
        href: "/admin/products"
      });
    } else {
      systemHealthChecks.push({
        id: "api-commerce",
        title: "Commerce API State",
        status: "healthy",
        message: "Live inventory and checkout data services are healthy.",
        actionLabel: "Open Store",
        href: "/shop"
      });
    }
  } catch (error) {
    systemHealthChecks.push({
      id: "api-commerce",
      title: "Commerce API State",
      status: "critical",
      message: `Commerce health probe failed: ${normalizeErrorMessage(error)}`,
      actionLabel: "Investigate",
      href: "/admin/products"
    });
  }

  try {
    const readiness = await getBlogReadiness();
    systemHealthChecks.push({
      id: "api-blog",
      title: "Blog API State",
      status: readiness.ready ? "healthy" : "warning",
      message: readiness.ready
        ? "Blog publish pipeline is available."
        : (readiness.message || "Blog pipeline is degraded."),
      actionLabel: "Open Blog",
      href: "/admin/blog"
    });
  } catch (error) {
    systemHealthChecks.push({
      id: "api-blog",
      title: "Blog API State",
      status: "warning",
      message: `Blog readiness probe failed: ${normalizeErrorMessage(error)}`,
      actionLabel: "Open Blog",
      href: "/admin/blog"
    });
  }

  systemHealthChecks.push({
    id: "ops-order-pipeline",
    title: "Order Pipeline Operations",
    status: failedNotifications > 0 || stalledNotifications > 0 || stuckIdempotencyKeys > 0 ? "warning" : "healthy",
    message:
      failedNotifications > 0 || stalledNotifications > 0 || stuckIdempotencyKeys > 0
        ? `${failedNotifications} failed notifications, ${stalledNotifications} stalled jobs, ${stuckIdempotencyKeys} stuck idempotency key(s).`
        : "Order pipeline queues are clear.",
    actionLabel: "Open Orders",
    href: "/admin/orders"
  });

  systemHealthChecks
    .filter((check) => check.status !== "healthy")
    .forEach((check) => pushUniqueWarning(warnings, `${check.title}: ${check.message}`));

  const overallHealthStatus = getOverallHealthStatus(systemHealthChecks);

  const revenueAttention: DashboardActionItem[] = [];
  if (failedCheckoutAttempts24h > 0) {
    revenueAttention.push({
      id: "revenue-failed-checkouts",
      label: `${failedCheckoutAttempts24h} failed checkout attempts in 24h`,
      description: "Investigate recent failures to prevent lost orders.",
      href: "/admin/orders",
      severity: failedCheckoutAttempts24h >= 5 ? "danger" : "warning"
    });
  }

  const topProductAttention = topProducts.find((item) => item.attention);
  if (topProductAttention) {
    revenueAttention.push({
      id: "revenue-top-product-attention",
      label: topProductAttention.productName,
      description: topProductAttention.attention || "Top product needs review.",
      href: topProductAttention.href,
      severity: "warning"
    });
  }

  if (ordersToday === 0) {
    revenueAttention.push({
      id: "revenue-orders-today-zero",
      label: "No confirmed order volume today",
      description: "Run a quick campaign or publish conversion-focused content now.",
      href: "/admin/blog/new",
      severity: "info"
    });
  }

  const decisions: DashboardDecisionItem[] = [];

  if (failedCheckoutAttempts24h > 0) {
    decisions.push({
      id: "decision-checkout-reliability",
      title: "Stabilize checkout conversion",
      context: `${failedCheckoutAttempts24h} failed checkout attempt(s) were recorded in the last 24 hours.`,
      recommendation: "Review failure causes, clear stuck idempotency sessions, and verify inventory/notification dependencies.",
      href: "/admin/orders",
      priority: "high"
    });
  }

  if (outOfStockProducts > 0) {
    decisions.push({
      id: "decision-restock",
      title: "Protect revenue from stockouts",
      context: `${outOfStockProducts} product(s) are out of stock.`,
      recommendation: "Restock best-performing items first and archive dead SKUs to reduce failed purchase attempts.",
      href: "/admin/products?status=OUT_OF_STOCK",
      priority: "high"
    });
  }

  if (reviewBlogPosts > 0) {
    decisions.push({
      id: "decision-publish-review-queue",
      title: "Move review queue to revenue",
      context: `${reviewBlogPosts} post(s) are waiting in review state.`,
      recommendation: "Finalize QA and publish channel-ready posts to support acquisition and retention.",
      href: "/admin/blog?status=REVIEW",
      priority: "medium"
    });
  }

  if (pendingOrders > 0) {
    decisions.push({
      id: "decision-order-queue",
      title: "Reduce pending fulfillment lag",
      context: `${pendingOrders} order(s) are pending.`,
      recommendation: "Prioritize oldest pending orders and confirm customer delivery details.",
      href: "/admin/orders?status=PENDING",
      priority: "medium"
    });
  }

  if (decisions.length === 0) {
    decisions.push({
      id: "decision-stable",
      title: "System stable",
      context: "No urgent operational risks detected from current telemetry.",
      recommendation: "Focus on growth actions: publish a new conversion post or launch a targeted product push.",
      href: "/admin/blog/new",
      priority: "low"
    });
  }

  return {
    kpis: {
      totalRevenue,
      revenueTrend,
      totalOrders,
      ordersTrend,
      ordersToday,
      ordersThisWeek,
      failedCheckoutAttempts24h,
      pendingOrders,
      canceledOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      draftBlogPosts,
      reviewBlogPosts,
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
    decisions,
    systemHealth: {
      overallStatus: overallHealthStatus,
      checks: systemHealthChecks
    },
    revenueIntelligence: {
      ordersToday,
      ordersThisWeek,
      failedCheckoutAttempts24h,
      topProducts,
      attentionNeeded: revenueAttention
    },
    degraded: warnings.length > 0 || overallHealthStatus !== "healthy",
    warnings
  };
}

// Cache dashboard data for 10 seconds to reduce database load on refreshes
export const getAdminDashboardSnapshot = unstable_cache(
  fetchAdminDashboardSnapshot,
  ["admin-dashboard-snapshot"],
  { revalidate: 10, tags: ["admin-dashboard"] }
);

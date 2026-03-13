import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Truck,
  Settings
} from "lucide-react";
import { SectionHeader } from "@/components/ui";
import { StatsCard, QuickActions, RecentOrders } from "@/components/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

async function getDashboardStats() {
  try {
    const supabase = await createServerSupabaseClient();

    const [ordersRes, productsRes, customersRes, recentOrdersRes] = await Promise.all([
      supabase.from("orders").select("id, total, status", { count: "exact" }),
      supabase.from("products").select("id, stock_qty, status", { count: "exact" }),
      supabase.from("customers").select("id", { count: "exact" }),
      supabase
        .from("orders")
        .select("id, order_number, total, status, created_at, customer_id")
        .order("created_at", { ascending: false })
        .limit(5)
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const totalCustomers = customersRes.count || 0;
    const recentOrders = recentOrdersRes.data || [];

    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalOrders = ordersRes.count || 0;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;
    const totalProducts = productsRes.count || 0;
    const lowStockProducts = products.filter(
      (p) => p.status === "ACTIVE" && (p.stock_qty || 0) <= 10
    ).length;
    const outOfStockProducts = products.filter(
      (p) => p.status === "OUT_OF_STOCK" || (p.stock_qty || 0) <= 0
    ).length;

    // Get customer names for recent orders
    const customerIds = [...new Set(recentOrders.map((o) => o.customer_id).filter(Boolean))];
    let customerNames: Record<string, string> = {};

    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from("customers")
        .select("id, first_name, last_name")
        .in("id", customerIds);

      customerNames = (customers || []).reduce(
        (acc, c) => ({
          ...acc,
          [c.id]: `${c.first_name} ${c.last_name}`.trim()
        }),
        {}
      );
    }

    const formattedOrders = recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: customerNames[o.customer_id] || "Guest",
      total: Number(o.total) || 0,
      status: o.status,
      createdAt: o.created_at
    }));

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
      recentOrders: formattedOrders
    };
  } catch {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalCustomers: 0,
      recentOrders: []
    };
  }
}

const quickActions = [
  {
    href: "/admin/products/new",
    label: "Add Product",
    description: "Create a new product listing",
    icon: Plus,
    variant: "primary" as const
  },
  {
    href: "/admin/orders",
    label: "View Orders",
    description: "Manage customer orders",
    icon: Eye,
    variant: "default" as const
  },
  {
    href: "/admin/drivers",
    label: "Manage Drivers",
    description: "Assign delivery drivers",
    icon: Truck,
    variant: "default" as const
  },
  {
    href: "/admin/settings",
    label: "Settings",
    description: "Configure store settings",
    icon: Settings,
    variant: "default" as const
  }
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard"
        description="Overview of your store performance and recent activity."
      />

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          description="Lifetime earnings"
          icon={DollarSign}
          variant="success"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          description={`${stats.pendingOrders} pending`}
          icon={ShoppingBag}
          variant={stats.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatsCard
          title="Products"
          value={stats.totalProducts}
          description={
            stats.lowStockProducts > 0
              ? `${stats.lowStockProducts} low stock`
              : "All stocked"
          }
          icon={Package}
          variant={stats.outOfStockProducts > 0 ? "danger" : "default"}
        />
        <StatsCard
          title="Customers"
          value={stats.totalCustomers}
          description="Registered users"
          icon={Users}
          variant="info"
        />
      </div>

      {/* Stock Alerts - only show if issues */}
      {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.lowStockProducts > 0 && (
            <StatsCard
              title="Low Stock Alert"
              value={stats.lowStockProducts}
              description="Products running low"
              icon={TrendingDown}
              variant="warning"
            />
          )}
          {stats.outOfStockProducts > 0 && (
            <StatsCard
              title="Out of Stock"
              value={stats.outOfStockProducts}
              description="Products unavailable"
              icon={TrendingDown}
              variant="danger"
            />
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrders orders={stats.recentOrders} />
        </div>
        <div>
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}

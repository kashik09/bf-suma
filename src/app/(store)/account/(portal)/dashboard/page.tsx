import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Package,
  RefreshCw,
  Target
} from "lucide-react";
import { LoyaltyBanner, OrderTrackerCard, WellnessGoalsCard } from "@/components/account";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { getCustomerDashboardSnapshot } from "@/services/customer-account";

export const dynamic = "force-dynamic";

// Mock wellness goals - would come from database
const mockWellnessGoals = [
  { id: "1", name: "Daily vitamins", progress: 5, target: 7, unit: "days" },
  { id: "2", name: "Water intake", progress: 6, target: 8, unit: "glasses" },
  { id: "3", name: "Exercise", progress: 3, target: 5, unit: "sessions" }
];

export default async function AccountDashboardPage() {
  const user = await requireCustomerUser();
  const snapshot = await getCustomerDashboardSnapshot(user.email);

  const firstName = snapshot?.customer.first_name || user.firstName || "there";
  const recentOrders = snapshot?.recentOrders || [];
  const statusCounts = snapshot?.statusCounts || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0
  };

  const activeOrdersCount = statusCounts.pending + statusCounts.confirmed + statusCounts.processing + statusCounts.outForDelivery;
  const latestActiveOrder = recentOrders.find(
    (o) => !["DELIVERED", "CANCELED"].includes(o.status)
  );

  // Mock loyalty data - would come from database
  const loyaltyData = {
    tier: "GOLD" as const,
    points: 1840,
    nextTierPoints: 2500,
    nextTier: "Platinum"
  };

  const quickStats = [
    {
      label: "Active goals",
      value: mockWellnessGoals.length,
      icon: Target,
      href: "/account/wellness",
      color: "bg-brand-100 text-brand-600"
    },
    {
      label: "Auto-refills",
      value: 2,
      icon: RefreshCw,
      href: "/account/refills",
      color: "bg-sky-100 text-sky-600"
    },
    {
      label: "Wishlist",
      value: 5,
      subtext: "2 back in stock",
      icon: Heart,
      href: "/account/wishlist",
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Loyalty Banner */}
      <LoyaltyBanner
        firstName={firstName}
        tier={loyaltyData.tier}
        points={loyaltyData.points}
        nextTierPoints={loyaltyData.nextTierPoints}
        nextTier={loyaltyData.nextTier}
      />

      {/* Active Order Tracker */}
      {latestActiveOrder && (
        <OrderTrackerCard
          orderNumber={latestActiveOrder.order_number}
          orderId={latestActiveOrder.id}
          status={latestActiveOrder.status as "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED"}
          estimatedDelivery="Today, by 6:00 PM"
          itemCount={latestActiveOrder.item_count}
        />
      )}

      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
                {stat.subtext && (
                  <p className="text-[10px] text-brand-600">{stat.subtext}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wellness Goals */}
        <WellnessGoalsCard goals={mockWellnessGoals} streak={7} />

        {/* Recommended Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recommended for you</h3>
            <Link
              href="/shop"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {/* Mock product recommendations */}
            {[
              { name: "Reishi Mushroom Extract", price: "UGX 85,000", reason: "Based on your goals" },
              { name: "Omega-3 Fish Oil", price: "UGX 65,000", reason: "Frequently bought" },
              { name: "Vitamin D3 Drops", price: "UGX 45,000", reason: "Low stock alert" }
            ].map((product) => (
              <div
                key={product.name}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-slate-200" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{product.price}</p>
                  <button className="mt-1 text-xs font-medium text-brand-600 hover:underline">
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Package className="h-4 w-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Recent orders</h3>
          </div>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No orders yet</p>
            <Link
              href="/shop"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between py-3 transition hover:bg-slate-50 -mx-2 px-2 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">#{order.order_number}</p>
                  <p className="text-xs text-slate-500">
                    {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    UGX {(order.total / 100).toLocaleString()}
                  </p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-700"
                      : order.status === "CANCELED"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

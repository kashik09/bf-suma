import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Heart,
  Package,
  RefreshCw
} from "lucide-react";
import { OrderTrackerCard } from "@/components/account";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { getCustomerDashboardSnapshot } from "@/services/customer-account";
import { listStorefrontProducts } from "@/services/products";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const user = await requireCustomerUser();
  const [snapshot, products] = await Promise.all([
    getCustomerDashboardSnapshot(user.email),
    listStorefrontProducts({ sort: "featured" })
  ]);
  const recommendedProducts = products.slice(0, 3);

  const firstName = snapshot?.customer.first_name || user.firstName || "there";
  const recentOrders = snapshot?.recentOrders || [];
  const wishlistCount = snapshot?.wishlistCount || 0;
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

  const quickStats = [
    {
      label: "Active orders",
      value: activeOrdersCount,
      icon: Package,
      href: "/account/orders",
      color: "bg-brand-100 text-brand-600"
    },
    {
      label: "Auto-refills",
      value: 0,
      icon: RefreshCw,
      href: "/account/refills",
      color: "bg-sky-100 text-sky-600"
    },
    {
      label: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      href: "/account/wishlist",
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Welcome back, {firstName}.</h1>
        <p className="text-sm text-slate-500">Here&apos;s your account overview.</p>
      </div>

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
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
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
            {recommendedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:bg-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-200">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category_name || "Popular choice"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    UGX {product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

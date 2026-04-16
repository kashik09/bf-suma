import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  User
} from "lucide-react";
import { AccountAmount } from "@/components/storefront/account-amount";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { getCustomerDashboardSnapshot } from "@/services/customer-account";

export const dynamic = "force-dynamic";

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium"
  }).format(new Date(dateIso));
}

function statusBadgeClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-100 text-emerald-800";
  if (status === "CANCELED") return "bg-rose-100 text-rose-800";
  if (status === "OUT_FOR_DELIVERY" || status === "SHIPPED") return "bg-sky-100 text-sky-800";
  if (status === "CONFIRMED") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

const quickActions = [
  {
    title: "Order History",
    description: "Track status and view order details.",
    href: "/account/orders",
    icon: ShoppingBag,
    actionLabel: "View orders"
  },
  {
    title: "My Profile",
    description: "Update your name, email, and phone.",
    href: "/account/profile",
    icon: User,
    actionLabel: "Edit profile"
  },
  {
    title: "Browse Shop",
    description: "Discover wellness products for you.",
    href: "/shop",
    icon: Package,
    actionLabel: "Shop now"
  },
  {
    title: "Wishlist",
    description: "Save products to buy later.",
    href: "/shop",
    icon: Heart,
    actionLabel: "Coming soon"
  }
];

export default async function AccountDashboardPage() {
  const user = await requireCustomerUser();
  const snapshot = await getCustomerDashboardSnapshot(user.email);

  const totalOrders = snapshot?.totalOrders || 0;
  const totalSpent = snapshot?.totalSpent || 0;
  const orderCurrency = snapshot?.recentOrders[0]?.currency || "UGX";
  const recentOrders = snapshot?.recentOrders || [];
  const firstName = snapshot?.customer.first_name || user.firstName || "there";
  const statusCounts = snapshot?.statusCounts || {
    pending: 0,
    confirmed: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0
  };

  const inProgressCount = statusCounts.confirmed + statusCounts.processing + statusCounts.outForDelivery;
  const latestOrder = recentOrders[0];
  const latestOrderDate = latestOrder ? formatDate(latestOrder.created_at) : "No orders yet";

  const snapshotCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      accentClass: ""
    },
    {
      title: "Pending",
      value: statusCounts.pending,
      icon: Clock3,
      accentClass: "border-l-4 border-l-amber-400"
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: Truck,
      accentClass: "border-l-4 border-l-sky-400"
    },
    {
      title: "Delivered",
      value: statusCounts.delivered,
      icon: CheckCircle2,
      accentClass: "border-l-4 border-l-emerald-400"
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-slate-600">
                  Track your orders, activity, and account from one place.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                <ShoppingBag className="h-3.5 w-3.5" />
                {totalOrders} orders
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                Total spent: <AccountAmount amountMinor={totalSpent} currency={orderCurrency} />
              </span>
              {inProgressCount > 0 && (
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                  {inProgressCount} in progress
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Latest Order
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{latestOrderDate}</p>
            {latestOrder && (
              <p className="mt-0.5 text-sm text-slate-600">#{latestOrder.order_number}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                href="/account/orders"
              >
                Open orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Order Snapshot Cards */}
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Order Snapshot
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {snapshotCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`rounded-xl border border-slate-200 bg-white p-4 shadow-soft ${card.accentClass}`}
              >
                <div className="mb-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href + item.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
              >
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                <Link
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  href={item.href}
                >
                  {item.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Orders + Tips */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent Orders
            </p>
            <Link
              className="text-sm font-medium text-brand-600 hover:underline"
              href="/account/orders"
            >
              View all
            </Link>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
                <p className="text-sm text-slate-600">
                  No orders yet. Your purchases will appear here.
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  href="/shop"
                >
                  Start shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
                    href={`/account/orders/${order.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">#{order.order_number}</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDate(order.created_at)} · {order.item_count} items
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand-600">
                      <AccountAmount amountMinor={order.total} currency={order.currency} />
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Account Activity
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="space-y-3">
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Total orders</p>
                      <p className="text-xs text-slate-500">View history</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{totalOrders}</p>
                </Link>

                <Link
                  href="/account/profile"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Profile</p>
                      <p className="text-xs text-slate-500">Update details</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Delivery Tips
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="text-sm text-slate-600">
                  Keep your phone number updated so couriers can reach you quickly for deliveries.
                </p>
              </div>
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Update your <span className="font-medium text-slate-900">Profile</span> to ensure
                fast, hassle-free delivery.
              </div>
              <Link
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                href="/account/profile"
              >
                Update profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

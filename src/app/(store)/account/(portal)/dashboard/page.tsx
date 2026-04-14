import Link from "next/link";
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
  if (status === "OUT_FOR_DELIVERY") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default async function AccountDashboardPage() {
  const user = await requireCustomerUser();
  const snapshot = await getCustomerDashboardSnapshot(user.email);

  const totalOrders = snapshot?.totalOrders || 0;
  const totalSpent = snapshot?.totalSpent || 0;
  const orderCurrency = snapshot?.recentOrders[0]?.currency || "KES";
  const recentOrders = snapshot?.recentOrders || [];
  const firstName = snapshot?.customer.first_name || user.firstName || "Customer";

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-600">Here is a quick overview of your orders and spending.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Total orders</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Total spent</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            <AccountAmount amountMinor={totalSpent} currency={orderCurrency} />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
          <div className="flex items-center gap-2 text-sm">
            <Link className="font-semibold text-brand-700 hover:underline" href="/account/orders">
              View all orders
            </Link>
            <Link className="font-semibold text-brand-700 hover:underline" href="/account/profile">
              Update profile
            </Link>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-600">No orders yet. Explore the shop to place your first order.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                href={`/account/orders/${order.id}`}
                key={order.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">#{order.order_number}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                    {order.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{formatDate(order.created_at)} • {order.item_count} items</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  <AccountAmount amountMinor={order.total} currency={order.currency} />
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

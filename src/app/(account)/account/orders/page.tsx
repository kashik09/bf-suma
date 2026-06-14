import Link from "next/link";
import { AccountAmount } from "@/components/storefront/account-amount";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { listCustomerOrdersByEmail } from "@/services/customer-account";

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

export default async function AccountOrdersPage() {
  const user = await requireCustomerUser();
  const orders = await listCustomerOrdersByEmail(user.email);

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Order History</h1>
        <p className="mt-1 text-sm text-slate-600">View all your orders, statuses, and totals in one place.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-600">No orders found for this account yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
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
                <p className="mt-1 text-sm text-slate-600">{formatDate(order.created_at)}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{order.item_count} items</span>
                  <span className="font-semibold text-slate-900">
                    <AccountAmount amountMinor={order.total} currency={order.currency} />
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

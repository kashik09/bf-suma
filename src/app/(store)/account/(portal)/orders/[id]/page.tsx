import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountAmount } from "@/components/storefront/account-amount";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { getCustomerOrderDetailByEmail } from "@/services/customer-account";

export const dynamic = "force-dynamic";

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateIso));
}

function statusBadgeClass(status: string) {
  if (status === "DELIVERED") return "bg-emerald-100 text-emerald-800";
  if (status === "CANCELED") return "bg-rose-100 text-rose-800";
  if (status === "OUT_FOR_DELIVERY") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

export default async function AccountOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCustomerUser();
  const detail = await getCustomerOrderDetailByEmail(user.email, id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Order #{detail.order.order_number}</h1>
            <p className="mt-1 text-sm text-slate-600">{formatDate(detail.order.created_at)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(detail.order.status)}`}>
            {detail.order.status.replaceAll("_", " ")}
          </span>
        </div>
        <Link className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline" href="/account/orders">
          Back to orders
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Items</h2>
        <div className="mt-3 space-y-3">
          {detail.items.map((item) => (
            <div className="rounded-xl border border-slate-200 p-3" key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-slate-900">{item.product_name_snapshot}</p>
                <p className="text-sm font-semibold text-slate-900">
                  <AccountAmount amountMinor={item.line_total} currency={item.currency} />
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Qty {item.quantity} • Unit <AccountAmount amountMinor={item.unit_price} currency={item.currency} />
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Delivery</h2>
        <p className="mt-2 text-sm text-slate-700">{detail.order.delivery_address}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Order totals</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-semibold text-slate-900">
              <AccountAmount amountMinor={detail.order.subtotal} currency={detail.order.currency} />
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-600">Delivery fee</dt>
            <dd className="font-semibold text-slate-900">
              <AccountAmount amountMinor={detail.order.delivery_fee} currency={detail.order.currency} />
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <dt className="font-semibold text-slate-900">Total</dt>
            <dd className="font-semibold text-slate-900">
              <AccountAmount amountMinor={detail.order.total} currency={detail.order.currency} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

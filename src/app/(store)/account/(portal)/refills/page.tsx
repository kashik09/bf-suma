import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, Calendar, Package } from "lucide-react";
import { requireCustomerUser } from "@/lib/auth/customer-server";

export const dynamic = "force-dynamic";

// Mock auto-refill subscriptions
const mockRefills = [
  {
    id: "1",
    productName: "Reishi Mushroom Extract",
    quantity: 2,
    frequency: "Monthly",
    nextDelivery: "Jun 15, 2026",
    price: 170000,
    status: "active"
  },
  {
    id: "2",
    productName: "Omega-3 Fish Oil",
    quantity: 1,
    frequency: "Every 2 months",
    nextDelivery: "Jul 1, 2026",
    price: 65000,
    status: "active"
  }
];

export default async function RefillsPage() {
  await requireCustomerUser();

  const totalMonthly = mockRefills.reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/account/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reorder & Refills</h1>
            <p className="text-sm text-slate-500">Manage your automatic refill subscriptions</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          Add refill
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <RefreshCw className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{mockRefills.length}</p>
              <p className="text-xs text-slate-500">Active subscriptions</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
              <Package className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                UGX {totalMonthly.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Est. monthly spend</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refills List */}
      {mockRefills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No auto-refills yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Set up automatic refills for your favorite products and never run out.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Your subscriptions</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {mockRefills.map((refill) => (
              <div key={refill.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-slate-100" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{refill.productName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {refill.quantity} · {refill.frequency}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        Next delivery: {refill.nextDelivery}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      UGX {refill.price.toLocaleString()}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
                        Edit
                      </button>
                      <button className="text-xs font-medium text-rose-600 hover:text-rose-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
        <p className="text-sm text-brand-800">
          <strong>Save 10%</strong> on all auto-refill orders. Plus, skip or reschedule anytime.
        </p>
      </div>
    </div>
  );
}

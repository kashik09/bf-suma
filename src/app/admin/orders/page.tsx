import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { formatCurrency } from "@/lib/utils";
import { listOrdersForAdmin } from "@/services/orders";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default async function AdminOrdersPage() {
  await requireAdminSession();

  try {
    const data = await listOrdersForAdmin({ page: 1, pageSize: 50 });

    return (
      <div className="space-y-6">
        <SectionHeader
          title="Orders"
          description={`Showing ${data.orders.length} of ${data.totalCount} orders.`}
        />

        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Units</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.orders.map((entry) => (
                <tr className="text-sm text-slate-700" key={entry.order.id}>
                  <td className="px-4 py-3">
                    <Link
                      className="font-semibold text-brand-700 hover:text-brand-800"
                      href={`/admin/orders/${entry.order.id}`}
                    >
                      {entry.order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {entry.customer ? `${entry.customer.first_name} ${entry.customer.last_name}`.trim() : "Unknown customer"}
                  </td>
                  <td className="px-4 py-3">{formatStatus(entry.order.status)}</td>
                  <td className="px-4 py-3 text-right">{entry.totalUnits}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(entry.order.total, entry.order.currency)}</td>
                  <td className="px-4 py-3">{formatDateTime(entry.order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  } catch {
    return (
      <div className="space-y-6">
        <SectionHeader title="Orders" description="Unable to load orders right now." />
        <Card>
          <p className="text-sm text-slate-700">Order data is temporarily unavailable. Try again shortly.</p>
        </Card>
      </div>
    );
  }
}

import Link from "next/link";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { listOrdersForAdmin } from "@/services/orders";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

const STATUS_VARIANTS: Record<OrderStatus, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  CANCELED: "danger"
};

type OrdersSearchParams = Promise<{
  search?: string;
  status?: OrderStatus | "all";
  page?: string;
}>;

function getSafePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams?: OrdersSearchParams;
}) {
  await requireAdminSession();
  const query = searchParams ? await searchParams : {};
  const searchTerm = typeof query.search === "string" ? query.search : "";
  const statusFilter = ORDER_STATUSES.includes(query.status as OrderStatus) ? (query.status as OrderStatus) : "all";
  const page = getSafePage(query.page);

  try {
    const data = await listOrdersForAdmin({
      page,
      pageSize: 30,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchTerm || undefined
    });
    const totalPages = Math.max(1, Math.ceil(data.totalCount / data.pageSize));
    const hasPrev = data.page > 1;
    const hasNext = data.page < totalPages;

    return (
      <div className="space-y-6">
        <SectionHeader
          title="Orders"
          description={`Operational queue view with status, payment, customer, and delivery context. Showing ${data.orders.length} of ${data.totalCount} order(s).`}
        />

        <Card>
          <form action="/admin/orders" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
                Search
              </label>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                defaultValue={searchTerm}
                id="search"
                name="search"
                placeholder="Search by order number"
                type="search"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
                Status
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                defaultValue={statusFilter}
                id="status"
                name="status"
              >
                <option value="all">All</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="submit"
              >
                Filter
              </button>
            </div>
          </form>
        </Card>

        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Units</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.orders.map((entry) => (
                <tr className="text-sm text-slate-700" key={entry.order.id}>
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        className="font-semibold text-brand-700 hover:text-brand-800"
                        href={`/admin/orders/${entry.order.id}`}
                      >
                        {entry.order.order_number}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{entry.order.delivery_address}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p>{entry.customer ? `${entry.customer.first_name} ${entry.customer.last_name}`.trim() : "Unknown customer"}</p>
                      <p className="text-xs text-slate-500">{entry.customer?.email || "No email"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[entry.order.status]}>
                      {formatStatus(entry.order.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={entry.order.payment_status === "PAID" ? "success" : "warning"}>
                      {entry.order.payment_status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{entry.totalUnits}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(entry.order.total, entry.order.currency)}</td>
                  <td className="px-4 py-3">{formatDateTime(entry.order.created_at)}</td>
                </tr>
              ))}
              {data.orders.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={7}>
                    No orders found for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Page {data.page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {hasPrev ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href={`/admin/orders?page=${data.page - 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                Previous
              </span>
            )}

            {hasNext ? (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href={`/admin/orders?page=${data.page + 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
                Next
              </span>
            )}
          </div>
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

export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FormSubmitButton } from "@/components/forms";
import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  getOrderDetailForAdmin,
  OrderNotFoundError,
  OrderStatusConflictError,
  OrderStatusTransitionError,
  updateOrderStatus
} from "@/services/orders";
import type { OrderStatus } from "@/types";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default async function AdminOrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ updated?: string; error?: string }>;
}) {
  const { id } = await params;
  const session = await requireAdminSession();
  const canManageOrders = session.role === "SUPER_ADMIN" || session.role === "OPERATIONS";
  const query = searchParams ? await searchParams : {};
  const detail = await getOrderDetailForAdmin(id);

  if (!detail) {
    notFound();
  }

  async function updateStatusAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS"]);

    const rawStatus = String(formData.get("status") || "").trim();
    const note = String(formData.get("note") || "").trim();

    if (!ORDER_STATUSES.includes(rawStatus as OrderStatus)) {
      redirect(`/admin/orders/${id}?error=${encodeURIComponent("Invalid status.")}`);
    }

    try {
      await updateOrderStatus(id, rawStatus as OrderStatus, {
        changedBy: "admin_ui",
        note: note || null
      });
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        redirect(`/admin/orders/${id}?error=${encodeURIComponent("Order not found.")}`);
      }
      if (error instanceof OrderStatusTransitionError || error instanceof OrderStatusConflictError) {
        redirect(`/admin/orders/${id}?error=${encodeURIComponent(error.message)}`);
      }
      redirect(`/admin/orders/${id}?error=${encodeURIComponent("Status update failed.")}`);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    redirect(`/admin/orders/${id}?updated=1`);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={detail.order.order_number}
        description="Order detail, status timeline, and safe status updates."
        action={
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" href="/admin/orders">
            Back to Orders
          </Link>
        }
      />

      {query.updated === "1" ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
          Order status updated successfully.
        </div>
      ) : null}

      {query.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {query.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-2 lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p><span className="font-medium">Status:</span> {formatStatus(detail.order.status)}</p>
            <p><span className="font-medium">Payment:</span> {detail.order.payment_status}</p>
            <p><span className="font-medium">Subtotal:</span> {formatCurrency(detail.order.subtotal, detail.order.currency)}</p>
            <p><span className="font-medium">Delivery Fee:</span> {formatCurrency(detail.order.delivery_fee, detail.order.currency)}</p>
            <p><span className="font-medium">Total:</span> {formatCurrency(detail.order.total, detail.order.currency)}</p>
            <p><span className="font-medium">Created:</span> {formatDateTime(detail.order.created_at)}</p>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Delivery Address:</span> {detail.order.delivery_address}
          </p>
          {detail.order.notes ? (
            <p className="text-sm text-slate-700">
              <span className="font-medium">Notes:</span> {detail.order.notes}
            </p>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Update Status</h3>
          {canManageOrders ? (
            <form action={updateStatusAction} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
                  Next Status
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                  defaultValue={detail.order.status}
                  id="status"
                  name="status"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="note">
                  Note (Optional)
                </label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  id="note"
                  name="note"
                  placeholder="Reason for this status change"
                />
              </div>
              <FormSubmitButton
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
                pendingLabel="Saving..."
              >
                Save Status
              </FormSubmitButton>
            </form>
          ) : (
            <p className="text-sm text-slate-600">
              Your role has read-only access for orders. Contact Operations or Super Admin to change status.
            </p>
          )}
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Customer</h3>
        {detail.customer ? (
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p><span className="font-medium">Name:</span> {`${detail.customer.first_name} ${detail.customer.last_name}`.trim()}</p>
            <p><span className="font-medium">Email:</span> {detail.customer.email}</p>
            <p><span className="font-medium">Phone:</span> {detail.customer.phone || "N/A"}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-700">Customer details are unavailable.</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Unit Price</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-sm text-slate-700">{item.product_name_snapshot}</td>
                  <td className="px-3 py-2 text-right text-sm text-slate-700">{formatCurrency(item.unit_price, item.currency)}</td>
                  <td className="px-3 py-2 text-right text-sm text-slate-700">{item.quantity}</td>
                  <td className="px-3 py-2 text-right text-sm font-medium text-slate-900">{formatCurrency(item.line_total, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Status History</h3>
        {detail.statusHistory.length === 0 ? (
          <p className="text-sm text-slate-700">No status history entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {detail.statusHistory.map((entry) => (
              <li className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" key={entry.id}>
                <p className="font-medium text-slate-900">
                  {entry.from_status ? `${formatStatus(entry.from_status)} -> ${formatStatus(entry.to_status)}` : formatStatus(entry.to_status)}
                </p>
                <p className="text-xs text-slate-500">{formatDateTime(entry.changed_at)}</p>
                <p className="text-xs text-slate-500">Changed by: {entry.changed_by || "system"}</p>
                {entry.note ? <p className="mt-1 text-xs text-slate-600">{entry.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

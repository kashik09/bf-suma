"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";

function SubmitButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "success" }) {
  const { pending } = useFormStatus();
  const baseClass = "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:opacity-50";
  const variantClass = variant === "success"
    ? "bg-emerald-600 text-white hover:bg-emerald-700"
    : "bg-brand-600 text-white hover:bg-brand-700";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${baseClass} ${variantClass}`}
    >
      {pending ? "Processing..." : children}
    </button>
  );
}

interface PaymentDeliveryActionsProps {
  orderId: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paymentReceivedAt?: string | null;
  deliveredAt?: string | null;
  markPaidAction: (formData: FormData) => Promise<void>;
  markDeliveredAction: () => Promise<void>;
}

export function PaymentDeliveryActions({
  paymentStatus,
  orderStatus,
  paymentMethod,
  paymentReference,
  paymentReceivedAt,
  deliveredAt,
  markPaidAction,
  markDeliveredAction
}: PaymentDeliveryActionsProps) {
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [showDeliveredConfirm, setShowDeliveredConfirm] = useState(false);

  const isPaid = paymentStatus === "PAID";
  const isDelivered = orderStatus === "DELIVERED";

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString();
  }

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <p className="font-medium text-slate-900">Payment Status</p>
          <p className="flex items-center gap-2">
            <span className={isPaid ? "text-emerald-600" : "text-amber-600"}>
              {isPaid ? "🟢" : "🔴"} {paymentStatus}
            </span>
          </p>
          {isPaid && paymentMethod && (
            <p className="mt-1 text-xs text-slate-500">
              Method: {PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod] || paymentMethod}
            </p>
          )}
          {isPaid && paymentReference && (
            <p className="text-xs text-slate-500">Ref: {paymentReference}</p>
          )}
          {isPaid && paymentReceivedAt && (
            <p className="text-xs text-slate-500">Paid: {formatDateTime(paymentReceivedAt)}</p>
          )}
        </div>

        <div>
          <p className="font-medium text-slate-900">Delivery Status</p>
          <p className="flex items-center gap-2">
            <span className={isDelivered ? "text-emerald-600" : "text-amber-600"}>
              {isDelivered ? "✅" : "⏳"} {isDelivered ? "DELIVERED" : "PENDING"}
            </span>
          </p>
          {isDelivered && deliveredAt && (
            <p className="mt-1 text-xs text-slate-500">Delivered: {formatDateTime(deliveredAt)}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!isPaid && (
          <button
            type="button"
            onClick={() => setShowPaidModal(true)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Mark Paid
          </button>
        )}
        {!isDelivered && (
          <button
            type="button"
            onClick={() => setShowDeliveredConfirm(true)}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Mark Delivered
          </button>
        )}
      </div>

      {/* Mark Paid Modal */}
      <Modal open={showPaidModal} title="Mark Order as Paid" onClose={() => setShowPaidModal(false)}>
        <form
          action={async (formData) => {
            await markPaidAction(formData);
            setShowPaidModal(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="payment_method">
              Payment Method
            </label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
              defaultValue={PAYMENT_METHODS.MTN_MOMO}
              id="payment_method"
              name="payment_method"
            >
              {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="payment_reference">
              Reference / Transaction Code (Optional)
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
              id="payment_reference"
              name="payment_reference"
              type="text"
              placeholder="e.g. MP240115.1234.A12345"
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="payment_notes">
              Notes (Optional)
            </label>
            <textarea
              className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              id="payment_notes"
              name="payment_notes"
              placeholder="Any additional details"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPaidModal(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <SubmitButton variant="success">Confirm Paid</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Mark Delivered Confirmation Modal */}
      <Modal open={showDeliveredConfirm} title="Mark as Delivered" onClose={() => setShowDeliveredConfirm(false)}>
        <p className="mb-4 text-sm text-slate-700">
          Mark this order as delivered? This action will be logged.
        </p>
        <form
          action={async () => {
            await markDeliveredAction();
            setShowDeliveredConfirm(false);
          }}
        >
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeliveredConfirm(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <SubmitButton>Confirm Delivered</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

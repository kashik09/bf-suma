import Link from "next/link";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

interface OrderTrackerCardProps {
  orderNumber: string;
  orderId: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELED";
  estimatedDelivery?: string;
  itemCount: number;
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Order placed",
    color: "text-slate-600",
    bg: "bg-slate-100",
    message: "Awaiting confirmation"
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: "Confirmed",
    color: "text-amber-600",
    bg: "bg-amber-100",
    message: "Being prepared"
  },
  PROCESSING: {
    icon: Package,
    label: "Processing",
    color: "text-sky-600",
    bg: "bg-sky-100",
    message: "Being packed"
  },
  SHIPPED: {
    icon: Truck,
    label: "Shipped",
    color: "text-sky-600",
    bg: "bg-sky-100",
    message: "On the way"
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    label: "Out for delivery",
    color: "text-brand-600",
    bg: "bg-brand-100",
    message: "Arriving soon"
  },
  DELIVERED: {
    icon: CheckCircle2,
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    message: "Completed"
  },
  CANCELED: {
    icon: Clock,
    label: "Canceled",
    color: "text-rose-600",
    bg: "bg-rose-100",
    message: "Order canceled"
  }
};

export function OrderTrackerCard({
  orderNumber,
  orderId,
  status,
  estimatedDelivery,
  itemCount
}: OrderTrackerCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">#{orderNumber}</p>
            <p className="text-xs text-slate-500">
              {itemCount} item{itemCount !== 1 ? "s" : ""} · {config.label}
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.message}
        </span>
      </div>

      {estimatedDelivery && status !== "DELIVERED" && status !== "CANCELED" && (
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Estimated delivery</p>
          <p className="text-sm font-semibold text-slate-900">{estimatedDelivery}</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link
          href={`/account/orders/${orderId}`}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View details
        </Link>
        {(status === "SHIPPED" || status === "OUT_FOR_DELIVERY") && (
          <Link
            href={`/account/orders/${orderId}`}
            className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Track order
          </Link>
        )}
      </div>
    </div>
  );
}

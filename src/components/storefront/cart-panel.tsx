"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { DELIVERY_ESTIMATE_TEXT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export function CartPanel() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  const getAvailabilityMeta = (availability: "in_stock" | "low_stock" | "out_of_stock") => {
    if (availability === "in_stock") {
      return { label: "In Stock", variant: "success" as const };
    }

    if (availability === "low_stock") {
      return { label: "Low Stock", variant: "warning" as const };
    }

    return { label: "Out of Stock", variant: "danger" as const };
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products from the shop to continue to checkout."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-3">
        {items.map((item) => {
          const availability = getAvailabilityMeta(item.availability);

          return (
            <div className="rounded-lg border border-slate-200 bg-white p-4" key={item.product_id}>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${item.image_url})` }} />
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                  <Badge variant={availability.variant}>{availability.label}</Badge>

                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded-md bg-slate-100"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="h-8 w-8 rounded-md bg-slate-100"
                      disabled={item.availability === "out_of_stock" || item.quantity >= item.max_quantity}
                      title={
                        item.availability === "out_of_stock"
                          ? "This product is out of stock."
                          : item.quantity >= item.max_quantity
                            ? "You reached the available quantity."
                            : "Increase quantity"
                      }
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="text-sm font-medium text-red-600"
                  onClick={() => removeItem(item.product_id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="h-fit space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
        </div>
        <p className="text-xs text-slate-500">{DELIVERY_ESTIMATE_TEXT}</p>

        <Link
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700"
          href="/checkout"
        >
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}

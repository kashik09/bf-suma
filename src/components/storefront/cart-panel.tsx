"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";
import { STORE_CURRENCY } from "@/lib/utils";
import { DELIVERY_ESTIMATE_TEXT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { CartItem } from "@/types";

interface CartPanelProps {
  commerceReady?: boolean;
  degradedReason?: string | null;
}

interface CartGroup {
  bundle_id: string | null;
  bundle_name: string | null;
  bundle_image_url: string | null;
  items: CartItem[];
}

function groupCartItems(items: CartItem[]): CartGroup[] {
  const bundleGroups = new Map<string, CartGroup>();
  const standaloneItems: CartItem[] = [];

  for (const item of items) {
    if (item.bundle_id) {
      const existing = bundleGroups.get(item.bundle_id);
      if (existing) {
        existing.items.push(item);
      } else {
        bundleGroups.set(item.bundle_id, {
          bundle_id: item.bundle_id,
          bundle_name: item.bundle_name || null,
          bundle_image_url: item.bundle_image_url || null,
          items: [item]
        });
      }
    } else {
      standaloneItems.push(item);
    }
  }

  const groups: CartGroup[] = [];

  // Add bundle groups first
  for (const group of bundleGroups.values()) {
    groups.push(group);
  }

  // Add standalone items as individual groups
  for (const item of standaloneItems) {
    groups.push({
      bundle_id: null,
      bundle_name: null,
      bundle_image_url: null,
      items: [item]
    });
  }

  return groups;
}

export function CartPanel({ commerceReady = true, degradedReason = null }: CartPanelProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { currency } = useSelectedCurrency();

  const cartGroups = useMemo(() => groupCartItems(items), [items]);

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
      <div className="space-y-4">
        {cartGroups.map((group, groupIndex) => (
          <div key={group.bundle_id || `standalone-${groupIndex}`}>
            {/* Bundle Header */}
            {group.bundle_id && group.bundle_name && (
              <div className="mb-2 flex items-center gap-3 rounded-t-xl border border-b-0 border-brand-200 bg-brand-50 px-4 py-2.5">
                {group.bundle_image_url ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-md border border-brand-200 bg-white">
                    <Image
                      alt={group.bundle_name}
                      className="object-contain"
                      fill
                      sizes="32px"
                      src={group.bundle_image_url}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-brand-200 bg-white">
                    <Package className="h-4 w-4 text-brand-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-brand-600">Part of package</p>
                  <p className="truncate text-sm font-semibold text-brand-800">{group.bundle_name}</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className={`space-y-2 ${group.bundle_id ? "rounded-b-xl border border-t-0 border-slate-200 bg-white p-3" : ""}`}>
              {group.items.map((item) => {
                const availability = getAvailabilityMeta(item.availability);

                return (
                  <div
                    className={`${group.bundle_id ? "rounded-lg border border-slate-100 bg-slate-50 p-3" : "rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"}`}
                    key={item.product_id}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Image
                          alt={`BF Suma ${item.name} product thumbnail in cart`}
                          className="object-contain"
                          fill
                          sizes="64px"
                          src={item.image_url || "/catalog-images/placeholder.svg"}
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">
                          {formatPrice(convertPrice(item.price, item.currency, currency), currency)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="h-7 w-7 rounded-md border border-slate-200 bg-white text-sm font-semibold transition hover:bg-slate-50"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            aria-label={`Increase quantity for ${item.name}`}
                            className="h-7 w-7 rounded-md border border-slate-200 bg-white text-sm font-semibold transition hover:bg-slate-50"
                            disabled={item.availability === "out_of_stock" || item.quantity >= item.max_quantity}
                            title={
                              item.availability === "out_of_stock"
                                ? "Currently unavailable"
                                : item.quantity >= item.max_quantity
                                  ? "Maximum quantity reached"
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
                        className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
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
          </div>
        ))}
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-900">
            {formatPrice(convertPrice(subtotal, items[0]?.currency || STORE_CURRENCY, currency), currency)}
          </span>
        </div>
        <p className="text-xs text-slate-500">{DELIVERY_ESTIMATE_TEXT}</p>

        {commerceReady ? (
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/checkout"
          >
            Checkout - Fast Delivery
          </Link>
        ) : (
          <button
            className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-md bg-slate-300 px-4 text-sm font-medium text-slate-700"
            disabled
            type="button"
          >
            Checkout Temporarily Unavailable
          </button>
        )}

        {!commerceReady ? (
          <p className="text-xs text-amber-700">
            {degradedReason || "Live inventory validation is unavailable. Checkout is disabled until service recovery."}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { trackEvent } from "@/lib/analytics";
import { addBundleToCart } from "@/lib/cart";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { PackageDisplayData } from "@/types";

function toMajorCurrency(minor: number, currency: string): number {
  if (currency === "UGX") return minor;
  return Number((minor / 100).toFixed(2));
}

interface PackageAddToCartProps {
  pkg: PackageDisplayData;
}

export function PackageAddToCart({ pkg }: PackageAddToCartProps) {
  const { currency: selectedCurrency } = useSelectedCurrency();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const convertedFinalPrice = convertPrice(pkg.final_price, pkg.currency, selectedCurrency);
  const convertedCalculatedPrice = convertPrice(pkg.calculated_price, pkg.currency, selectedCurrency);
  const convertedSavings = pkg.savings ? convertPrice(pkg.savings, pkg.currency, selectedCurrency) : null;

  function handleAddToCart() {
    if (!pkg.is_in_stock || justAdded) return;

    addBundleToCart({
      bundle_id: pkg.id,
      bundle_name: pkg.name,
      bundle_image_url: pkg.hero_image_url,
      items: pkg.items.map((item) => ({
        product_id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_url,
        quantity: item.quantity,
        max_quantity: item.product.stock_qty,
        availability:
          item.product.status === "ACTIVE" && item.product.stock_qty >= item.quantity
            ? "in_stock"
            : item.product.stock_qty > 0
              ? "low_stock"
              : "out_of_stock",
        currency: item.product.currency
      }))
    });

    trackEvent("add_to_cart", {
      currency: pkg.currency,
      value: toMajorCurrency(pkg.final_price, pkg.currency),
      items: pkg.items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        price: toMajorCurrency(item.product.price, item.product.currency),
        quantity: item.quantity,
        item_category: "package",
        item_variant: pkg.name
      }))
    });

    toast({
      title: "Package added to cart",
      description: `${pkg.name} (${pkg.item_count} items)`,
      variant: "success"
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-900">
          {formatPrice(convertedFinalPrice, selectedCurrency)}
        </p>
        {convertedSavings && (
          <>
            <p className="text-lg text-slate-400 line-through">
              {formatPrice(convertedCalculatedPrice, selectedCurrency)}
            </p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-700">
              <Tag className="h-3.5 w-3.5" />
              Save {formatPrice(convertedSavings, selectedCurrency)}
            </span>
          </>
        )}
      </div>

      <Button
        className="w-full sm:w-auto"
        disabled={!pkg.is_in_stock || justAdded}
        onClick={handleAddToCart}
        size="lg"
      >
        {justAdded ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Added
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {pkg.is_in_stock ? "Add Bundle to Cart" : "Currently Unavailable"}
          </>
        )}
      </Button>

      {!pkg.is_in_stock && (
        <p className="text-sm text-rose-600">
          One or more items in this package are out of stock.
        </p>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/toast";
import type { StorefrontProduct } from "@/types";

function availabilityLabel(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "In stock";
  if (availability === "low_stock") return "Low stock";
  return "Out of stock";
}

function availabilityVariant(availability: StorefrontProduct["availability"]) {
  if (availability === "in_stock") return "success" as const;
  if (availability === "low_stock") return "warning" as const;
  return "danger" as const;
}

interface ProductDetailProps {
  product: StorefrontProduct;
  commerceReady?: boolean;
  degradedReason?: string | null;
}

export function ProductDetail({ product, commerceReady = true, degradedReason = null }: ProductDetailProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.gallery_urls[0] || product.image_url);

  const isUnavailable = product.availability === "out_of_stock" || !commerceReady;

  const maxQuantity = useMemo(() => Math.max(1, Math.min(product.stock_qty, 99)), [product.stock_qty]);

  const whatsappMessage = `Hello BF Suma, I would like to order ${product.name} (${quantity} item${quantity > 1 ? "s" : ""}).`;

  function increment() {
    setQuantity((current) => Math.min(current + 1, maxQuantity));
  }

  function decrement() {
    setQuantity((current) => Math.max(current - 1, 1));
  }

  function handleAddToCart() {
    if (isUnavailable) {
      toast({
        title: "Item unavailable",
        description: "This product is currently out of stock.",
        variant: "error"
      });
      return;
    }

    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${product.name} x${quantity}`,
      variant: "success"
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="h-80 w-full rounded-lg border border-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${activeImage})` }} />
        <div className="grid grid-cols-4 gap-2">
          {product.gallery_urls.slice(0, 4).map((image) => (
            <button
              className={`h-20 rounded-md border bg-cover bg-center ${activeImage === image ? "border-brand-600" : "border-slate-200"}`}
              key={image}
              onClick={() => setActiveImage(image)}
              style={{ backgroundImage: `url(${image})` }}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <Badge variant={availabilityVariant(product.availability)}>{availabilityLabel(product.availability)}</Badge>
        <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
        <p className="text-sm text-slate-600">{product.description}</p>

        <div className="flex items-center gap-2">
          <p className="text-xl font-semibold text-slate-900">{formatCurrency(product.price, product.currency)}</p>
          {product.compare_at_price ? (
            <p className="text-sm text-slate-500 line-through">{formatCurrency(product.compare_at_price, product.currency)}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Quantity</p>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-300 p-1">
            <button className="h-9 w-9 rounded-md bg-slate-100" onClick={decrement} type="button">
              -
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              className="h-9 w-9 rounded-md bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
              disabled={quantity >= maxQuantity}
              onClick={increment}
              title={quantity >= maxQuantity ? "You've reached available quantity." : "Increase quantity"}
              type="button"
            >
              +
            </button>
          </div>
          {isUnavailable && (
            <p className="text-xs text-red-600">Unavailable right now. Contact support for restock timing.</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button disabled={isUnavailable} onClick={handleAddToCart} title={isUnavailable ? "Product is out of stock" : "Add item to cart"}>
            {!commerceReady ? "Checkout unavailable" : isUnavailable ? "Out of stock" : "Add to cart"}
          </Button>
          <a
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
            href={buildWhatsAppUrl(whatsappMessage)}
            rel="noreferrer"
            target="_blank"
          >
            Order via WhatsApp
          </a>
        </div>

        {!commerceReady ? (
          <p className="text-xs text-amber-700">
            {degradedReason || "Live inventory validation is unavailable. Checkout is temporarily disabled."}
          </p>
        ) : null}
      </div>
    </section>
  );
}

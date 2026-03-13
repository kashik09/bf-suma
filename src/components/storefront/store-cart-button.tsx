"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function StoreCartButton() {
  const { count } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      className="relative inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
      href="/cart"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Cart</span>
      {mounted && count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold">
          {count}
        </span>
      )}
    </Link>
  );
}

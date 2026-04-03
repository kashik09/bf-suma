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
      aria-label="View cart"
      className="relative z-20 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
      href="/cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

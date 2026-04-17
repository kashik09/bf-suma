"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  CART_UPDATED_EVENT,
  clearCart,
  getCartCount,
  getCartItems,
  getCartSubtotal,
  removeCartItem,
  updateCartItemQuantity
} from "@/lib/cart";
import { getSession } from "@/lib/auth/customer-auth";
import { getStoredCustomerProfile } from "@/lib/customer-profile";
import type { StorefrontProduct } from "@/types";

function normalizeEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

export function useCart() {
  const [items, setItems] = useState(getCartItems());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        const session = await getSession().catch(() => null);
        if (!session?.access_token) return;

        const sessionEmail = normalizeEmail(session.user?.email);
        if (!sessionEmail) return;

        const profile = getStoredCustomerProfile();
        const profileEmail = normalizeEmail(profile?.email);
        if (!profile || !profileEmail || profileEmail !== sessionEmail) return;

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        };

        if (items.length === 0) {
          void fetch("/api/abandoned-cart", {
            method: "DELETE",
            headers,
            body: JSON.stringify({
              customerEmail: profile.email
            })
          }).catch(() => undefined);
          return;
        }

        void fetch("/api/abandoned-cart", {
          method: "POST",
          headers,
          body: JSON.stringify({
            customerEmail: profile.email,
            customerName: [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || null,
            cartItems: items.map((item) => ({
              product_id: item.product_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              slug: item.slug
            }))
          })
        }).catch(() => undefined);
      })();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    const sync = () => setItems(getCartItems());

    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const count = useMemo(() => getCartCount(items), [items]);
  const subtotal = useMemo(() => getCartSubtotal(items), [items]);

  return {
    items,
    count,
    subtotal,
    addItem: (product: StorefrontProduct, quantity: number) => {
      addCartItem(product, quantity);
      setItems(getCartItems());
    },
    updateQuantity: (productId: string, quantity: number) => {
      updateCartItemQuantity(productId, quantity);
      setItems(getCartItems());
    },
    removeItem: (productId: string) => {
      removeCartItem(productId);
      setItems(getCartItems());
    },
    clear: () => {
      clearCart();
      setItems(getCartItems());
    }
  };
}

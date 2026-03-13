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
import type { StorefrontProduct } from "@/types";

export function useCart() {
  const [items, setItems] = useState(getCartItems());

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

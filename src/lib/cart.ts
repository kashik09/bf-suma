import type { CartItem, StorefrontProduct } from "@/types";

const CART_STORAGE_KEY = "bf_suma_cart_v1";
export const CART_UPDATED_EVENT = "bf_suma_cart_updated";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCartStorage(): CartItem[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item && typeof item.product_id === "string");
  } catch {
    return [];
  }
}

function writeCartStorage(items: CartItem[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItems(): CartItem[] {
  return readCartStorage();
}

export function addCartItem(product: StorefrontProduct, quantity: number) {
  if (product.availability === "out_of_stock" || product.stock_qty <= 0) {
    return;
  }

  const current = readCartStorage();
  const existingIndex = current.findIndex((item) => item.product_id === product.id);
  const safeMax = Math.max(0, product.stock_qty);
  const safeQuantity = Math.max(1, Math.min(quantity, safeMax));

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    const nextQuantity = Math.min(existing.quantity + safeQuantity, existing.max_quantity || safeMax || 99);
    current[existingIndex] = {
      ...existing,
      quantity: nextQuantity
    };
  } else {
    current.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: safeQuantity,
      max_quantity: safeMax,
      availability: product.availability
    });
  }

  writeCartStorage(current);
}

export function updateCartItemQuantity(productId: string, quantity: number) {
  const current = readCartStorage();
  const nextItems = current
    .map((item) => {
      if (item.product_id !== productId) return item;

      const clampedQuantity = Math.max(1, Math.min(quantity, item.max_quantity || 99));
      return {
        ...item,
        quantity: clampedQuantity
      };
    })
    .filter((item) => item.quantity > 0);

  writeCartStorage(nextItems);
}

export function removeCartItem(productId: string) {
  const nextItems = readCartStorage().filter((item) => item.product_id !== productId);
  writeCartStorage(nextItems);
}

export function clearCart() {
  writeCartStorage([]);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

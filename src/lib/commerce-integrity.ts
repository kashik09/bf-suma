export type FulfillmentType = "delivery" | "pickup";

export interface CommercePayloadItem {
  product_id: string;
  price: number;
  quantity: number;
}

export interface CommercePayload {
  fulfillmentType: FulfillmentType;
  items: CommercePayloadItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CommerceProductSnapshot {
  id: string;
  name: string;
  price: number | string | null;
  currency?: string | null;
  status: string | null;
  stock_qty: number | string | null;
}

export interface AuthoritativeOrderItem {
  product_id: string;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  currency: string;
}

export interface AuthoritativeOrderComputation {
  items: AuthoritativeOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}

export interface CommerceIntegrityOptions {
  deliveryFeeAmount: number;
  storeCurrency: string;
}

export class CommerceIntegrityError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "CommerceIntegrityError";
    this.fieldErrors = fieldErrors;
  }
}

function normalizeAmount(value: number): number {
  return Math.round(value);
}

function resolveProductCurrency(value: string | null | undefined, storeCurrency: string): string {
  const normalized = (value || storeCurrency).trim().toUpperCase();
  return normalized.length > 0 ? normalized : storeCurrency;
}

export function computeAuthoritativeOrder(
  payload: CommercePayload,
  products: CommerceProductSnapshot[],
  options: CommerceIntegrityOptions
): AuthoritativeOrderComputation {
  const { deliveryFeeAmount, storeCurrency } = options;
  const requestedQuantities = new Map<string, number>();

  payload.items.forEach((item) => {
    const current = requestedQuantities.get(item.product_id) || 0;
    requestedQuantities.set(item.product_id, current + item.quantity);
  });

  const productsById = new Map(products.map((product) => [product.id, product]));
  const requestedProductIds = Array.from(requestedQuantities.keys());
  const missingProductIds = requestedProductIds.filter((productId) => !productsById.has(productId));

  if (missingProductIds.length > 0) {
    throw new CommerceIntegrityError(
      "Some products in your cart are no longer available.",
      { items: ["One or more products could not be found."] }
    );
  }

  const tamperedPriceItems = payload.items.filter((item) => {
    const product = productsById.get(item.product_id);
    if (!product) return false;
    const authoritativePrice = normalizeAmount(Number(product.price));
    return !Number.isFinite(authoritativePrice) || normalizeAmount(item.price) !== authoritativePrice;
  });

  if (tamperedPriceItems.length > 0) {
    throw new CommerceIntegrityError(
      "One or more item prices changed. Please review your cart and try again.",
      { items: ["Submitted item pricing does not match current catalog pricing."] }
    );
  }

  const items: AuthoritativeOrderItem[] = [];
  let computedSubtotal = 0;

  for (const [productId, quantity] of requestedQuantities.entries()) {
    const product = productsById.get(productId);
    if (!product) continue;

    if (product.status !== "ACTIVE") {
      throw new CommerceIntegrityError(
        "Some products in your cart are not currently available for checkout.",
        { items: ["One or more products are inactive."] }
      );
    }

    const stockQty = Number(product.stock_qty);
    if (!Number.isFinite(stockQty) || stockQty <= 0 || quantity > stockQty) {
      throw new CommerceIntegrityError(
        "Some products in your cart do not have enough stock.",
        { items: ["Requested quantity exceeds available stock."] }
      );
    }

    const unitPrice = normalizeAmount(Number(product.price));
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid product price for ${productId}`);
    }

    const currency = resolveProductCurrency(product.currency, storeCurrency);
    if (currency !== storeCurrency) {
      throw new CommerceIntegrityError(
        "Some products are not purchasable in the current store currency.",
        { items: ["Product currency mismatch."] }
      );
    }

    const lineTotal = unitPrice * quantity;
    computedSubtotal += lineTotal;

    items.push({
      product_id: productId,
      product_name_snapshot: product.name,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
      currency
    });
  }

  const computedDeliveryFee = payload.fulfillmentType === "pickup" ? 0 : deliveryFeeAmount;
  const computedTotal = computedSubtotal + computedDeliveryFee;

  if (
    normalizeAmount(payload.subtotal) !== computedSubtotal ||
    normalizeAmount(payload.deliveryFee) !== computedDeliveryFee ||
    normalizeAmount(payload.total) !== computedTotal
  ) {
    throw new CommerceIntegrityError(
      "Order totals do not match current pricing. Please refresh your cart and try again.",
      { total: ["Submitted totals do not match current server pricing."] }
    );
  }

  return {
    items,
    subtotal: computedSubtotal,
    deliveryFee: computedDeliveryFee,
    total: computedTotal,
    currency: storeCurrency
  };
}

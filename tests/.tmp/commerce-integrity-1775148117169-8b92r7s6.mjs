export class CommerceIntegrityError extends Error {
    fieldErrors;
    constructor(message, fieldErrors = {}) {
        super(message);
        this.name = "CommerceIntegrityError";
        this.fieldErrors = fieldErrors;
    }
}
function normalizeAmount(value) {
    return Math.round(value);
}
function resolveProductCurrency(value, storeCurrency) {
    const normalized = (value || storeCurrency).trim().toUpperCase();
    return normalized.length > 0 ? normalized : storeCurrency;
}
export function computeAuthoritativeOrder(payload, products, options) {
    const { deliveryFeeAmount, storeCurrency } = options;
    const requestedQuantities = new Map();
    payload.items.forEach((item) => {
        const current = requestedQuantities.get(item.product_id) || 0;
        requestedQuantities.set(item.product_id, current + item.quantity);
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const requestedProductIds = Array.from(requestedQuantities.keys());
    const missingProductIds = requestedProductIds.filter((productId) => !productsById.has(productId));
    if (missingProductIds.length > 0) {
        throw new CommerceIntegrityError("Some products in your cart are no longer available.", { items: ["One or more products could not be found."] });
    }
    const tamperedPriceItems = payload.items.filter((item) => {
        const product = productsById.get(item.product_id);
        if (!product)
            return false;
        const authoritativePrice = normalizeAmount(Number(product.price));
        return !Number.isFinite(authoritativePrice) || normalizeAmount(item.price) !== authoritativePrice;
    });
    if (tamperedPriceItems.length > 0) {
        throw new CommerceIntegrityError("One or more item prices changed. Please review your cart and try again.", { items: ["Submitted item pricing does not match current catalog pricing."] });
    }
    const items = [];
    let computedSubtotal = 0;
    for (const [productId, quantity] of requestedQuantities.entries()) {
        const product = productsById.get(productId);
        if (!product)
            continue;
        if (product.status !== "ACTIVE") {
            throw new CommerceIntegrityError("Some products in your cart are not currently available for checkout.", { items: ["One or more products are inactive."] });
        }
        const stockQty = Number(product.stock_qty);
        if (!Number.isFinite(stockQty) || stockQty <= 0 || quantity > stockQty) {
            throw new CommerceIntegrityError("Some products in your cart do not have enough stock.", { items: ["Requested quantity exceeds available stock."] });
        }
        const unitPrice = normalizeAmount(Number(product.price));
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            throw new Error(`Invalid product price for ${productId}`);
        }
        const currency = resolveProductCurrency(product.currency, storeCurrency);
        if (currency !== storeCurrency) {
            throw new CommerceIntegrityError("Some products are not purchasable in the current store currency.", { items: ["Product currency mismatch."] });
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
    if (normalizeAmount(payload.subtotal) !== computedSubtotal ||
        normalizeAmount(payload.deliveryFee) !== computedDeliveryFee ||
        normalizeAmount(payload.total) !== computedTotal) {
        throw new CommerceIntegrityError("Order totals do not match current pricing. Please refresh your cart and try again.", { total: ["Submitted totals do not match current server pricing."] });
    }
    return {
        items,
        subtotal: computedSubtotal,
        deliveryFee: computedDeliveryFee,
        total: computedTotal,
        currency: storeCurrency
    };
}

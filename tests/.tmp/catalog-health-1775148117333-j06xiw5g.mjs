export function buildLiveCatalogHealth() {
    return {
        source: "live",
        commerceReady: true,
        degradedReason: null
    };
}
export function buildFallbackCatalogHealth(reason) {
    const message = typeof reason === "string" && reason.trim().length > 0
        ? reason.trim()
        : "Live catalog is unavailable.";
    return {
        source: "fallback",
        commerceReady: false,
        degradedReason: message
    };
}
export function coerceProductsToReadOnly(products) {
    return products.map((product) => ({
        ...product,
        status: "OUT_OF_STOCK",
        stock_qty: 0,
        availability: "out_of_stock"
    }));
}
export function getCommerceDegradedMessage(health) {
    if (health.commerceReady)
        return "";
    return "Live inventory validation is unavailable. Browsing is read-only and checkout is temporarily disabled.";
}
export function buildCatalogResponseHeaders(health) {
    const headers = {
        "X-Catalog-Source": health.source,
        "X-Commerce-Ready": String(health.commerceReady)
    };
    if (!health.commerceReady) {
        headers["X-Commerce-Degraded"] = "true";
        if (health.degradedReason)
            headers["X-Commerce-Degraded-Reason"] = health.degradedReason;
    }
    return headers;
}

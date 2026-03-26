export type CatalogSource = "live" | "fallback";

export interface CatalogHealth {
  source: CatalogSource;
  commerceReady: boolean;
  degradedReason: string | null;
}

export function buildLiveCatalogHealth(): CatalogHealth {
  return {
    source: "live",
    commerceReady: true,
    degradedReason: null
  };
}

export function buildFallbackCatalogHealth(reason: unknown): CatalogHealth {
  const message = typeof reason === "string" && reason.trim().length > 0
    ? reason.trim()
    : "Live catalog is unavailable.";

  return {
    source: "fallback",
    commerceReady: false,
    degradedReason: message
  };
}

type ReadOnlyProductShape = {
  status: string;
  stock_qty: number;
  availability: string;
};

export function coerceProductsToReadOnly<T extends ReadOnlyProductShape>(products: T[]): T[] {
  return products.map((product) => ({
    ...product,
    status: "OUT_OF_STOCK",
    stock_qty: 0,
    availability: "out_of_stock"
  }));
}

export function getCommerceDegradedMessage(health: CatalogHealth): string {
  if (health.commerceReady) return "";

  return "Live inventory validation is unavailable. Browsing is read-only and checkout is temporarily disabled.";
}

export function buildCatalogResponseHeaders(health: CatalogHealth): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Catalog-Source": health.source,
    "X-Commerce-Ready": String(health.commerceReady)
  };

  if (!health.commerceReady) {
    headers["X-Commerce-Degraded"] = "true";
    if (health.degradedReason) headers["X-Commerce-Degraded-Reason"] = health.degradedReason;
  }

  return headers;
}

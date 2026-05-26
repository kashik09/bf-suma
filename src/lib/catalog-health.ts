export type CatalogSource = "live" | "fallback";

export interface CatalogHealth {
  source: CatalogSource;
  commerceReady: boolean;
  degradedReason: string | null;
}

/**
 * Check if inventory sync is manually marked as broken via env flag.
 * When set, forces degraded mode regardless of actual catalog health.
 */
function isInventorySyncBroken(): boolean {
  return process.env.NEXT_PUBLIC_INVENTORY_SYNC_BROKEN === "true";
}

export function buildLiveCatalogHealth(): CatalogHealth {
  if (isInventorySyncBroken()) {
    return {
      source: "live",
      commerceReady: false,
      degradedReason: "Inventory sync is currently under maintenance. Checkout is temporarily disabled."
    };
  }

  return {
    source: "live",
    commerceReady: true,
    degradedReason: null
  };
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

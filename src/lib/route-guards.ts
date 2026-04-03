const SCAFFOLD_ADMIN_PREFIXES = [
  "/admin/customers",
  "/admin/products",
  "/admin/analytics",
  "/admin/settings"
] as const;

const SCAFFOLD_API_PREFIXES = [
  "/api/customers",
  "/api/analytics/overview"
] as const;

const STOREFRONT_API_PREFIXES = [
  "/api/orders",
  "/api/contact",
  "/api/newsletter",
  "/api/products"
] as const;

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isFaqRoute(pathname: string): boolean {
  return pathname === "/faq";
}

export function isScaffoldAdminRoute(pathname: string): boolean {
  return SCAFFOLD_ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isScaffoldApiRoute(pathname: string): boolean {
  return SCAFFOLD_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function isStorefrontApiRoute(pathname: string): boolean {
  if (pathname === "/api/orders" || pathname === "/api/orders/") {
    return true;
  }

  return STOREFRONT_API_PREFIXES
    .filter((prefix) => prefix !== "/api/orders")
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

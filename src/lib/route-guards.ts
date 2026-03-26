const SCAFFOLD_ADMIN_PREFIXES = [
  "/admin/orders",
  "/admin/customers",
  "/admin/products",
  "/admin/analytics",
  "/admin/settings"
] as const;

const SCAFFOLD_API_PREFIXES = [
  "/api/customers",
  "/api/analytics/overview",
  "/api/orders/"
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
  if (pathname === "/api/orders" || pathname === "/api/orders/") return false;
  return SCAFFOLD_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

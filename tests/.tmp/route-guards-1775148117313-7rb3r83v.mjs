const SCAFFOLD_ADMIN_PREFIXES = [
    "/admin/orders",
    "/admin/customers",
    "/admin/products",
    "/admin/analytics",
    "/admin/settings"
];
const SCAFFOLD_API_PREFIXES = [
    "/api/customers",
    "/api/analytics/overview",
    "/api/orders/"
];
export function isAdminRoute(pathname) {
    return pathname.startsWith("/admin");
}
export function isFaqRoute(pathname) {
    return pathname === "/faq";
}
export function isScaffoldAdminRoute(pathname) {
    return SCAFFOLD_ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
export function isScaffoldApiRoute(pathname) {
    if (pathname === "/api/orders" || pathname === "/api/orders/")
        return false;
    return SCAFFOLD_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

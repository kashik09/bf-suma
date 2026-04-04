import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-session";
import {
  isAdminRoute,
  isFaqRoute,
  isStorefrontApiRoute
} from "@/lib/route-guards";
import { updateSession } from "@/lib/supabase/middleware";

function isLegacyScaffoldAdminPath(pathname: string) {
  return (
    pathname === "/admin/customers" ||
    pathname.startsWith("/admin/customers/") ||
    pathname === "/admin/analytics" ||
    pathname.startsWith("/admin/analytics/") ||
    pathname === "/admin/settings" ||
    pathname.startsWith("/admin/settings/")
  );
}

function isLegacyScaffoldApiPath(pathname: string) {
  return (
    pathname === "/api/customers" ||
    pathname.startsWith("/api/customers/") ||
    pathname === "/api/analytics/overview" ||
    pathname.startsWith("/api/analytics/overview/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();
  const allowAdminScaffoldRoutes = process.env.ALLOW_ADMIN_SCAFFOLD_ROUTES === "true";
  const allowScaffoldApis = process.env.ALLOW_SCAFFOLD_API_ROUTES === "true";
  const allowFaqPage = process.env.ALLOW_FAQ_PAGE === "true";
  const isAdminLoginRoute = pathname === "/admin/login";
  const isAdminLogoutRoute = pathname === "/admin/logout";

  if (isFaqRoute(pathname) && !allowFaqPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute(pathname) && !isAdminLoginRoute && !isAdminLogoutRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);

    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminLoginRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);
    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (isAdminRoute(pathname) && isLegacyScaffoldAdminPath(pathname) && !allowAdminScaffoldRoutes) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isLegacyScaffoldApiPath(pathname) && !allowScaffoldApis) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const isCheckoutSubmitRoute = (pathname === "/api/orders" || pathname === "/api/orders/") && method === "POST";
  if (isCheckoutSubmitRoute) {
    return NextResponse.next({ request });
  }

  if (isStorefrontApiRoute(pathname) && pathname !== "/api/orders" && pathname !== "/api/orders/") {
    return NextResponse.next({ request });
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/api/:path*", "/faq"]
};

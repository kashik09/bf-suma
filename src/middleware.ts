import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-session";
import {
  isAdminRoute,
  isFaqRoute,
  isStorefrontApiRoute
} from "@/lib/route-guards";
import { updateSession } from "@/lib/supabase/middleware";

// Security headers applied to all responses
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

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
  const isAdminResetPasswordRoute = pathname === "/admin/reset-password";

  if (isFaqRoute(pathname) && !allowFaqPage) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  if (isAdminRoute(pathname) && !isAdminLoginRoute && !isAdminLogoutRoute && !isAdminResetPasswordRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);

    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Force password reset if required
    if (adminSession.mustResetPassword) {
      const resetUrl = new URL("/admin/reset-password", request.url);
      resetUrl.searchParams.set("next", pathname);
      return applySecurityHeaders(NextResponse.redirect(resetUrl));
    }
  }

  // Allow reset-password page only for sessions with mustResetPassword flag
  if (isAdminResetPasswordRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);

    if (!adminSession) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    if (!adminSession.mustResetPassword) {
      // Already has valid session, redirect to admin
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
    }
  }

  if (isAdminLoginRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);
    if (adminSession) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
    }
  }

  if (isAdminRoute(pathname) && isLegacyScaffoldAdminPath(pathname) && !allowAdminScaffoldRoutes) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
  }

  if (isLegacyScaffoldApiPath(pathname) && !allowScaffoldApis) {
    return applySecurityHeaders(NextResponse.json({ message: "Not Found" }, { status: 404 }));
  }

  const isCheckoutSubmitRoute = (pathname === "/api/orders" || pathname === "/api/orders/") && method === "POST";
  if (isCheckoutSubmitRoute) {
    const response = NextResponse.next({ request });
    return applySecurityHeaders(response);
  }

  if (isStorefrontApiRoute(pathname) && pathname !== "/api/orders" && pathname !== "/api/orders/") {
    const response = NextResponse.next({ request });
    return applySecurityHeaders(response);
  }

  const sessionResponse = await updateSession(request);
  return applySecurityHeaders(sessionResponse);
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/api/:path*", "/faq"]
};

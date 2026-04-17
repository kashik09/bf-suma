import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-session";
import {
  isAccountRoute,
  isAdminRoute,
  isFaqRoute,
  isStorefrontApiRoute
} from "@/lib/route-guards";
import { updateSession } from "@/lib/supabase/middleware";

const FLASH_REDIRECT_COOKIE = "admin_flash_redirect";
const FLASH_MAX_AGE = 60;

function setFlashRedirectCookie(response: NextResponse, path: string): void {
  // Validate path - only allow internal /admin paths
  let normalized = "/admin";
  if (path && typeof path === "string") {
    const cleaned = path.split("?")[0].split("#")[0];
    if (cleaned.startsWith("/admin") && !cleaned.includes("://") && !cleaned.includes("//")) {
      normalized = cleaned.replace(/\/+/g, "/").replace(/\.\./g, "");
      if (!normalized.startsWith("/admin")) normalized = "/admin";
    }
  }

  response.cookies.set(FLASH_REDIRECT_COOKIE, normalized, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: FLASH_MAX_AGE,
    path: "/admin"
  });
}

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

async function getSupabaseUserFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { user: null, response: NextResponse.next({ request }) };
  }

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { user, response };
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
  const isAccount = isAccountRoute(pathname);
  const isGuestOnlyAccountRoute =
    pathname === "/account/login" ||
    pathname === "/account/signup" ||
    pathname === "/account/forgot-password";
  const isPublicAccountRoute = isGuestOnlyAccountRoute || pathname === "/account/wishlist";

  if (isAccount) {
    const { user, response } = await getSupabaseUserFromRequest(request);

    if (!isPublicAccountRoute && pathname !== "/account/logout" && !user) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/account/login", request.url)));
    }

    if (isGuestOnlyAccountRoute && user) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/account/dashboard", request.url)));
    }

    return applySecurityHeaders(response);
  }

  if (isFaqRoute(pathname) && !allowFaqPage) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  if (isAdminRoute(pathname) && !isAdminLoginRoute && !isAdminLogoutRoute && !isAdminResetPasswordRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    const adminSession = await verifyAdminSessionToken(token);

    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      setFlashRedirectCookie(response, pathname);
      return applySecurityHeaders(response);
    }

    // Force password reset if required
    if (adminSession.mustResetPassword) {
      const resetUrl = new URL("/admin/reset-password", request.url);
      const response = NextResponse.redirect(resetUrl);
      setFlashRedirectCookie(response, pathname);
      return applySecurityHeaders(response);
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
      const destination = adminSession.mustResetPassword ? "/admin/reset-password" : "/admin";
      return applySecurityHeaders(NextResponse.redirect(new URL(destination, request.url)));
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
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/api/:path*"]
};

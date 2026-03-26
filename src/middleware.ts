import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isAdminRoute,
  isFaqRoute,
  isScaffoldAdminRoute,
  isScaffoldApiRoute
} from "@/lib/route-guards";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allowAdminRoutes = process.env.ALLOW_ADMIN_ROUTES === "true";
  const allowAdminScaffoldRoutes = process.env.ALLOW_ADMIN_SCAFFOLD_ROUTES === "true";
  const allowScaffoldApis = process.env.ALLOW_SCAFFOLD_API_ROUTES === "true";
  const allowFaqPage = process.env.ALLOW_FAQ_PAGE === "true";

  if (isFaqRoute(pathname) && !allowFaqPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute(pathname) && !allowAdminRoutes) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute(pathname) && isScaffoldAdminRoute(pathname) && !allowAdminScaffoldRoutes) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isScaffoldApiRoute(pathname) && !allowScaffoldApis) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/api/:path*", "/faq"]
};

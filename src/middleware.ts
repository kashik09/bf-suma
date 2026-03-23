import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const allowAdminRoutes = process.env.ALLOW_ADMIN_ROUTES === "true";

  if (isAdminRoute && !allowAdminRoutes) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/api/:path*"]
};

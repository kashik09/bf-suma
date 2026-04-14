import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const redirectUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 0,
    path: "/"
  });

  return response;
}

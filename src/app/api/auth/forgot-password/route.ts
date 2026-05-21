export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveClientIp } from "@/lib/request-ip";

const RATE_LIMIT_CONFIG = {
  endpoint: "forgot-password",
  maxRequests: 3,
  windowSeconds: 15 * 60 // 15 minutes
} as const;

export async function POST(request: NextRequest) {
  const ip = resolveClientIp(request.headers);
  const rateLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIG);

  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();
    const redirectTo = request.headers.get("origin")
      ? `${request.headers.get("origin")}/account/login`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    // Always return success to prevent email enumeration
    if (error) {
      console.error("Password reset error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

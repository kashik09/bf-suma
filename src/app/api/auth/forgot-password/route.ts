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

    // Check if user exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const userExists = users?.users?.some((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    // Use root URL - AuthHashHandler will detect #access_token and redirect appropriately
    const redirectTo = request.headers.get("origin") || undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      console.error("Password reset error:", error.message);
      return NextResponse.json({ error: "Failed to send reset email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

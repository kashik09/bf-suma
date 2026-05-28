import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST only - GET would be triggered by prefetching and log users out!
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const redirectUrl = new URL("/account/login", request.url);
  return NextResponse.redirect(redirectUrl);
}

// Redirect GET requests to dashboard (don't logout on prefetch)
export async function GET(request: Request) {
  const redirectUrl = new URL("/account/dashboard", request.url);
  return NextResponse.redirect(redirectUrl);
}

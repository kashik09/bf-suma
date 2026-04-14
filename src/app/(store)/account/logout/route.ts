import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const redirectUrl = new URL("/account/login", request.url);
  return NextResponse.redirect(redirectUrl);
}

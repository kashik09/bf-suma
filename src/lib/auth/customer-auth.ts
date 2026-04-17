"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { clearWishlist, getWishlist } from "@/lib/wishlist";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return value;
}

function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return value;
}

function getBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return browserClient;
}

function getEmailRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/account/login`;
}

async function syncWishlistAfterLogin() {
  const localSlugs = getWishlist();

  try {
    const response = await fetch("/api/account/wishlist/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: localSlugs })
    });

    if (!response.ok) return;

    // Local storage is temporary pre-auth state; account now owns canonical wishlist.
    clearWishlist();
  } catch {
    // Best effort only.
  }
}

export async function signIn(email: string, password: string) {
  const supabase = getBrowserSupabaseClient();
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (!result.error) {
    await syncWishlistAfterLogin();
  }

  return result;
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = getBrowserSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
}

export async function signOut() {
  const supabase = getBrowserSupabaseClient();
  return supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const supabase = getBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function sendPasswordReset(email: string) {
  const supabase = getBrowserSupabaseClient();
  const redirectTo = getEmailRedirectTo();

  return supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
}

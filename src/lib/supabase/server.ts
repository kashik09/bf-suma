import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  return url;
}

function resolveAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return key;
}

function resolveServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }
  return key;
}

/**
 * Custom fetch for server-side Supabase client.
 * Fresh connection each time to avoid stale TCP issues on Vercel serverless.
 */
const serverFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    cache: "no-store",
    // 30-second timeout for slow queries
    signal: AbortSignal.timeout(30000),
  });
};

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = resolveSupabaseUrl();
  const key = resolveAnonKey();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });
}

/**
 * Creates a fresh service role client for each request.
 * Avoids stale connection issues on Vercel serverless.
 */
export function createServiceRoleSupabaseClient() {
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();

  return createClient<Database>(url, key, {
    global: { fetch: serverFetch },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

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

// Singleton service role client - reused across requests
let serviceRoleClient: ReturnType<typeof createClient<Database>> | null = null;

export function createServiceRoleSupabaseClient() {
  if (serviceRoleClient) return serviceRoleClient;

  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();

  serviceRoleClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return serviceRoleClient;
}

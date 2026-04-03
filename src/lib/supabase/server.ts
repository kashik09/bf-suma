import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function resolveSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  return url;
}

function resolveServiceRoleOrAnonKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing Supabase server environment variables.");
  }
  return key;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleOrAnonKey();

  return createServerClient(url, key, {
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

export function createServiceRoleSupabaseClient() {
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleOrAnonKey();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(_: { name: string; value: string; options: CookieOptions }[]) {
        // Service-role queries do not depend on request cookies.
      }
    }
  });
}

"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

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

  browserClient = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return browserClient;
}

export async function signIn(email: string, password: string) {
  const supabase = getBrowserSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const supabase = getBrowserSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
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
  const redirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/account/login`;

  return supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
}

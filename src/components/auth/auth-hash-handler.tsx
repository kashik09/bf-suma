"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function AuthHashHandler() {
  useEffect(() => {
    async function handleAuthHash() {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      if (!hash || !hash.includes("access_token")) return;

      // Parse hash params
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken) return;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase environment variables");
        return;
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error("Failed to set session from hash:", error);
        window.location.href = "/account/login?error=session_failed";
        return;
      }

      // Full page redirect to clear hash and ensure clean navigation
      if (type === "recovery") {
        window.location.href = "/account/reset-password";
      } else if (type === "invite") {
        window.location.href = "/account/reset-password";
      } else {
        window.location.href = "/account/dashboard";
      }
    }

    handleAuthHash();
  }, []);

  return null;
}

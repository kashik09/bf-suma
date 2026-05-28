"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function AuthHashHandler() {
  const router = useRouter();

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
        router.push("/account/login?error=session_failed");
        return;
      }

      // Clear the hash from URL
      window.history.replaceState(null, "", window.location.pathname);

      // Redirect based on type
      if (type === "recovery") {
        router.push("/account/reset-password");
      } else if (type === "invite") {
        router.push("/account/set-password");
      } else {
        router.push("/account/dashboard");
      }
    }

    handleAuthHash();
  }, [router]);

  return null;
}

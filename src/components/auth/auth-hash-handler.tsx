"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function AuthHashHandler() {
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution
    if (hasRun.current) return;

    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    hasRun.current = true;

    async function handleAuthHash() {
      // Parse hash params
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken) {
        console.error("AuthHashHandler: Missing tokens in hash");
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("AuthHashHandler: Missing env vars");
        // Still redirect to reset page - user can re-request
        if (type === "recovery" || type === "invite") {
          window.location.href = "/account/forgot-password?error=config";
        }
        return;
      }

      try {
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error || !data.session) {
          console.error("AuthHashHandler: setSession failed:", error?.message);
          window.location.href = "/account/login?error=session_failed";
          return;
        }

        // Verify session is accessible before redirecting
        const { data: verifyData } = await supabase.auth.getSession();
        if (!verifyData.session) {
          console.error("AuthHashHandler: Session not persisted");
          window.location.href = "/account/login?error=session_not_persisted";
          return;
        }

        // Small delay to ensure cookies are written
        await new Promise(resolve => setTimeout(resolve, 100));

        // Success - redirect based on type
        if (type === "recovery" || type === "invite") {
          window.location.href = "/account/reset-password";
        } else {
          window.location.href = "/account/dashboard";
        }
      } catch (err) {
        console.error("AuthHashHandler: Exception:", err);
        window.location.href = "/account/login?error=auth_error";
      }
    }

    handleAuthHash();
  }, []);

  return null;
}

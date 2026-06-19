"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Turnstile script
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Render widget
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile || !TURNSTILE_SITE_KEY) {
      return;
    }

    // Small delay to ensure Turnstile is fully ready
    const timeout = setTimeout(() => {
      if (!containerRef.current || widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile!.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme,
        size
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, onVerify, onError, onExpire, theme, size]);

  // Skip rendering if no site key configured (dev mode)
  if (!TURNSTILE_SITE_KEY) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}

export function useTurnstileReset(containerRef: React.RefObject<HTMLDivElement | null>) {
  return useCallback(() => {
    const container = containerRef.current;
    if (container && typeof window !== "undefined" && window.turnstile) {
      const widgetId = container.querySelector("iframe")?.id?.replace("cf-chl-widget-", "");
      if (widgetId) {
        window.turnstile.reset(widgetId);
      }
    }
  }, [containerRef]);
}

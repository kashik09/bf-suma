"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURRENCY_CHANGE_EVENT,
  DEFAULT_CURRENCY,
  MULTI_CURRENCY_ENABLED,
  type SupportedCurrency,
  getCurrency,
  setCurrency as persistCurrency
} from "@/lib/currency";

export function useSelectedCurrency() {
  // Hooks must be called unconditionally to satisfy React's rules of hooks.
  // Start with SSR-safe default so server and hydration markup match.
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY);

  useEffect(() => {
    if (!MULTI_CURRENCY_ENABLED) return;

    function syncCurrency() {
      const next = getCurrency();
      setCurrencyState((prev) => (prev === next ? prev : next));
    }

    syncCurrency();
    window.addEventListener(CURRENCY_CHANGE_EVENT, syncCurrency as EventListener);
    window.addEventListener("storage", syncCurrency);

    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, syncCurrency as EventListener);
      window.removeEventListener("storage", syncCurrency);
    };
  }, []);

  const setCurrency = useCallback((next: SupportedCurrency) => {
    if (!MULTI_CURRENCY_ENABLED) return;
    setCurrencyState(next);
    persistCurrency(next);
  }, []);

  // When multi-currency is disabled, return default with no-op setter
  if (!MULTI_CURRENCY_ENABLED) {
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {}
    };
  }

  return {
    currency,
    setCurrency
  };
}

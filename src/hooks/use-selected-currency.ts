"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURRENCY_CHANGE_EVENT,
  type SupportedCurrency,
  getCurrency,
  setCurrency as persistCurrency
} from "@/lib/currency";

export function useSelectedCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getCurrency);

  useEffect(() => {
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
    setCurrencyState(next);
    persistCurrency(next);
  }, []);

  return {
    currency,
    setCurrency
  };
}

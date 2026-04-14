"use client";

import { useEffect, useState } from "react";
import {
  CURRENCY_CHANGE_EVENT,
  type SupportedCurrency,
  getCurrency,
  setCurrency
} from "@/lib/currency";

export function useSelectedCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("UGX");

  useEffect(() => {
    function syncCurrency() {
      setCurrencyState(getCurrency());
    }

    syncCurrency();
    window.addEventListener(CURRENCY_CHANGE_EVENT, syncCurrency as EventListener);
    window.addEventListener("storage", syncCurrency);
    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, syncCurrency as EventListener);
      window.removeEventListener("storage", syncCurrency);
    };
  }, []);

  return {
    currency,
    setCurrency
  };
}

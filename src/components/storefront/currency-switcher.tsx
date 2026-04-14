"use client";

import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency";
import { useSelectedCurrency } from "@/hooks/use-selected-currency";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useSelectedCurrency();

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700">
      <span className="hidden sm:inline">Currency</span>
      <select
        aria-label="Select display currency"
        className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as SupportedCurrency)}
      >
        {SUPPORTED_CURRENCIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

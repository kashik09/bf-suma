import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatPrice, DEFAULT_CURRENCY } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORE_CURRENCY = "UGX" as const;

const CURRENCY_FRACTION_DIGITS: Record<string, number> = {
  KES: 0,
  UGX: 0,
  USD: 2
};

function getCurrencyFractionDigits(currency: string): number {
  return CURRENCY_FRACTION_DIGITS[currency] ?? 2;
}

export function toMinorUnits(amountMajor: number, currency: string = STORE_CURRENCY) {
  const fractionDigits = getCurrencyFractionDigits(currency);
  const multiplier = 10 ** fractionDigits;
  return Math.round(amountMajor * multiplier);
}

export function fromMinorUnits(amountMinor: number, currency: string = STORE_CURRENCY) {
  const fractionDigits = getCurrencyFractionDigits(currency);
  const divisor = 10 ** fractionDigits;
  return amountMinor / divisor;
}

/**
 * Format currency for display. Delegates to formatPrice from currency.ts.
 * @deprecated Use formatPrice from @/lib/currency instead for new code.
 */
export function formatCurrency(amountMinor: number, currency: string = STORE_CURRENCY) {
  return formatPrice(amountMinor, currency || DEFAULT_CURRENCY);
}

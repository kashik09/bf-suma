import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORE_CURRENCY = "UGX" as const;

const CURRENCY_FRACTION_DIGITS: Record<string, number> = {
  KES: 2,
  UGX: 0
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

export function formatCurrency(amountMinor: number, currency: string = STORE_CURRENCY) {
  const fractionDigits = getCurrencyFractionDigits(currency);

  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(fromMinorUnits(amountMinor, currency));
}

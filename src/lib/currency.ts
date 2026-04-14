export const SUPPORTED_CURRENCIES = ["UGX", "USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_STORAGE_KEY = "storefront-currency";
export const CURRENCY_CHANGE_EVENT = "storefront-currency-changed";
const DEFAULT_CURRENCY: SupportedCurrency = "UGX";

const FRACTION_DIGITS: Record<string, number> = {
  UGX: 0,
  USD: 2,
  KES: 2
};

// Fallback exchange table for display-only conversion when base prices are in KES.
const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  UGX: 1 / 4464,
  KES: 13 / 2054
};

function getFractionDigits(currency: string): number {
  return FRACTION_DIGITS[currency] ?? 2;
}

function toMajorUnits(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** getFractionDigits(currency);
}

function toMinorUnits(amountMajor: number, currency: string): number {
  return Math.round(amountMajor * 10 ** getFractionDigits(currency));
}

export function formatPrice(amount: number, currency: string): string {
  const fractionDigits = getFractionDigits(currency);

  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(toMajorUnits(amount, currency));
}

export function convertPrice(amountMinor: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amountMinor;

  const fromRate = USD_PER_UNIT[fromCurrency];
  const toRate = USD_PER_UNIT[toCurrency];
  if (!fromRate || !toRate) return amountMinor;

  const amountInUsd = toMajorUnits(amountMinor, fromCurrency) * fromRate;
  const convertedMajor = amountInUsd / toRate;
  return toMinorUnits(convertedMajor, toCurrency);
}

export function getCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (value === "UGX" || value === "USD") return value;
  return DEFAULT_CURRENCY;
}

export function setCurrency(currency: string): void {
  if (typeof window === "undefined") return;
  if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) return;

  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: { currency } }));
}

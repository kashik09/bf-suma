export const SUPPORTED_CURRENCIES = ["UGX", "USD", "KES"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

const CURRENCY_STORAGE_KEY = "storefront-currency";
export const CURRENCY_CHANGE_EVENT = "storefront-currency-changed";
const DEFAULT_CURRENCY: SupportedCurrency = "UGX";
const UGX_PER_USD = 4464;
const KES_PER_USD = 129;

const FRACTION_DIGITS: Record<string, number> = {
  UGX: 0,
  USD: 2,
  KES: 0
};

function normalizeCurrency(currency: string): SupportedCurrency | null {
  if (currency === "UGX" || currency === "USD" || currency === "KES") return currency;
  return null;
}

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
  const normalized = normalizeCurrency(currency);
  const targetCurrency = normalized || DEFAULT_CURRENCY;
  const fractionDigits = getFractionDigits(targetCurrency);
  const amountMajor = toMajorUnits(amount, targetCurrency);

  if (targetCurrency === "KES") {
    const formatted = new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amountMajor);

    return `KSh ${formatted}`;
  }

  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: targetCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amountMajor);
}

export function convertPrice(amountMinor: number, fromCurrency: string, toCurrency: string): number {
  const source = normalizeCurrency(fromCurrency);
  const target = normalizeCurrency(toCurrency);
  if (!source || !target) return amountMinor;
  if (source === target) return amountMinor;

  const amountMajor = toMajorUnits(amountMinor, source);

  let amountInUgx: number;
  if (source === "UGX") amountInUgx = amountMajor;
  else if (source === "USD") amountInUgx = amountMajor * UGX_PER_USD;
  else amountInUgx = amountMajor * (UGX_PER_USD / KES_PER_USD);

  let convertedMajor: number;
  if (target === "UGX") convertedMajor = amountInUgx;
  else if (target === "USD") convertedMajor = amountInUgx / UGX_PER_USD;
  else convertedMajor = amountInUgx * (KES_PER_USD / UGX_PER_USD);

  return toMinorUnits(convertedMajor, target);
}

export function getCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (value === "UGX" || value === "USD" || value === "KES") return value;
  return DEFAULT_CURRENCY;
}

export function setCurrency(currency: string): void {
  if (typeof window === "undefined") return;
  if (!SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) return;

  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: { currency } }));
}

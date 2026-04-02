import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const STORE_CURRENCY = "KES";
const CURRENCY_FRACTION_DIGITS = {
    KES: 2,
    UGX: 0
};
function getCurrencyFractionDigits(currency) {
    return CURRENCY_FRACTION_DIGITS[currency] ?? 2;
}
export function toMinorUnits(amountMajor, currency = STORE_CURRENCY) {
    const fractionDigits = getCurrencyFractionDigits(currency);
    const multiplier = 10 ** fractionDigits;
    return Math.round(amountMajor * multiplier);
}
export function fromMinorUnits(amountMinor, currency = STORE_CURRENCY) {
    const fractionDigits = getCurrencyFractionDigits(currency);
    const divisor = 10 ** fractionDigits;
    return amountMinor / divisor;
}
export function formatCurrency(amountMinor, currency = STORE_CURRENCY) {
    const fractionDigits = getCurrencyFractionDigits(currency);
    return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(fromMinorUnits(amountMinor, currency));
}

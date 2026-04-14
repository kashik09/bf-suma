"use client";

import { useSelectedCurrency } from "@/hooks/use-selected-currency";
import { convertPrice, formatPrice } from "@/lib/currency";

interface AccountAmountProps {
  amountMinor: number;
  currency: string;
  className?: string;
}

export function AccountAmount({ amountMinor, currency, className }: AccountAmountProps) {
  const { currency: selectedCurrency } = useSelectedCurrency();
  const converted = convertPrice(amountMinor, currency, selectedCurrency);

  return (
    <span className={className}>{formatPrice(converted, selectedCurrency)}</span>
  );
}

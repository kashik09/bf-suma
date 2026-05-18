"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  ChevronRight,
  MessageCircle,
  Truck,
  MapPin,
  Banknote,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  productName: string;
  quantity: number;
  lineTotal: number;
}

interface ConfirmationWizardProps {
  orderNumber: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  currency: string;
  items: OrderItem[];
  fulfillmentType: "delivery" | "pickup";
  deliveryAddress: string;
  pickupAddress: string;
  mtnTill: string;
  airtelTill: string;
  mtnWaUrl: string;
  airtelWaUrl: string;
  cashWaUrl: string;
  helpWaUrl: string;
  showCashOption: boolean;
  supportPhone: string;
  supportPhoneDisplay: string;
  supportPhoneSecondary: string;
  supportPhoneSecondaryDisplay: string;
  supportEmail: string;
  customerEmail: string;
}

type PaymentMethod = "mtn" | "airtel" | "cash" | null;

export function ConfirmationWizard({
  orderNumber,
  total,
  subtotal,
  deliveryFee,
  currency,
  items,
  fulfillmentType,
  deliveryAddress,
  pickupAddress,
  mtnTill,
  airtelTill,
  mtnWaUrl,
  airtelWaUrl,
  cashWaUrl,
  showCashOption,
  supportPhone,
  supportPhoneDisplay,
  supportPhoneSecondary,
  supportPhoneSecondaryDisplay,
  supportEmail
}: ConfirmationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [copiedTill, setCopiedTill] = useState<string | null>(null);

  const totalFormatted = formatCurrency(total, currency);
  const totalSteps = 4;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTill(type);
      setTimeout(() => setCopiedTill(null), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const getWhatsAppUrl = () => {
    switch (selectedPayment) {
      case "mtn":
        return mtnWaUrl;
      case "airtel":
        return airtelWaUrl;
      case "cash":
        return cashWaUrl;
      default:
        return mtnWaUrl;
    }
  };

  const getPaymentLabel = () => {
    switch (selectedPayment) {
      case "mtn":
        return "MTN MoMo";
      case "airtel":
        return "Airtel Money";
      case "cash":
        return "Cash on Arrival";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-slate-200" />
          {/* Progress line */}
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-green-500 transition-all duration-300"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
          {/* Step circles */}
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                    ? "bg-brand-600 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Confirmed</span>
          <span>Payment</span>
          <span>Confirm</span>
          <span>Done</span>
        </div>
      </div>

      {/* Step 1: Order Confirmed */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Order Received!</h1>
            <p className="mt-2 text-slate-600">
              Reference: <span className="font-semibold text-slate-900">{orderNumber}</span>
            </p>
          </div>

          <Card>
            <h2 className="mb-3 font-semibold text-slate-900">Order Summary</h2>
            <ul className="space-y-2 text-sm">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between text-slate-700">
                  <span>{item.quantity} × {item.productName}</span>
                  <span className="font-medium">{formatCurrency(item.lineTotal, currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{fulfillmentType === "pickup" ? "Pickup" : "Delivery"}</span>
                <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee, currency)}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>{totalFormatted}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              {fulfillmentType === "pickup" ? (
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              ) : (
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {fulfillmentType === "pickup" ? "Pickup at" : "Delivering to"}
                </p>
                <p className="text-sm text-slate-600">
                  {fulfillmentType === "pickup" ? pickupAddress : deliveryAddress}
                </p>
              </div>
            </div>
          </Card>

          <Button className="w-full" onClick={() => setStep(2)}>
            Continue to Payment
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 2: Choose Payment Method */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </button>
            <h1 className="text-xl font-bold text-slate-900">Choose Payment Method</h1>
            <p className="mt-1 text-slate-600">
              Pay <span className="font-semibold">{totalFormatted}</span> using one of these options
            </p>
          </div>

          <div className="space-y-3">
            {/* MTN Option */}
            <button
              onClick={() => setSelectedPayment("mtn")}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                selectedPayment === "mtn"
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Image src="/payment-logos/mtn.png" alt="MTN MoMo" width={48} height={48} className="shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">MTN MoMo</p>
                <p className="text-sm text-slate-500">Mobile Money</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  selectedPayment === "mtn"
                    ? "border-brand-500 bg-brand-500"
                    : "border-slate-300"
                }`}
              >
                {selectedPayment === "mtn" && <Check className="h-4 w-4 text-white" />}
              </div>
            </button>

            {/* Airtel Option */}
            <button
              onClick={() => setSelectedPayment("airtel")}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                selectedPayment === "airtel"
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Image src="/payment-logos/airtel.png" alt="Airtel Money" width={48} height={48} className="shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">Airtel Money</p>
                <p className="text-sm text-slate-500">Mobile Money</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  selectedPayment === "airtel"
                    ? "border-brand-500 bg-brand-500"
                    : "border-slate-300"
                }`}
              >
                {selectedPayment === "airtel" && <Check className="h-4 w-4 text-white" />}
              </div>
            </button>

            {/* Cash Option */}
            {showCashOption && (
              <button
                onClick={() => setSelectedPayment("cash")}
                className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                  selectedPayment === "cash"
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <Banknote className="h-6 w-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Cash on Arrival</p>
                  <p className="text-sm text-slate-500">
                    {fulfillmentType === "pickup" ? "Pay when you pick up" : "Pay on delivery"}
                  </p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    selectedPayment === "cash"
                      ? "border-brand-500 bg-brand-500"
                      : "border-slate-300"
                  }`}
                >
                  {selectedPayment === "cash" && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>
            )}
          </div>

          {/* Show till number for MoMo */}
          {(selectedPayment === "mtn" || selectedPayment === "airtel") && (
            <Card className="border-brand-200 bg-brand-50">
              <p className="text-sm font-medium text-slate-700">
                Send <span className="font-bold text-slate-900">{totalFormatted}</span> to:
              </p>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-3">
                <div>
                  <p className="text-xs text-slate-500">
                    {selectedPayment === "mtn" ? "MTN MoMo" : "Airtel Money"} Till Number
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedPayment === "mtn" ? mtnTill : airtelTill}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    selectedPayment === "mtn" ? mtnTill : airtelTill,
                    selectedPayment
                  )}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  {copiedTill === selectedPayment ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          <Button
            className="w-full"
            disabled={!selectedPayment}
            onClick={() => setStep(3)}
          >
            {selectedPayment === "cash" ? "Continue" : "I've Sent the Payment"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 3: Confirm on WhatsApp */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setStep(2)}
              className="mb-4 flex items-center text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </button>
            <h1 className="text-xl font-bold text-slate-900">
              {selectedPayment === "cash" ? "Confirm Your Order" : "Confirm Your Payment"}
            </h1>
            <p className="mt-1 text-slate-600">
              {selectedPayment === "cash"
                ? fulfillmentType === "pickup"
                  ? "Let us know you'll pay cash at pickup"
                  : "Let us know you'll pay cash on delivery"
                : "Send us your payment confirmation on WhatsApp"}
            </p>
          </div>

          <Card className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="mb-4 text-sm text-slate-600">
              {selectedPayment === "cash"
                ? `Tap below to confirm you'll pay cash at ${fulfillmentType === "pickup" ? "pickup" : "delivery"}`
                : "Tap the button below to send your payment details"}
            </p>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(() => setStep(4), 500)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" />
              Open WhatsApp
            </a>
            <p className="mt-3 text-xs text-slate-500">
              Opens WhatsApp with your {getPaymentLabel()} details pre-filled
            </p>
          </Card>

          <button
            onClick={() => setStep(4)}
            className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Skip for now →
          </button>
        </div>
      )}

      {/* Step 4: All Done */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">You're All Set!</h1>
            <p className="mt-2 text-slate-600">
              Order <span className="font-semibold">{orderNumber}</span>
            </p>
          </div>

          <Card>
            <h2 className="mb-3 font-semibold text-slate-900">What happens next?</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  1
                </div>
                <p className="text-sm text-slate-700">
                  {selectedPayment === "cash"
                    ? "We'll confirm your order via WhatsApp"
                    : "We'll verify your payment"}
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  2
                </div>
                <p className="text-sm text-slate-700">
                  {fulfillmentType === "pickup"
                    ? "We'll notify you when ready for pickup"
                    : "We'll prepare your order for delivery"}
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  3
                </div>
                <p className="text-sm text-slate-700">
                  {fulfillmentType === "pickup"
                    ? "Pick up at our store location"
                    : "Receive your delivery at your address"}
                </p>
              </li>
            </ol>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              {fulfillmentType === "pickup" ? (
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              ) : (
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {fulfillmentType === "pickup" ? "Pickup Location" : "Delivery Address"}
                </p>
                <p className="text-sm text-slate-600">
                  {fulfillmentType === "pickup" ? pickupAddress : deliveryAddress}
                </p>
              </div>
            </div>
          </Card>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Questions? Contact us:</p>
            <ul className="mt-2 space-y-1">
              <li>
                <a href={`tel:${supportPhone}`} className="font-medium text-brand-700 hover:underline">
                  {supportPhoneDisplay}
                </a>
              </li>
              <li>
                <a href={`tel:${supportPhoneSecondary}`} className="font-medium text-brand-700 hover:underline">
                  {supportPhoneSecondaryDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${supportEmail}`} className="font-medium text-brand-700 hover:underline">
                  {supportEmail}
                </a>
              </li>
            </ul>
          </div>

          <Link
            href="/shop"
            className="block w-full rounded-lg border border-slate-200 bg-white py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

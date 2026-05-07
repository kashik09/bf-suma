import { notFound } from "next/navigation";
import { CheckCircle, MessageCircle, Truck, MapPin, Banknote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui";
import { CONTACT, ADDRESS } from "@/config/contact";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  buildWhatsAppMtnPaymentMessage,
  buildWhatsAppAirtelPaymentMessage,
  buildWhatsAppCashPaymentMessage,
  type PaymentConfirmationOrder
} from "@/lib/whatsapp";
import { getOrderByNumberForConfirmation } from "@/services/orders";
import { EmailReceiptForm } from "./email-receipt-form";

type Params = Promise<{ orderNumber: string }>;

export default async function OrderConfirmationPage({
  params
}: {
  params: Params;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumberForConfirmation(orderNumber);

  if (!order) {
    notFound();
  }

  const totalFormatted = formatCurrency(order.total, order.currency);

  // Build payment confirmation order object
  const paymentOrder: PaymentConfirmationOrder = {
    orderNumber: order.orderNumber,
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName
    },
    total: order.total,
    currency: order.currency,
    fulfillmentType: order.fulfillmentType,
    deliveryAddress: order.deliveryAddress ?? ""
  };

  // Build 3 payment-method-specific WhatsApp URLs
  const mtnWaUrl = buildWhatsAppUrl(
    buildWhatsAppMtnPaymentMessage(paymentOrder, totalFormatted),
    CONTACT.whatsappPrimary
  );
  const airtelWaUrl = buildWhatsAppUrl(
    buildWhatsAppAirtelPaymentMessage(paymentOrder, totalFormatted),
    CONTACT.whatsappPrimary
  );
  const cashWaUrl = buildWhatsAppUrl(
    buildWhatsAppCashPaymentMessage(paymentOrder, totalFormatted),
    CONTACT.whatsappPrimary
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Order Received!</h1>
        <p className="mt-2 text-lg text-slate-600">
          Reference: <span className="font-semibold text-slate-900">{order.orderNumber}</span>
        </p>
      </div>

      {/* What Happens Next - 3 Steps */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">What happens next?</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              1
            </div>
            <div>
              <p className="font-medium text-slate-900">Pay via Mobile Money</p>
              <p className="text-sm text-slate-600">
                Send <span className="font-semibold">{totalFormatted}</span> to one of the till numbers below.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              2
            </div>
            <div>
              <p className="font-medium text-slate-900">Confirm on WhatsApp</p>
              <p className="text-sm text-slate-600">
                After paying, tap the button below to message us your payment confirmation.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              3
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {order.fulfillmentType === "pickup" ? "Pick up your order" : "Receive your delivery"}
              </p>
              <p className="text-sm text-slate-600">
                {order.fulfillmentType === "pickup"
                  ? "We'll confirm when your order is ready for pickup."
                  : "We'll deliver to your address once payment is confirmed."}
              </p>
            </div>
          </li>
        </ol>
      </Card>

      {/* Payment Card - Merged */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Pay before pickup or delivery</h2>
        </div>

        {/* Amount */}
        <p className="mb-2 text-sm text-slate-600">
          Send exactly <span className="font-semibold text-slate-900">{totalFormatted}</span> to one of the till numbers below.
        </p>

        {/* Items summary */}
        <p className="mb-4 text-sm text-slate-500">
          For:{" "}
          {order.items.length <= 3
            ? order.items.map((item, i) => (
                <span key={i}>
                  {item.productName} (×{item.quantity})
                  {i < order.items.length - 1 ? ", " : ""}
                </span>
              ))
            : <>
                {order.items.slice(0, 3).map((item, i) => (
                  <span key={i}>
                    {item.productName} (×{item.quantity})
                    {i < 2 ? ", " : ""}
                  </span>
                ))}
                {" "}and {order.items.length - 3} more
              </>
          }
        </p>

        {/* Till numbers */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Airtel Money</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{CONTACT.airtelTill}</p>
            <p className="mt-1 text-sm text-slate-600">Till Number</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">MTN MoMo</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{CONTACT.mtnTill}</p>
            <p className="mt-1 text-sm text-slate-600">Till Number</p>
          </div>
        </div>

        {/* Payment method buttons */}
        <p className="mb-3 font-medium text-slate-700">Choose your payment method:</p>
        <div className="grid gap-3">
          <a
            href={mtnWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm"
          >
            <Image src="/payment-logos/mtn.png" alt="MTN MoMo" width={48} height={48} className="shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">MTN MoMo</p>
              <p className="text-sm text-slate-500">Mobile Money</p>
            </div>
            <MessageCircle className="h-5 w-5 shrink-0 text-slate-400" />
          </a>
          <a
            href={airtelWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm"
          >
            <Image src="/payment-logos/airtel.png" alt="Airtel Money" width={48} height={48} className="shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Airtel Money</p>
              <p className="text-sm text-slate-500">Mobile Money</p>
            </div>
            <MessageCircle className="h-5 w-5 shrink-0 text-slate-400" />
          </a>
          <a
            href={cashWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Banknote className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Cash on Arrival</p>
              <p className="text-sm text-slate-500">Pay when you receive</p>
            </div>
            <MessageCircle className="h-5 w-5 shrink-0 text-slate-400" />
          </a>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Tapping a button opens WhatsApp with your payment details.
        </p>
      </Card>

      {/* Fulfillment Info */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          {order.fulfillmentType === "pickup" ? (
            <MapPin className="h-5 w-5 text-slate-500" />
          ) : (
            <Truck className="h-5 w-5 text-slate-500" />
          )}
          <h2 className="text-lg font-semibold text-slate-900">
            {order.fulfillmentType === "pickup" ? "Pickup Location" : "Delivery Address"}
          </h2>
        </div>
        {order.fulfillmentType === "pickup" ? (
          <div>
            <p className="text-slate-700">{ADDRESS.full}</p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(ADDRESS.full)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              View on Google Maps →
            </a>
          </div>
        ) : (
          <div>
            <p className="text-slate-700">{order.deliveryAddress}</p>
            <p className="mt-2 text-sm text-slate-500">
              Same-day delivery for orders within Kampala CBD placed before 12 PM.<br />
              Other locations: 24–48 hours.
            </p>
          </div>
        )}
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Order Summary</h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.quantity} × {item.productName}</span>
              <span className="font-medium">{formatCurrency(item.lineTotal, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{totalFormatted}</span>
        </div>
      </Card>

      {/* Email Receipt Form */}
      <Card className="mb-6">
        <EmailReceiptForm orderNumber={order.orderNumber} defaultEmail={order.customer.email} />
      </Card>

      {/* Need Help Section */}
      <Card className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Need help?</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Help with order ${order.orderNumber}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Email us
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsappPrimary}?text=${encodeURIComponent(`Hi! I need help with my order ${order.orderNumber}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp us
          </a>
        </div>
      </Card>

      {/* Back to Shop */}
      <div className="text-center">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

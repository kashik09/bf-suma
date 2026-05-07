import { notFound } from "next/navigation";
import { CheckCircle, MessageCircle, CreditCard, Truck, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { CONTACT, ADDRESS } from "@/config/contact";
import { formatCurrency } from "@/lib/utils";
import { buildWhatsAppUrl, buildWhatsAppPaymentConfirmationMessage } from "@/lib/whatsapp";
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
  const whatsAppMessage = buildWhatsAppPaymentConfirmationMessage(order.orderNumber, totalFormatted);
  const whatsAppUrl = buildWhatsAppUrl(whatsAppMessage, CONTACT.whatsappPrimary);

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

      {/* Till Numbers */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Send exactly <span className="font-semibold text-slate-900">{totalFormatted}</span> to:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
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
      </Card>

      {/* WhatsApp Confirmation Button */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Confirm Payment</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          After sending your payment, tap the button below to notify us on WhatsApp.
        </p>
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          <MessageCircle className="h-5 w-5" />
          Confirm Payment on WhatsApp
        </a>
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
          <p className="text-slate-700">{order.deliveryAddress}</p>
        )}
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
        <div className="divide-y divide-slate-100">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between py-2">
              <div>
                <p className="text-slate-900">{item.productName}</p>
                <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-slate-900">
                {formatCurrency(item.lineTotal, order.currency)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="text-slate-900">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Delivery</span>
            <span className="text-slate-900">
              {order.deliveryFee === 0 ? "Free" : formatCurrency(order.deliveryFee, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-slate-900">Total</span>
            <span className="text-slate-900">{totalFormatted}</span>
          </div>
        </div>
      </Card>

      {/* Email Receipt Form */}
      <Card className="mb-6">
        <EmailReceiptForm orderNumber={order.orderNumber} defaultEmail={order.customer.email} />
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

import { notFound } from "next/navigation";
import { CONTACT, ADDRESS } from "@/config/contact";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  buildWhatsAppMtnPaymentMessage,
  buildWhatsAppAirtelPaymentMessage,
  buildWhatsAppCashPaymentMessage,
  buildWhatsAppOrderHelpMessage,
  type PaymentConfirmationOrder,
  type OrderHelpOrder
} from "@/lib/whatsapp";
import { getOrderByNumberForConfirmation } from "@/services/orders";
import { ConfirmationWizard } from "@/components/storefront/confirmation-wizard";

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

  // Build order help WhatsApp URL
  const helpOrder: OrderHelpOrder = {
    ...paymentOrder,
    createdAt: order.createdAt
  };
  const helpWaUrl = buildWhatsAppUrl(
    buildWhatsAppOrderHelpMessage(helpOrder, totalFormatted),
    CONTACT.whatsappPrimary
  );

  // Cash payment only available for pickup or central Kampala delivery
  const showCashOption =
    order.fulfillmentType === "pickup" ||
    (order.fulfillmentType === "delivery" && order.deliveryZone === "central");

  return (
    <ConfirmationWizard
      orderNumber={order.orderNumber}
      total={order.total}
      subtotal={order.subtotal}
      deliveryFee={order.deliveryFee}
      currency={order.currency}
      items={order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        lineTotal: item.lineTotal
      }))}
      fulfillmentType={order.fulfillmentType}
      deliveryAddress={order.deliveryAddress}
      pickupAddress={ADDRESS.full}
      mtnTill={CONTACT.mtnTill}
      airtelTill={CONTACT.airtelTill}
      mtnWaUrl={mtnWaUrl}
      airtelWaUrl={airtelWaUrl}
      cashWaUrl={cashWaUrl}
      helpWaUrl={helpWaUrl}
      showCashOption={showCashOption}
      supportPhone={CONTACT.whatsappPrimary}
      supportPhoneDisplay={CONTACT.whatsappPrimaryDisplay}
      supportPhoneSecondary={CONTACT.whatsappSecondary}
      supportPhoneSecondaryDisplay={CONTACT.whatsappSecondaryDisplay}
      supportEmail={SUPPORT_EMAIL}
      customerEmail={order.customer.email}
    />
  );
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";
import { getOrderByNumberForConfirmation } from "@/services/orders";

const requestSchema = z.object({
  orderNumber: z.string().min(1),
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    const { orderNumber, email } = parsed.data;
    const order = await getOrderByNumberForConfirmation(orderNumber);

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow resending to the original customer email for security
    if (order.customer.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { message: "Email does not match order" },
        { status: 403 }
      );
    }

    const result = await sendOrderConfirmationEmail({
      email: order.customer.email,
      firstName: order.customer.firstName,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      currency: order.currency,
      deliveryAddress: order.deliveryAddress,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
      })),
      estimatedDeliveryWindow: order.fulfillmentType === "pickup"
        ? "Ready for pickup within 24 hours"
        : "2-3 business days"
    });

    if (result.status === "failed") {
      return NextResponse.json(
        { message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "sent" });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

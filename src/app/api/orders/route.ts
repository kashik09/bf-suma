import { NextResponse } from "next/server";
import { orderIntakeSchema } from "@/lib/validation";
import { createOrderIntake } from "@/services/orders";

export async function GET() {
  return NextResponse.json({ message: "Order intake endpoint ready" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = orderIntakeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid checkout payload",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const result = await createOrderIntake(parsed.data);
    const isPickup = parsed.data.fulfillmentType === "pickup";
    const successMessage = parsed.data.paymentMethod === "pay_now"
      ? `Thanks, your order ${result.orderNumber} has been received. We will contact you immediately to complete payment.`
      : isPickup
        ? `Thanks, your order ${result.orderNumber} has been received. You can pay at pickup.`
        : `Thanks, your order ${result.orderNumber} has been received. You can pay on delivery.`;

    return NextResponse.json(
      {
        persisted: true,
        orderNumber: result.orderNumber,
        receivedAt: result.receivedAt,
        message: successMessage
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        persisted: false,
        message: "We couldn't place your order right now. Please try again in a moment."
      },
      { status: 503 }
    );
  }
}

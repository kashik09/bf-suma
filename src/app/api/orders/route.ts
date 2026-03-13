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

    return NextResponse.json(
      {
        persisted: true,
        orderNumber: result.orderNumber,
        receivedAt: result.receivedAt,
        message: `Order ${result.orderNumber} saved successfully.`
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        persisted: false,
        message: "Order intake is temporarily unavailable. Your order was not saved."
      },
      { status: 503 }
    );
  }
}

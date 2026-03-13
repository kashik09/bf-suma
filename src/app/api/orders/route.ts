import { NextResponse } from "next/server";
import { orderIntakeSchema } from "@/lib/validation";

function generateOrderNumber() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `BFS-${yyyy}${mm}${dd}-${suffix}`;
}

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

  return NextResponse.json({
    orderNumber: generateOrderNumber(),
    receivedAt: new Date().toISOString(),
    message: "Order intake received. Payment confirmation is handled manually in this phase."
  });
}

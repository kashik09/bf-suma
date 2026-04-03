import { NextResponse } from "next/server";
import { z } from "zod";
import { orderStatusUpdateRequestSchema } from "@/lib/validation";
import {
  getOrderDetailForAdmin,
  OrderNotFoundError,
  OrderStatusConflictError,
  OrderStatusTransitionError,
  updateOrderStatus
} from "@/services/orders";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid order id.")
});

function isAdminOrdersAccessEnabled(): boolean {
  return process.env.ALLOW_ADMIN_ROUTES === "true";
}

async function parseOrderId(params: Promise<{ id: string }>): Promise<{ id: string } | null> {
  const resolved = await params;
  const parsed = paramsSchema.safeParse(resolved);
  if (!parsed.success) return null;
  return parsed.data;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminOrdersAccessEnabled()) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const parsedParams = await parseOrderId(params);
  if (!parsedParams) {
    return NextResponse.json({ message: "Invalid order id." }, { status: 400 });
  }

  try {
    const detail = await getOrderDetailForAdmin(parsedParams.id);
    if (!detail) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(detail, { status: 200 });
  } catch (error) {
    console.error("order.get_failed", error);
    return NextResponse.json(
      { message: "Order retrieval is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminOrdersAccessEnabled()) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const parsedParams = await parseOrderId(params);
  if (!parsedParams) {
    return NextResponse.json({ message: "Invalid order id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = orderStatusUpdateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid order status update payload.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const result = await updateOrderStatus(parsedParams.id, parsed.data.status, {
      changedBy: parsed.data.changedBy || "admin_api",
      note: parsed.data.note
    });

    return NextResponse.json(
      {
        changed: result.changed,
        order: result.order
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (error instanceof OrderStatusTransitionError) {
      return NextResponse.json(
        {
          message: error.message,
          currentStatus: error.currentStatus,
          requestedStatus: error.requestedStatus
        },
        { status: 409 }
      );
    }

    if (error instanceof OrderStatusConflictError) {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }

    console.error("order.patch_failed", error);
    return NextResponse.json(
      { message: "Order status update is temporarily unavailable." },
      { status: 503 }
    );
  }
}

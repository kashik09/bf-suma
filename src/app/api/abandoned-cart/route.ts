export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteAbandonedCartByEmail,
  upsertAbandonedCart
} from "@/services/abandoned-carts";

const cartItemSchema = z.object({
  product_id: z.string().min(1),
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  slug: z.string().optional()
});

const upsertSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().trim().max(120).optional(),
  cartItems: z.array(cartItemSchema)
});

const deleteSchema = z.object({
  customerEmail: z.string().email()
});

function lifecycleEnabled() {
  return process.env.LIFECYCLE_EMAILS_ENABLED === "true";
}

export async function POST(request: Request) {
  if (!lifecycleEnabled()) {
    return NextResponse.json({ ok: true, skipped: "lifecycle_emails_disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid cart sync payload." },
      { status: 400 }
    );
  }

  try {
    await upsertAbandonedCart({
      customerEmail: parsed.data.customerEmail,
      customerName: parsed.data.customerName,
      cartItems: parsed.data.cartItems
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Cart sync is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!lifecycleEnabled()) {
    return NextResponse.json({ ok: true, skipped: "lifecycle_emails_disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid cart clear payload." },
      { status: 400 }
    );
  }

  try {
    await deleteAbandonedCartByEmail(parsed.data.customerEmail);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Cart clear is temporarily unavailable." },
      { status: 503 }
    );
  }
}

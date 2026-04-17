import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  addToCustomerWishlist,
  ensureWishlistCustomerByEmail,
  getCustomerWishlist,
  removeFromCustomerWishlist
} from "@/services/wishlist";

export const dynamic = "force-dynamic";

const wishlistPayloadSchema = z.object({
  slug: z.string().trim().min(1).max(160)
});

function customerNameFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return { firstName: "", lastName: "" };
  }

  const data = metadata as { first_name?: unknown; last_name?: unknown };
  const firstName = typeof data.first_name === "string" ? data.first_name : "";
  const lastName = typeof data.last_name === "string" ? data.last_name : "";
  return { firstName, lastName };
}

async function resolveAuthenticatedCustomerId() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { firstName, lastName } = customerNameFromMetadata(user.user_metadata);
  const customerId = await ensureWishlistCustomerByEmail({
    email: user.email,
    firstName,
    lastName
  });

  return customerId;
}

export async function GET() {
  try {
    const customerId = await resolveAuthenticatedCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Please sign in to view your wishlist." }, { status: 401 });
    }

    const slugs = await getCustomerWishlist(customerId);
    return NextResponse.json({ slugs });
  } catch (error) {
    console.error("[api/account/wishlist] GET failed", error);
    return NextResponse.json({ message: "Unable to load wishlist right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customerId = await resolveAuthenticatedCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Please sign in to update your wishlist." }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    const parsed = wishlistPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid wishlist slug." }, { status: 400 });
    }

    await addToCustomerWishlist(customerId, parsed.data.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/account/wishlist] POST failed", error);
    return NextResponse.json({ message: "Unable to update wishlist right now." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const customerId = await resolveAuthenticatedCustomerId();
    if (!customerId) {
      return NextResponse.json({ message: "Please sign in to update your wishlist." }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
    }

    const parsed = wishlistPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid wishlist slug." }, { status: 400 });
    }

    await removeFromCustomerWishlist(customerId, parsed.data.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/account/wishlist] DELETE failed", error);
    return NextResponse.json({ message: "Unable to update wishlist right now." }, { status: 500 });
  }
}

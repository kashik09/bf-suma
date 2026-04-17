import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ensureWishlistCustomerByEmail,
  getCustomerWishlist,
  syncLocalWishlistToAccount
} from "@/services/wishlist";

export const dynamic = "force-dynamic";

const syncPayloadSchema = z.object({
  slugs: z.array(z.string().trim().min(1).max(160)).default([])
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

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ message: "Please sign in to sync wishlist." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const parsed = syncPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid wishlist data." }, { status: 400 });
  }

  try {
    const { firstName, lastName } = customerNameFromMetadata(user.user_metadata);
    const customerId = await ensureWishlistCustomerByEmail({
      email: user.email,
      firstName,
      lastName
    });

    await syncLocalWishlistToAccount(customerId, parsed.data.slugs);
    const slugs = await getCustomerWishlist(customerId);

    return NextResponse.json({ slugs });
  } catch (error) {
    console.error("[api/account/wishlist/sync] POST failed", error);
    return NextResponse.json({ message: "Unable to sync wishlist right now." }, { status: 500 });
  }
}

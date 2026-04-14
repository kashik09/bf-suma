import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { upsertCustomerProfileByEmail } from "@/services/customer-account";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(40).optional().default("")
});

export async function PUT(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      { message: "Please sign in to update your profile." },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please review your profile details and try again." },
      { status: 400 }
    );
  }

  try {
    const profile = await upsertCustomerProfileByEmail({
      email: user.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || ""
    });

    await supabase.auth.updateUser({
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      profile: {
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone || ""
      }
    });
  } catch (error) {
    console.error("[api/account/profile] update failed", error);
    return NextResponse.json(
      { message: "We couldn't save your profile. Check your connection and try again." },
      { status: 500 }
    );
  }
}

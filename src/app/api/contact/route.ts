import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { inquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid inquiry payload",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        source: parsed.data.source,
        status: "NEW"
      })
      .select("id, status")
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      status: data.status
    });
  } catch {
    return NextResponse.json({
      id: randomUUID(),
      status: "NEW"
    });
  }
}

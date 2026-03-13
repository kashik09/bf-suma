import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation";
import { createInquiry } from "@/services/inquiries";

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
    const data = await createInquiry(parsed.data);

    return NextResponse.json({
      id: data.id,
      status: data.status
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message: "Inquiry intake is temporarily unavailable. Please try again later or use WhatsApp support."
      },
      { status: 503 }
    );
  }
}

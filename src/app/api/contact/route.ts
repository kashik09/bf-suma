export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sendContactFormSubmissionEmail } from "@/lib/email/resend";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(1500),
  honeypot: z.string().max(0)
});

// TODO: In production, replace with Vercel KV or Redis for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid form data", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot check - silently succeed for bots
    if (parsed.data.honeypot) {
      return NextResponse.json({ status: "sent" });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Save to DB first (never lose a message)
    const supabase = createServiceRoleSupabaseClient();
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        ip_address: ip,
        user_agent: userAgent
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save contact submission:", dbError);
      return NextResponse.json(
        { message: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    // Send email notification
    const emailResult = await sendContactFormSubmissionEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message
    });

    // Update email_sent_at if successful
    if (emailResult.status === "sent") {
      await supabase
        .from("contact_submissions")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", submission.id);
    }

    // Return success even if email failed (we have the DB row)
    return NextResponse.json({ status: "sent" });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

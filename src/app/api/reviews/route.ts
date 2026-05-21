import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { submitProductReview } from "@/services/product-reviews";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveClientIp } from "@/lib/request-ip";
import { logEvent } from "@/lib/logger";

export const dynamic = "force-dynamic";

const RATE_LIMIT_CONFIG = {
  endpoint: "reviews",
  maxRequests: 3,
  windowSeconds: 300 // 5 minutes - stricter for reviews
} as const;

function getCorrelationId(request: Request): string {
  const requestId = request.headers.get("x-correlation-id") || request.headers.get("x-request-id");
  const trimmed = requestId?.trim() || "";
  if (trimmed.length > 0 && trimmed.length <= 120) return trimmed;
  return randomUUID();
}

const submitReviewSchema = z.object({
  product_id: z.string().uuid(),
  reviewer_name: z.string().trim().min(2).max(100),
  reviewer_email: z.string().email(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(200).optional(),
  comment: z.string().trim().min(10).max(2000)
});

export async function POST(request: Request) {
  const correlationId = getCorrelationId(request);
  const ip = resolveClientIp(request.headers);
  const rateLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIG);

  if (rateLimit.limited) {
    logEvent("warn", "review.rate_limited", {
      correlationId,
      endpoint: RATE_LIMIT_CONFIG.endpoint,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      fingerprintPrefix: rateLimit.fingerprint.slice(0, 12)
    });

    return NextResponse.json(
      {
        success: false,
        message: `You've submitted too many reviews. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) }
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = submitReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check your rating, name, email, and review message, then try again."
        },
        { status: 400 }
      );
    }

    const result = await submitProductReview(parsed.data);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Thank you for your review! It will appear once approved by our team."
      });
    }

    return NextResponse.json(result, { status: 500 });
  } catch (error) {
    logEvent("error", "review.submission_failed", {
      correlationId,
      message: error instanceof Error ? error.message : "Unknown"
    });
    return NextResponse.json(
      { success: false, message: "Unable to submit your review right now. Please try again shortly." },
      { status: 500 }
    );
  }
}

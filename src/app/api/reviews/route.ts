import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { submitProductReview } from "@/services/product-reviews";

const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5 minutes - stricter for reviews

interface InMemoryRateLimitState {
  count: number;
  windowStartMs: number;
}

const inMemoryRateLimits = new Map<string, InMemoryRateLimitState>();

function resolveClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();
  return "unknown";
}

function buildClientFingerprint(request: Request): string {
  const ip = resolveClientIp(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

function enforceRateLimit(request: Request): { blocked: boolean; retryAfterSeconds: number } {
  const fingerprint = buildClientFingerprint(request);
  const nowMs = Date.now();
  const key = `reviews:${fingerprint}`;
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const remainingMs = windowStartMs + windowMs - nowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  const state = inMemoryRateLimits.get(key);
  if (!state || state.windowStartMs !== windowStartMs) {
    inMemoryRateLimits.set(key, { count: 1, windowStartMs });
    return { blocked: false, retryAfterSeconds: 0 };
  }

  if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { blocked: true, retryAfterSeconds };
  }

  state.count += 1;
  inMemoryRateLimits.set(key, state);
  return { blocked: false, retryAfterSeconds: 0 };
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
  // Rate limiting check
  const rateLimit = enforceRateLimit(request);
  if (rateLimit.blocked) {
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
      const errors = parsed.error.errors.map(e => e.message).join(", ");
      return NextResponse.json(
        { success: false, message: `Please check your review: ${errors}` },
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
    console.error("review.submission_failed", { error: error instanceof Error ? error.message : "Unknown" });
    return NextResponse.json(
      { success: false, message: "Unable to submit your review right now. Please try again shortly." },
      { status: 500 }
    );
  }
}

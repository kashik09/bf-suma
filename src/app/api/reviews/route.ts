import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { submitProductReview } from "@/services/product-reviews";
import { buildRateLimitKey } from "@/lib/request-ip";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/logger";

const RATE_LIMIT_MAX_REQUESTS = 3;
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5 minutes - stricter for reviews

interface RateLimitDecision {
  retryAfterSeconds: number;
  fingerprint: string;
}

interface InMemoryRateLimitState {
  count: number;
  windowStartMs: number;
}

const inMemoryRateLimits = new Map<string, InMemoryRateLimitState>();

function buildClientFingerprint(request: Request): string {
  return buildRateLimitKey(request.headers, "reviews");
}

function getCorrelationId(request: Request): string {
  const requestId = request.headers.get("x-correlation-id") || request.headers.get("x-request-id");
  const trimmed = requestId?.trim() || "";
  if (trimmed.length > 0 && trimmed.length <= 120) return trimmed;
  return randomUUID();
}

function getWindowStartIso(nowMs: number): string {
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  return new Date(windowStartMs).toISOString();
}

function getRetryAfterSeconds(nowMs: number): number {
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const remainingMs = windowStartMs + windowMs - nowMs;
  return Math.max(1, Math.ceil(remainingMs / 1000));
}

async function enforcePostRateLimit(request: Request, endpoint: string): Promise<RateLimitDecision | null> {
  const fingerprint = buildClientFingerprint(request);
  const nowMs = Date.now();

  const fallbackInMemory = (): RateLimitDecision | null => {
    const key = `${endpoint}:${fingerprint}`;
    const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
    const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
    const retryAfterSeconds = getRetryAfterSeconds(nowMs);

    const state = inMemoryRateLimits.get(key);
    if (!state || state.windowStartMs !== windowStartMs) {
      inMemoryRateLimits.set(key, { count: 1, windowStartMs });
      return null;
    }

    if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
      return { retryAfterSeconds, fingerprint };
    }

    state.count += 1;
    inMemoryRateLimits.set(key, state);
    return null;
  };

  try {
    const supabase = createServiceRoleSupabaseClient();
    const windowStart = getWindowStartIso(nowMs);
    const retryAfterSeconds = getRetryAfterSeconds(nowMs);
    const nowIso = new Date(nowMs).toISOString();

    const { data: existing, error: fetchError } = await supabase
      .from("api_rate_limits")
      .select("request_count")
      .eq("endpoint", endpoint)
      .eq("fingerprint", fingerprint)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (fetchError) return fallbackInMemory();

    if (!existing) {
      const { error: insertError } = await supabase.from("api_rate_limits").insert({
        endpoint,
        fingerprint,
        window_start: windowStart,
        request_count: 1,
        created_at: nowIso,
        updated_at: nowIso
      });

      if (insertError) return fallbackInMemory();
      return null;
    }

    if (existing.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return { retryAfterSeconds, fingerprint };
    }

    const nextCount = existing.request_count + 1;
    const { error: updateError } = await supabase
      .from("api_rate_limits")
      .update({
        request_count: nextCount,
        updated_at: nowIso
      })
      .eq("endpoint", endpoint)
      .eq("fingerprint", fingerprint)
      .eq("window_start", windowStart)
      .eq("request_count", existing.request_count);

    if (!updateError) return null;

    const { data: latest } = await supabase
      .from("api_rate_limits")
      .select("request_count")
      .eq("endpoint", endpoint)
      .eq("fingerprint", fingerprint)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (latest && latest.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      return { retryAfterSeconds, fingerprint };
    }

    return fallbackInMemory();
  } catch {
    return fallbackInMemory();
  }
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
  const rateLimit = await enforcePostRateLimit(request, "reviews");
  if (rateLimit) {
    logEvent("warn", "review.rate_limited", {
      correlationId,
      endpoint: "reviews",
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

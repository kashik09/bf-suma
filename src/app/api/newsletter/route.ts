import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sendNewsletterWelcomeEmail } from "@/lib/email/resend";
import { newsletterSignupSchema } from "@/lib/validation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { markNewsletterWelcomeEmailSent, subscribeNewsletter } from "@/services/newsletter";
import { buildRateLimitKey } from "@/lib/request-ip";
import { logEvent } from "@/lib/logger";

export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

interface RateLimitDecision {
  retryAfterSeconds: number;
  fingerprint: string;
}

interface InMemoryRateLimitState {
  count: number;
  windowStartMs: number;
}

const inMemoryRateLimits = new Map<string, InMemoryRateLimitState>();

function getCorrelationId(request: Request): string {
  const requestId = request.headers.get("x-correlation-id") || request.headers.get("x-request-id");
  const trimmed = requestId?.trim() || "";
  if (trimmed.length > 0 && trimmed.length <= 120) return trimmed;
  return randomUUID();
}

function buildClientFingerprint(request: Request): string {
  return buildRateLimitKey(request.headers, "newsletter");
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

export async function POST(request: Request) {
  const correlationId = getCorrelationId(request);
  const rateLimit = await enforcePostRateLimit(request, "newsletter");

  if (rateLimit) {
    logEvent("warn", "newsletter.rate_limited", {
      correlationId,
      endpoint: "newsletter",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      fingerprintPrefix: rateLimit.fingerprint.slice(0, 12)
    });

    return NextResponse.json(
      {
        message: "Too many requests. Please retry later.",
        retryAfterSeconds: rateLimit.retryAfterSeconds
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds)
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSignupSchema.safeParse(body);

  if (!parsed.success) {
    logEvent("warn", "newsletter.validation_failed", {
      correlationId,
      fieldErrorKeys: Object.keys(parsed.error.flatten().fieldErrors).sort()
    });

    return NextResponse.json(
      {
        message: "Please enter a valid email address and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const signup = await subscribeNewsletter(parsed.data);

    let emailDelivery: "sent" | "skipped" | "failed" = "skipped";
    if (!signup.welcomeEmailAlreadySent) {
      const delivery = await sendNewsletterWelcomeEmail({ email: parsed.data.email.trim().toLowerCase() });
      emailDelivery = delivery.status;

      if (delivery.status === "sent") {
        await markNewsletterWelcomeEmailSent(signup.id, signup.storageMode);
      }
    }

    logEvent("info", "newsletter.subscribe_succeeded", {
      correlationId,
      subscriberId: signup.id,
      status: signup.status,
      storageMode: signup.storageMode,
      emailDelivery
    });

    return NextResponse.json(
      {
        id: signup.id,
        status: signup.status,
        message:
          signup.status === "already_subscribed"
            ? "You are already subscribed. We will keep you updated."
            : "Thanks. You are subscribed to BF Suma updates.",
        emailDelivery
      },
      { status: signup.status === "already_subscribed" ? 200 : 201 }
    );
  } catch (error) {
    logEvent("error", "newsletter.subscribe_failed", {
      correlationId,
      reason: "unexpected_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });

    return NextResponse.json(
      {
        message: "Newsletter signup is temporarily unavailable. Please try again later or use WhatsApp support."
      },
      { status: 503 }
    );
  }
}

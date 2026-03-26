import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { orderIntakeSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createOrderIntakeWithIdempotency,
  hashOrderIntakePayload,
  OrderIdempotencyConflictError,
  OrderIdempotencyInProgressError,
  OrderIntakeRejectedError
} from "@/services/orders";

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

type LogLevel = "info" | "warn" | "error";

function logEvent(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const line = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...payload
  });

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

function getCorrelationId(request: Request): string {
  const requestId = request.headers.get("x-correlation-id") || request.headers.get("x-request-id");
  const trimmed = requestId?.trim() || "";
  if (trimmed.length > 0 && trimmed.length <= 120) return trimmed;
  return randomUUID();
}

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
    const supabase = await createServerSupabaseClient();
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

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function POST(request: Request) {
  const correlationId = getCorrelationId(request);
  const rateLimit = await enforcePostRateLimit(request, "orders");
  if (rateLimit) {
    logEvent("warn", "order.rate_limited", {
      correlationId,
      endpoint: "orders",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      fingerprintPrefix: rateLimit.fingerprint.slice(0, 12)
    });

    return NextResponse.json(
      {
        persisted: false,
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
  const idempotencyHeader = request.headers.get("idempotency-key");
  const idempotencyFromBody =
    body && typeof body === "object" && typeof (body as { idempotencyKey?: unknown }).idempotencyKey === "string"
      ? (body as { idempotencyKey: string }).idempotencyKey
      : null;
  const idempotencyKey = (idempotencyHeader || idempotencyFromBody || "").trim();

  if (!idempotencyKey) {
    logEvent("warn", "order.validation_failed", {
      correlationId,
      reason: "missing_idempotency_key"
    });

    return NextResponse.json(
      {
        persisted: false,
        message: "Missing idempotency key. Include 'Idempotency-Key' header on checkout requests."
      },
      { status: 400 }
    );
  }

  if (idempotencyKey.length > 120) {
    logEvent("warn", "order.validation_failed", {
      correlationId,
      reason: "invalid_idempotency_key_length"
    });

    return NextResponse.json(
      {
        persisted: false,
        message: "Invalid idempotency key."
      },
      { status: 400 }
    );
  }

  const parsed = orderIntakeSchema.safeParse(body);

  if (!parsed.success) {
    logEvent("warn", "order.validation_failed", {
      correlationId,
      fieldErrorKeys: Object.keys(parsed.error.flatten().fieldErrors).sort()
    });

    return NextResponse.json(
      {
        message: "Invalid checkout payload",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  try {
    const requestHash = hashOrderIntakePayload(parsed.data);
    const { result, replayed } = await createOrderIntakeWithIdempotency(parsed.data, idempotencyKey, requestHash);
    const isPickup = parsed.data.fulfillmentType === "pickup";
    const successMessage = isPickup
      ? `Thanks, your order ${result.orderNumber} has been received. You can pay at pickup.`
      : `Thanks, your order ${result.orderNumber} has been received. You can pay on delivery.`;

    logEvent("info", "order.create_succeeded", {
      correlationId,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
      replayed
    });

    return NextResponse.json(
      {
        persisted: true,
        orderNumber: result.orderNumber,
        receivedAt: result.receivedAt,
        subtotal: result.subtotal,
        deliveryFee: result.deliveryFee,
        total: result.total,
        currency: result.currency,
        message: successMessage
      },
      { status: replayed ? 200 : 201 }
    );
  } catch (error) {
    if (error instanceof OrderIntakeRejectedError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "order_intake_rejected",
        message: error.message,
        fieldErrorKeys: Object.keys(error.fieldErrors).sort()
      });

      return NextResponse.json(
        {
          persisted: false,
          message: error.message,
          fieldErrors: error.fieldErrors
        },
        { status: 400 }
      );
    }

    if (error instanceof OrderIdempotencyConflictError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "idempotency_conflict",
        message: error.message
      });

      return NextResponse.json(
        {
          persisted: false,
          message: error.message
        },
        { status: 409 }
      );
    }

    if (error instanceof OrderIdempotencyInProgressError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "idempotency_in_progress",
        message: error.message
      });

      return NextResponse.json(
        {
          persisted: false,
          message: error.message
        },
        { status: 409 }
      );
    }

    logEvent("error", "order.create_failed", {
      correlationId,
      reason: "unexpected_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });

    return NextResponse.json(
      {
        persisted: false,
        message: "We couldn't place your order right now. Please try again in a moment."
      },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { orderIntakeSchema } from "@/lib/validation";
import { ORDER_STATUSES } from "@/lib/constants";
import { assertAdminRequest } from "@/lib/admin-request";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { enqueueOrderCreatedNotification } from "@/services/order-notifications";
import {
  createOrderIntakeWithIdempotency,
  listOrdersForAdmin,
  OrderIdempotencyConflictError,
  OrderIdempotencyInProgressError,
  OrderIntakeRejectedError,
  OrderTemporaryFailureError
} from "@/services/orders";
import type { OrderIntakeFieldErrors, OrderIntakeResultCode } from "@/types";

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

function jsonResponse(
  payload: {
    persisted: boolean;
    resultCode: OrderIntakeResultCode;
    message: string;
    fieldErrors?: OrderIntakeFieldErrors;
    retryAfterSeconds?: number;
    orderNumber?: string;
    receivedAt?: string;
    subtotal?: number;
    deliveryFee?: number;
    total?: number;
    currency?: string;
    degraded?: boolean;
    errorCode?: string;
  },
  status: number,
  headers?: HeadersInit
) {
  return NextResponse.json(payload, { status, headers });
}

function normalizeFieldErrors(fieldErrors: Record<string, string[] | undefined>): OrderIntakeFieldErrors {
  const normalized: OrderIntakeFieldErrors = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (Array.isArray(value) && value.length > 0) {
      normalized[key] = value;
    }
  }

  return normalized;
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

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
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

export async function GET(request: Request) {
  const adminAccess = await assertAdminRequest(request);
  if (!adminAccess.ok) {
    return NextResponse.json({ message: adminAccess.message }, { status: adminAccess.status });
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const pageSize = parsePositiveInteger(searchParams.get("pageSize"), 20);
  const statusParam = searchParams.get("status");
  const search = searchParams.get("search") || undefined;

  if (statusParam && !ORDER_STATUSES.includes(statusParam as (typeof ORDER_STATUSES)[number])) {
    return NextResponse.json(
      { message: "Invalid order status filter." },
      { status: 400 }
    );
  }

  try {
    const result = await listOrdersForAdmin({
      page,
      pageSize,
      status: statusParam ? (statusParam as (typeof ORDER_STATUSES)[number]) : undefined,
      search
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("order.list_failed", error);
    return NextResponse.json(
      { message: "Order listing is temporarily unavailable." },
      { status: 503 }
    );
  }
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

    return jsonResponse(
      {
        persisted: false,
        resultCode: "TEMPORARY_FAILURE",
        message: "Too many checkout attempts. Please retry shortly.",
        retryAfterSeconds: rateLimit.retryAfterSeconds
      },
      429,
      {
        "Retry-After": String(rateLimit.retryAfterSeconds)
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

    return jsonResponse(
      {
        persisted: false,
        resultCode: "REJECTED",
        message: "Missing idempotency key. Include 'Idempotency-Key' header on checkout requests."
      },
      400
    );
  }

  if (idempotencyKey.length > 120) {
    logEvent("warn", "order.validation_failed", {
      correlationId,
      reason: "invalid_idempotency_key_length"
    });

    return jsonResponse(
      {
        persisted: false,
        resultCode: "REJECTED",
        message: "Invalid idempotency key."
      },
      400
    );
  }

  const parsed = orderIntakeSchema.safeParse(body);

  if (!parsed.success) {
    const normalizedFieldErrors = normalizeFieldErrors(parsed.error.flatten().fieldErrors);

    logEvent("warn", "order.validation_failed", {
      correlationId,
      fieldErrorKeys: Object.keys(normalizedFieldErrors).sort()
    });

    return jsonResponse(
      {
        persisted: false,
        resultCode: "REJECTED",
        message: "Invalid checkout payload",
        fieldErrors: normalizedFieldErrors
      },
      400
    );
  }

  try {
    const { result, resultCode } = await createOrderIntakeWithIdempotency(parsed.data, idempotencyKey);
    const isPickup = parsed.data.fulfillmentType === "pickup";
    const replayed = resultCode === "REPLAYED";
    const successPrefix = replayed ? "Order already received" : "Thanks";
    const successMessage = isPickup
      ? `${successPrefix}, your order ${result.orderNumber} has been received. You can pay at pickup.`
      : `${successPrefix}, your order ${result.orderNumber} has been received. You can pay on delivery.`;

    logEvent("info", "order.create_succeeded", {
      correlationId,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
      replayed,
      resultCode
    });

    if (resultCode === "CREATED") {
      try {
        await enqueueOrderCreatedNotification({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          total: result.total,
          currency: result.currency,
          receivedAt: result.receivedAt
        });
      } catch (enqueueError) {
        logEvent("warn", "order.notification_enqueue_failed", {
          correlationId,
          orderId: result.orderId,
          message: enqueueError instanceof Error ? enqueueError.message : "Unknown error"
        });
      }
    }

    return jsonResponse(
      {
        persisted: true,
        resultCode,
        orderNumber: result.orderNumber,
        receivedAt: result.receivedAt,
        subtotal: result.subtotal,
        deliveryFee: result.deliveryFee,
        total: result.total,
        currency: result.currency,
        message: successMessage
      },
      replayed ? 200 : 201
    );
  } catch (error) {
    if (error instanceof OrderIntakeRejectedError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "order_intake_rejected",
        message: error.message,
        fieldErrorKeys: Object.keys(error.fieldErrors).sort()
      });

      return jsonResponse(
        {
          persisted: false,
          resultCode: "REJECTED",
          message: error.message,
          fieldErrors: error.fieldErrors
        },
        422
      );
    }

    if (error instanceof OrderIdempotencyConflictError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "idempotency_conflict",
        message: error.message
      });

      return jsonResponse(
        {
          persisted: false,
          resultCode: "CONFLICT",
          message: error.message
        },
        409
      );
    }

    if (error instanceof OrderIdempotencyInProgressError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "idempotency_in_progress",
        message: error.message
      });

      return jsonResponse(
        {
          persisted: false,
          resultCode: "IN_PROGRESS",
          message: error.message,
          retryAfterSeconds: 2
        },
        409,
        {
          "Retry-After": "2"
        }
      );
    }

    if (error instanceof OrderTemporaryFailureError) {
      logEvent("warn", "order.create_failed", {
        correlationId,
        reason: "temporary_failure",
        message: error.message
      });

      return jsonResponse(
        {
          persisted: false,
          resultCode: "TEMPORARY_FAILURE",
          degraded: true,
          errorCode: "COMMERCE_UNAVAILABLE",
          message: error.message || "Order service is temporarily unavailable. Please try again shortly."
        },
        503
      );
    }

    logEvent("error", "order.create_failed", {
      correlationId,
      reason: "unexpected_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });

    return jsonResponse(
      {
        persisted: false,
        resultCode: "TEMPORARY_FAILURE",
        degraded: true,
        errorCode: "COMMERCE_UNAVAILABLE",
        message: "We couldn't place your order right now. Please try again in a moment."
      },
      503
    );
  }
}

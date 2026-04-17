export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { buildRateLimitKey } from "@/lib/request-ip";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import {
  deleteAbandonedCartByEmail,
  upsertAbandonedCart
} from "@/services/abandoned-carts";

const RATE_LIMIT_MAX_REQUESTS = 10;
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

const cartItemSchema = z.object({
  product_id: z.string().min(1),
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  slug: z.string().optional()
});

const upsertSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().trim().max(120).optional(),
  cartItems: z.array(cartItemSchema)
});

const deleteSchema = z.object({
  customerEmail: z.string().email()
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function lifecycleEnabled() {
  return process.env.LIFECYCLE_EMAILS_ENABLED === "true";
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

function buildClientFingerprint(request: Request): string {
  return buildRateLimitKey(request.headers, "abandoned-cart");
}

async function enforceMutationRateLimit(request: Request, endpoint: string): Promise<RateLimitDecision | null> {
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

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "Authentication required to sync abandoned carts." },
    { status: 401 }
  );
}

function tooManyRequestsResponse(rateLimit: RateLimitDecision) {
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

async function resolveAuthenticatedEmail(request: Request): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user?.email) {
    return normalizeEmail(user.email);
  }

  const authorization = request.headers.get("authorization") || "";
  const bearerPrefix = "bearer ";
  if (!authorization.toLowerCase().startsWith(bearerPrefix)) {
    return null;
  }

  const accessToken = authorization.slice(bearerPrefix.length).trim();
  if (!accessToken) return null;

  const serviceRole = createServiceRoleSupabaseClient();
  const { data, error } = await serviceRole.auth.getUser(accessToken);
  if (error || !data?.user?.email) {
    return null;
  }

  return normalizeEmail(data.user.email);
}

function hasMatchingEmail(authenticatedEmail: string, payloadEmail: string): boolean {
  return authenticatedEmail === normalizeEmail(payloadEmail);
}

export async function POST(request: Request) {
  const authenticatedEmail = await resolveAuthenticatedEmail(request);
  if (!authenticatedEmail) {
    return unauthorizedResponse();
  }

  const rateLimit = await enforceMutationRateLimit(request, "abandoned-cart");
  if (rateLimit) {
    return tooManyRequestsResponse(rateLimit);
  }

  if (!lifecycleEnabled()) {
    return NextResponse.json({ ok: true, skipped: "lifecycle_emails_disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid cart sync payload." },
      { status: 400 }
    );
  }

  if (!hasMatchingEmail(authenticatedEmail, parsed.data.customerEmail)) {
    return unauthorizedResponse();
  }

  try {
    await upsertAbandonedCart({
      customerEmail: parsed.data.customerEmail,
      customerName: parsed.data.customerName,
      cartItems: parsed.data.cartItems
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Cart sync is temporarily unavailable." },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request) {
  const authenticatedEmail = await resolveAuthenticatedEmail(request);
  if (!authenticatedEmail) {
    return unauthorizedResponse();
  }

  const rateLimit = await enforceMutationRateLimit(request, "abandoned-cart");
  if (rateLimit) {
    return tooManyRequestsResponse(rateLimit);
  }

  if (!lifecycleEnabled()) {
    return NextResponse.json({ ok: true, skipped: "lifecycle_emails_disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid cart clear payload." },
      { status: 400 }
    );
  }

  if (!hasMatchingEmail(authenticatedEmail, parsed.data.customerEmail)) {
    return unauthorizedResponse();
  }

  try {
    await deleteAbandonedCartByEmail(parsed.data.customerEmail);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Cart clear is temporarily unavailable." },
      { status: 503 }
    );
  }
}

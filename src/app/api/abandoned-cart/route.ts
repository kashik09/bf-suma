export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit";
import { resolveClientIp } from "@/lib/request-ip";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import {
  deleteAbandonedCartByEmail,
  upsertAbandonedCart
} from "@/services/abandoned-carts";

const RATE_LIMIT_CONFIG = {
  endpoint: "abandoned-cart",
  maxRequests: 10,
  windowSeconds: 60
} as const;

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

function unauthorizedResponse() {
  return NextResponse.json(
    { message: "Authentication required to sync abandoned carts." },
    { status: 401 }
  );
}

function tooManyRequestsResponse(rateLimit: RateLimitResult) {
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

  const ip = resolveClientIp(request.headers);
  const rateLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIG);
  if (rateLimit.limited) {
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

  const ip = resolveClientIp(request.headers);
  const rateLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIG);
  if (rateLimit.limited) {
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

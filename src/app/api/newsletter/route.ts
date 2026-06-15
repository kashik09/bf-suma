import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sendNewsletterWelcomeEmail } from "@/lib/email/resend";
import { newsletterSignupSchema } from "@/lib/validation";
import { markNewsletterWelcomeEmailSent, subscribeNewsletter } from "@/services/newsletter";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveClientIp } from "@/lib/request-ip";
import { logEvent } from "@/lib/logger";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

const RATE_LIMIT_CONFIG = {
  endpoint: "newsletter",
  maxRequests: 5,
  windowSeconds: 60
} as const;

function getCorrelationId(request: Request): string {
  const requestId = request.headers.get("x-correlation-id") || request.headers.get("x-request-id");
  const trimmed = requestId?.trim() || "";
  if (trimmed.length > 0 && trimmed.length <= 120) return trimmed;
  return randomUUID();
}

export async function POST(request: Request) {
  const correlationId = getCorrelationId(request);
  const ip = resolveClientIp(request.headers);
  const rateLimit = await checkRateLimit(ip, RATE_LIMIT_CONFIG);

  if (rateLimit.limited) {
    logEvent("warn", "newsletter.rate_limited", {
      correlationId,
      endpoint: RATE_LIMIT_CONFIG.endpoint,
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

  // Verify Turnstile token if provided
  const turnstileToken = body?.turnstileToken;
  if (turnstileToken) {
    const isValidToken = await verifyTurnstileToken(turnstileToken, ip);
    if (!isValidToken) {
      logEvent("warn", "newsletter.turnstile_failed", { correlationId });
      return NextResponse.json(
        { message: "Security verification failed. Please try again." },
        { status: 400 }
      );
    }
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

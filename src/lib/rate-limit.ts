import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface RateLimitConfig {
  /** Endpoint identifier for grouping (e.g., "orders", "contact") */
  endpoint: string;
  /** Maximum requests allowed per window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Whether the request is rate limited */
  limited: boolean;
  /** Seconds until the current window resets */
  retryAfterSeconds: number;
  /** Client fingerprint used for this check */
  fingerprint: string;
}

interface InMemoryState {
  count: number;
  windowStartMs: number;
}

const inMemoryFallback = new Map<string, InMemoryState>();

function getWindowStartIso(nowMs: number, windowSeconds: number): string {
  const windowMs = windowSeconds * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  return new Date(windowStartMs).toISOString();
}

function getRetryAfterSeconds(nowMs: number, windowSeconds: number): number {
  const windowMs = windowSeconds * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const remainingMs = windowStartMs + windowMs - nowMs;
  return Math.max(1, Math.ceil(remainingMs / 1000));
}

function checkInMemoryFallback(
  key: string,
  config: RateLimitConfig,
  nowMs: number
): RateLimitResult {
  const windowMs = config.windowSeconds * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const retryAfterSeconds = getRetryAfterSeconds(nowMs, config.windowSeconds);

  const state = inMemoryFallback.get(key);
  if (!state || state.windowStartMs !== windowStartMs) {
    inMemoryFallback.set(key, { count: 1, windowStartMs });
    return { limited: false, retryAfterSeconds, fingerprint: key };
  }

  if (state.count >= config.maxRequests) {
    return { limited: true, retryAfterSeconds, fingerprint: key };
  }

  state.count += 1;
  inMemoryFallback.set(key, state);
  return { limited: false, retryAfterSeconds, fingerprint: key };
}

/**
 * Check rate limit using Supabase with in-memory fallback.
 *
 * Uses fixed-window algorithm with aligned window starts.
 * Falls back to in-memory Map if Supabase is unavailable.
 *
 * @param fingerprint - Client fingerprint from buildRateLimitKey()
 * @param config - Rate limit configuration
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  fingerprint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { endpoint, maxRequests, windowSeconds } = config;
  const key = `${endpoint}:${fingerprint}`;
  const nowMs = Date.now();
  const retryAfterSeconds = getRetryAfterSeconds(nowMs, windowSeconds);

  try {
    const supabase = createServiceRoleSupabaseClient();
    const windowStart = getWindowStartIso(nowMs, windowSeconds);
    const nowIso = new Date(nowMs).toISOString();

    // Fetch existing record for this window
    const { data: existing, error: fetchError } = await supabase
      .from("api_rate_limits")
      .select("request_count")
      .eq("endpoint", endpoint)
      .eq("fingerprint", fingerprint)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (fetchError) {
      return checkInMemoryFallback(key, config, nowMs);
    }

    // No record yet - create one
    if (!existing) {
      const { error: insertError } = await supabase.from("api_rate_limits").insert({
        endpoint,
        fingerprint,
        window_start: windowStart,
        request_count: 1,
        created_at: nowIso,
        updated_at: nowIso
      });

      if (insertError) {
        return checkInMemoryFallback(key, config, nowMs);
      }

      return { limited: false, retryAfterSeconds, fingerprint };
    }

    // Already at limit
    if (existing.request_count >= maxRequests) {
      return { limited: true, retryAfterSeconds, fingerprint };
    }

    // Increment with optimistic concurrency
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

    if (!updateError) {
      return { limited: false, retryAfterSeconds, fingerprint };
    }

    // Concurrent update - re-check current count
    const { data: latest } = await supabase
      .from("api_rate_limits")
      .select("request_count")
      .eq("endpoint", endpoint)
      .eq("fingerprint", fingerprint)
      .eq("window_start", windowStart)
      .maybeSingle();

    if (latest && latest.request_count >= maxRequests) {
      return { limited: true, retryAfterSeconds, fingerprint };
    }

    return checkInMemoryFallback(key, config, nowMs);
  } catch {
    return checkInMemoryFallback(key, config, nowMs);
  }
}

/**
 * Simple IP-based rate limit check using in-memory storage only.
 *
 * Use this for endpoints where DB latency is unacceptable (e.g., login forms)
 * or where server-local limiting is sufficient.
 *
 * @param ip - Client IP address
 * @param config - Rate limit configuration
 * @returns Rate limit check result
 */
export function checkRateLimitInMemory(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.endpoint}:${ip}`;
  const nowMs = Date.now();
  return checkInMemoryFallback(key, config, nowMs);
}

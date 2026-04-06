import { createHash } from "crypto";

type HeaderLike = {
  get(name: string): string | null;
};

function normalizeIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  if (!first) return null;
  return first;
}

function isPrivateOrLocalIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  );
}

/**
 * Conservative IP resolver for rate limiting.
 *
 * Only trusts platform-provided headers that cannot be spoofed by clients:
 * - x-vercel-forwarded-for: Set by Vercel edge, cannot be spoofed
 * - cf-connecting-ip: Set by Cloudflare, cannot be spoofed
 * - x-real-ip: Only trusted if not a private IP (proxy-set)
 *
 * IMPORTANT: Does NOT trust raw x-forwarded-for from untrusted sources
 * as clients can spoof this header to bypass rate limits.
 */
export function resolveClientIp(headers: HeaderLike): string {
  // Vercel edge sets this header - cannot be spoofed by client
  const vercelForwarded = normalizeIp(headers.get("x-vercel-forwarded-for"));
  if (vercelForwarded && !isPrivateOrLocalIp(vercelForwarded)) {
    return vercelForwarded;
  }

  // Cloudflare sets this header - cannot be spoofed by client
  const cfIp = normalizeIp(headers.get("cf-connecting-ip"));
  if (cfIp && !isPrivateOrLocalIp(cfIp)) {
    return cfIp;
  }

  // x-real-ip from trusted reverse proxy (nginx, etc.)
  // Only trust if it's not a private IP
  const realIp = normalizeIp(headers.get("x-real-ip"));
  if (realIp && !isPrivateOrLocalIp(realIp)) {
    return realIp;
  }

  // Fallback - use a constant to group all unknown sources
  // This is conservative: unknown IPs share a rate limit bucket
  return "unknown";
}

/**
 * Build a rate limit key from request.
 * Combines IP with user-agent for additional entropy.
 */
export function buildRateLimitKey(headers: HeaderLike, prefix: string): string {
  const ip = resolveClientIp(headers);
  const ua = headers.get("user-agent") ?? "unknown";
  // Truncate UA to prevent key bloat
  const uaShort = ua.slice(0, 80);
  const fingerprint = createHash("sha256").update(`${ip}|${uaShort}`).digest("hex").slice(0, 16);
  return `${prefix}:${fingerprint}`;
}

/**
 * Build a rate limit key that includes an identifier (email, etc.)
 * Use this for authenticated actions or when you have a stable identifier.
 */
export function buildIdentifiedRateLimitKey(
  headers: HeaderLike,
  prefix: string,
  identifier: string
): string {
  const ip = resolveClientIp(headers);
  const identifierHash = createHash("sha256").update(identifier.toLowerCase().trim()).digest("hex").slice(0, 12);
  return `${prefix}:${ip}:${identifierHash}`;
}

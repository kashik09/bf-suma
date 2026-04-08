/**
 * Safe structured logger.
 * Automatically redacts fields whose names contain sensitive keywords
 * (password, token, key, secret, auth, credential) before writing to stdout/stderr.
 */

const SENSITIVE_PATTERNS = [
  "password",
  "passwd",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "credential",
  "private",
  "jwt",
  "bearer",
];

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    const lower = k.toLowerCase().replace(/[-_ ]/g, "");
    const isSensitive = SENSITIVE_PATTERNS.some((p) => lower.includes(p));
    result[k] = isSensitive ? "[REDACTED]" : v;
  }
  return result;
}

export type LogLevel = "info" | "warn" | "error";

export function logEvent(level: LogLevel, event: string, payload: Record<string, unknown>): void {
  const line = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...sanitizePayload(payload),
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

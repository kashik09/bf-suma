import { cookies } from "next/headers";

const FLASH_ERROR_COOKIE = "admin_flash_error";
const FLASH_REDIRECT_COOKIE = "admin_flash_redirect";
const FLASH_MAX_AGE = 60; // 1 minute - enough for redirect cycle

type LoginErrorCode =
  | "invalid_credentials"
  | "auth_unavailable"
  | "forbidden"
  | "session_expired"
  | "password_reset_required";

type ResetPasswordErrorCode =
  | "weak_password"
  | "mismatch"
  | "failed"
  | "session_expired";

export type FlashErrorCode = LoginErrorCode | ResetPasswordErrorCode;

/**
 * Validates and normalizes redirect path.
 * Only allows internal /admin paths to prevent open redirect.
 */
export function normalizeAdminRedirect(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "/admin";

  // Remove any protocol, host, or query string that might enable open redirect
  const cleaned = path.split("?")[0].split("#")[0];

  // Must start with /admin and not contain protocol markers
  if (!cleaned.startsWith("/admin")) return "/admin";
  if (cleaned.includes("://")) return "/admin";
  if (cleaned.includes("//")) return "/admin";

  // Normalize path traversal attempts
  const normalized = cleaned.replace(/\/+/g, "/").replace(/\.\./g, "");
  if (!normalized.startsWith("/admin")) return "/admin";

  return normalized;
}

/**
 * Sets a flash error cookie (consumed on next read).
 */
export async function setFlashError(code: FlashErrorCode): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_ERROR_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: FLASH_MAX_AGE,
    path: "/admin"
  });
}

/**
 * Reads the flash error cookie (does not delete - use clearFlashError in Server Actions).
 */
export async function readFlashError(): Promise<FlashErrorCode | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(FLASH_ERROR_COOKIE)?.value as FlashErrorCode | undefined;
  return value || null;
}

/**
 * Clears the flash error cookie. Call this in Server Actions only.
 */
export async function clearFlashError(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(FLASH_ERROR_COOKIE);
}

/**
 * Sets the post-login redirect target cookie.
 */
export async function setFlashRedirect(path: string): Promise<void> {
  const normalized = normalizeAdminRedirect(path);
  const cookieStore = await cookies();
  cookieStore.set(FLASH_REDIRECT_COOKIE, normalized, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: FLASH_MAX_AGE,
    path: "/admin"
  });
}

/**
 * Reads the redirect target cookie (does not delete - use clearFlashRedirect in Server Actions).
 */
export async function readFlashRedirect(): Promise<string> {
  const cookieStore = await cookies();
  const value = cookieStore.get(FLASH_REDIRECT_COOKIE)?.value;
  return normalizeAdminRedirect(value);
}

/**
 * Clears the flash redirect cookie. Call this in Server Actions only.
 */
export async function clearFlashRedirect(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(FLASH_REDIRECT_COOKIE);
}

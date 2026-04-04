import type { AdminRole } from "@/types";

export const ADMIN_SESSION_COOKIE_NAME = "bf_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export interface AdminSessionClaims {
  userId: string;
  role: AdminRole;
  email: string;
  exp: number;
}

function resolveAdminSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback).");
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function isAdminRole(value: unknown): value is AdminRole {
  return value === "SUPER_ADMIN" || value === "OPERATIONS" || value === "SUPPORT";
}

async function hmacSha256(message: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

export async function createAdminSessionToken(
  claims: Omit<AdminSessionClaims, "exp">,
  maxAgeSeconds: number = ADMIN_SESSION_MAX_AGE_SECONDS
): Promise<string> {
  const payload: AdminSessionClaims = {
    ...claims,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds
  };

  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmacSha256(encodedPayload, resolveAdminSessionSecret()));
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined): Promise<AdminSessionClaims | null> {
  if (!token) return null;

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = bytesToBase64Url(await hmacSha256(payloadPart, resolveAdminSessionSecret()));
  if (signaturePart !== expectedSignature) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadPart)));
  } catch {
    return null;
  }

  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as Partial<AdminSessionClaims>;
  if (
    typeof candidate.userId !== "string" ||
    typeof candidate.email !== "string" ||
    !isAdminRole(candidate.role) ||
    typeof candidate.exp !== "number"
  ) {
    return null;
  }

  if (candidate.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userId: candidate.userId,
    email: candidate.email,
    role: candidate.role,
    exp: candidate.exp
  };
}

export function hasAdminRole(role: AdminRole, allowedRoles: AdminRole[]): boolean {
  return allowedRoles.includes(role);
}

export function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split("=");
    if (rawName === name) {
      return rest.join("=");
    }
  }
  return null;
}

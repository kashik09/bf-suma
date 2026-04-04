import {
  ADMIN_SESSION_COOKIE_NAME,
  hasAdminRole,
  parseCookieHeader,
  verifyAdminSessionToken
} from "@/lib/admin-session";
import type { AdminRole } from "@/types";

export async function getAdminSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = parseCookieHeader(cookieHeader, ADMIN_SESSION_COOKIE_NAME);
  return verifyAdminSessionToken(token);
}

export async function assertAdminRequest(
  request: Request,
  allowedRoles?: AdminRole[]
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return { ok: false, status: 401, message: "Admin authentication required." };
  }

  if (allowedRoles && !hasAdminRole(session.role, allowedRoles)) {
    return { ok: false, status: 403, message: "You do not have permission for this admin action." };
  }

  return { ok: true };
}

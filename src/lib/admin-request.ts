import {
  ADMIN_SESSION_COOKIE_NAME,
  hasAdminRole,
  parseCookieHeader,
  verifyAdminSessionToken
} from "@/lib/admin-session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/types";

export interface AdminRequestResult {
  ok: true;
  adminUserId: string;
  email: string;
  role: AdminRole;
  passwordVersion: number;
}

export interface AdminRequestError {
  ok: false;
  status: number;
  message: string;
}

export async function getAdminSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = parseCookieHeader(cookieHeader, ADMIN_SESSION_COOKIE_NAME);
  return verifyAdminSessionToken(token);
}

/**
 * Validates admin request with full session verification including password version.
 * This ensures that password changes invalidate all existing sessions.
 */
export async function assertAdminRequest(
  request: Request,
  allowedRoles?: AdminRole[]
): Promise<AdminRequestResult | AdminRequestError> {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return { ok: false, status: 401, message: "Admin authentication required." };
  }

  if (allowedRoles && !hasAdminRole(session.role, allowedRoles)) {
    return { ok: false, status: 403, message: "You do not have permission for this admin action." };
  }

  // Validate session against current database state
  const supabase = createServiceRoleSupabaseClient();
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("id, role, is_active, password_version, must_reset_password")
    .eq("id", session.userId)
    .maybeSingle();

  if (error || !adminUser) {
    return { ok: false, status: 401, message: "Admin user not found." };
  }

  if (!adminUser.is_active) {
    return { ok: false, status: 401, message: "Admin account is deactivated." };
  }

  // Critical: Validate password version matches token
  // If password was changed, session token's passwordVersion will be stale
  if (adminUser.password_version !== session.passwordVersion) {
    return { ok: false, status: 401, message: "Session expired. Please log in again." };
  }

  // Re-check role from database (in case it changed)
  if (allowedRoles && !hasAdminRole(adminUser.role as AdminRole, allowedRoles)) {
    return { ok: false, status: 403, message: "You do not have permission for this admin action." };
  }

  return {
    ok: true,
    adminUserId: adminUser.id,
    email: session.email,
    role: adminUser.role as AdminRole,
    passwordVersion: adminUser.password_version
  };
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE_NAME, hasAdminRole, verifyAdminSessionToken } from "@/lib/admin-session";
import type { AdminRole } from "@/types";

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminSession(allowedRoles?: AdminRole[]) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login");
  }

  if (allowedRoles && !hasAdminRole(session.role, allowedRoles)) {
    redirect("/admin/login?error=forbidden");
  }

  return session;
}

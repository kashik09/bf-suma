import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/password";
import type { AdminRole } from "@/types";

interface AdminUserRow {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  password_hash: string | null;
}

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

export class AdminAuthUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthUnavailableError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function authenticateAdminUser(
  email: string,
  password: string
): Promise<AuthenticatedAdminUser | null> {
  const normalizedEmail = normalizeEmail(email);
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, email, role, is_active, password_hash")
    .eq("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205") {
      throw new AdminAuthUnavailableError("Admin users table is missing. Apply database migrations.");
    }
    throw error;
  }

  const row = (data as AdminUserRow | null) ?? null;
  if (!row || !row.is_active || !row.password_hash) {
    return null;
  }

  if (!verifyPassword(password, row.password_hash)) {
    return null;
  }

  await supabase
    .from("admin_users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", row.id);

  return {
    id: row.id,
    email: row.email,
    role: row.role
  };
}

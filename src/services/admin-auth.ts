import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/password";
import type { AdminRole } from "@/types";

interface AdminUserRow {
  id: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  password_hash: string | null;
  must_reset_password: boolean;
  password_version: number;
}

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  role: AdminRole;
  mustResetPassword: boolean;
  passwordVersion: number;
}

export class AdminAuthUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthUnavailableError";
  }
}

export class PasswordResetRequiredError extends Error {
  userId: string;

  constructor(userId: string) {
    super("Password reset required before continuing.");
    this.name = "PasswordResetRequiredError";
    this.userId = userId;
  }
}

export class WeakPasswordError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super(errors.join(" "));
    this.name = "WeakPasswordError";
    this.errors = errors;
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
    .select("id, email, role, is_active, password_hash, must_reset_password, password_version")
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
    role: row.role,
    mustResetPassword: row.must_reset_password ?? false,
    passwordVersion: row.password_version ?? 1
  };
}

export async function updateAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleSupabaseClient();

  // Fetch current user
  const { data: user, error: fetchError } = await supabase
    .from("admin_users")
    .select("id, password_hash, password_version")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !user) {
    return { success: false, error: "User not found." };
  }

  // Verify current password
  if (!user.password_hash || !verifyPassword(currentPassword, user.password_hash)) {
    return { success: false, error: "Current password is incorrect." };
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(" ") };
  }

  // Hash and update
  const newHash = hashPassword(newPassword);
  const newVersion = (user.password_version ?? 1) + 1;

  const { error: updateError } = await supabase
    .from("admin_users")
    .update({
      password_hash: newHash,
      password_version: newVersion,
      must_reset_password: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: "Failed to update password." };
  }

  return { success: true };
}

export async function forceResetAdminPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // For password reset flow (no current password required)
  const supabase = createServiceRoleSupabaseClient();

  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(" ") };
  }

  const { data: user, error: fetchError } = await supabase
    .from("admin_users")
    .select("id, password_version")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !user) {
    return { success: false, error: "User not found." };
  }

  const newHash = hashPassword(newPassword);
  const newVersion = (user.password_version ?? 1) + 1;

  const { error: updateError } = await supabase
    .from("admin_users")
    .update({
      password_hash: newHash,
      password_version: newVersion,
      must_reset_password: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: "Failed to update password." };
  }

  return { success: true };
}

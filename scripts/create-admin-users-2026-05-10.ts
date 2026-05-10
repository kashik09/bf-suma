#!/usr/bin/env npx ts-node

/**
 * Create Additional Admin Users — 2026-05-10
 *
 * Adds Operations and Executive admin accounts with must_reset_password=true.
 * Idempotent: skips if email already exists.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 *   NEW_ADMIN_OPS_NAME          - e.g. "BF Suma Operations"
 *   NEW_ADMIN_OPS_EMAIL         - e.g. "operations@bfsumauganda.com"
 *   NEW_ADMIN_OPS_TEMP_PASSWORD - Temporary password (12+ chars, complexity)
 *
 *   NEW_ADMIN_EXEC_NAME         - e.g. "BF Suma Executive"
 *   NEW_ADMIN_EXEC_EMAIL        - e.g. "executive@bfsumauganda.com"
 *   NEW_ADMIN_EXEC_TEMP_PASSWORD - Temporary password (12+ chars, complexity)
 *
 * Usage:
 *   NEW_ADMIN_OPS_NAME="BF Suma Operations" \
 *   NEW_ADMIN_OPS_EMAIL="operations@bfsumauganda.com" \
 *   NEW_ADMIN_OPS_TEMP_PASSWORD="TempP@ss123!" \
 *   NEW_ADMIN_EXEC_NAME="BF Suma Executive" \
 *   NEW_ADMIN_EXEC_EMAIL="executive@bfsumauganda.com" \
 *   NEW_ADMIN_EXEC_TEMP_PASSWORD="TempP@ss456!" \
 *   npx ts-node scripts/create-admin-users-2026-05-10.ts
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "node:crypto";

const VALID_ROLES = ["SUPER_ADMIN", "OPERATIONS", "EXECUTIVE", "SUPPORT"] as const;
type AdminRole = (typeof VALID_ROLES)[number];

interface AdminUserInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmed = password.trim();

  if (trimmed.length < 12) {
    errors.push("Password must be at least 12 characters.");
  }
  if (!/[A-Z]/.test(trimmed)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(trimmed)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/\d/.test(trimmed)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(trimmed)) {
    errors.push("Password must contain at least one special character.");
  }

  return { valid: errors.length === 0, errors };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password.trim(), salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

async function createAdminUser(
  supabase: ReturnType<typeof createClient>,
  input: AdminUserInput
): Promise<{ success: boolean; message: string }> {
  const email = input.email.trim().toLowerCase();

  // Check if already exists
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { success: true, message: `SKIPPED: ${email} already exists` };
  }

  // Validate password
  const validation = validatePasswordStrength(input.password);
  if (!validation.valid) {
    return { success: false, message: `FAILED: ${email} - ${validation.errors.join(", ")}` };
  }

  // Hash and insert
  const passwordHash = hashPassword(input.password);

  const { error } = await supabase.from("admin_users").insert({
    name: input.name.trim(),
    email,
    password_hash: passwordHash,
    role: input.role,
    is_active: true,
    must_reset_password: true,
    password_version: 1
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: `SKIPPED: ${email} already exists (race)` };
    }
    return { success: false, message: `FAILED: ${email} - ${error.message}` };
  }

  return { success: true, message: `CREATED: ${email} (${input.role}) - must reset password on login` };
}

async function main() {
  console.log("\n=== Create Admin Users — 2026-05-10 ===\n");

  // Validate Supabase env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(1);
  }

  // Read user inputs
  const opsName = process.env.NEW_ADMIN_OPS_NAME?.trim();
  const opsEmail = process.env.NEW_ADMIN_OPS_EMAIL?.trim();
  const opsPassword = process.env.NEW_ADMIN_OPS_TEMP_PASSWORD;

  const execName = process.env.NEW_ADMIN_EXEC_NAME?.trim();
  const execEmail = process.env.NEW_ADMIN_EXEC_EMAIL?.trim();
  const execPassword = process.env.NEW_ADMIN_EXEC_TEMP_PASSWORD;

  if (!opsName || !opsEmail || !opsPassword) {
    console.error("Error: NEW_ADMIN_OPS_NAME, NEW_ADMIN_OPS_EMAIL, NEW_ADMIN_OPS_TEMP_PASSWORD are required.");
    process.exit(1);
  }

  if (!execName || !execEmail || !execPassword) {
    console.error("Error: NEW_ADMIN_EXEC_NAME, NEW_ADMIN_EXEC_EMAIL, NEW_ADMIN_EXEC_TEMP_PASSWORD are required.");
    process.exit(1);
  }

  // Validate email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(opsEmail)) {
    console.error(`Error: Invalid email format for Operations: ${opsEmail}`);
    process.exit(1);
  }
  if (!emailRegex.test(execEmail)) {
    console.error(`Error: Invalid email format for Executive: ${execEmail}`);
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Define users to create
  const users: AdminUserInput[] = [
    {
      name: opsName,
      email: opsEmail,
      password: opsPassword,
      role: "OPERATIONS"
    },
    {
      name: execName,
      email: execEmail,
      password: execPassword,
      role: "EXECUTIVE" // Client/business owner — same permissions as OPERATIONS
    }
  ];

  // Create each user
  let allSuccess = true;
  for (const user of users) {
    const result = await createAdminUser(supabase, user);
    console.log(result.message);
    if (!result.success) {
      allSuccess = false;
    }
  }

  console.log("\n=== Done ===\n");

  if (!allSuccess) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

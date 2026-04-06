#!/usr/bin/env npx ts-node

/**
 * Production Admin Bootstrap Script
 *
 * Creates the first admin user in production environments.
 * Uses environment variables for credentials - never hardcode in code.
 *
 * Required environment variables:
 *   BOOTSTRAP_ADMIN_EMAIL    - Admin email address
 *   BOOTSTRAP_ADMIN_PASSWORD - Strong password (12+ chars, complexity required)
 *   BOOTSTRAP_ADMIN_NAME     - Admin display name
 *
 * Optional:
 *   BOOTSTRAP_ADMIN_ROLE     - Role (SUPER_ADMIN, OPERATIONS, SUPPORT). Default: SUPER_ADMIN
 *
 * Usage:
 *   # Set env vars and run
 *   BOOTSTRAP_ADMIN_EMAIL="admin@yourcompany.com" \
 *   BOOTSTRAP_ADMIN_PASSWORD="YourSecureP@ssw0rd123" \
 *   BOOTSTRAP_ADMIN_NAME="Admin User" \
 *   npx ts-node scripts/bootstrap-admin.ts
 *
 *   # Or with dotenv
 *   npx dotenv -e .env.production -- ts-node scripts/bootstrap-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "node:crypto";

const VALID_ROLES = ["SUPER_ADMIN", "OPERATIONS", "SUPPORT"] as const;
type AdminRole = (typeof VALID_ROLES)[number];

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

  const lowerPassword = trimmed.toLowerCase();
  const weakPatterns = ["password", "admin", "123456", "qwerty", "letmein", "welcome"];
  if (weakPatterns.some((pattern) => lowerPassword.includes(pattern))) {
    errors.push("Password contains a common weak pattern.");
  }

  return { valid: errors.length === 0, errors };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password.trim(), salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

async function main() {
  console.log("\n=== Admin Bootstrap Script ===\n");

  // Validate required env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
  const role = (process.env.BOOTSTRAP_ADMIN_ROLE?.toUpperCase() || "SUPER_ADMIN") as AdminRole;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
    process.exit(1);
  }

  if (!email) {
    console.error("Error: BOOTSTRAP_ADMIN_EMAIL is required.");
    process.exit(1);
  }

  if (!password) {
    console.error("Error: BOOTSTRAP_ADMIN_PASSWORD is required.");
    process.exit(1);
  }

  if (!name) {
    console.error("Error: BOOTSTRAP_ADMIN_NAME is required.");
    process.exit(1);
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Error: Invalid email format.");
    process.exit(1);
  }

  // Validate role
  if (!VALID_ROLES.includes(role)) {
    console.error(`Error: Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    console.error("Error: Password does not meet security requirements:");
    passwordValidation.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Check if any admin user already exists
  const { data: existingAdmins, error: checkError } = await supabase
    .from("admin_users")
    .select("id, email")
    .limit(1);

  if (checkError) {
    if (checkError.code === "PGRST205") {
      console.error("Error: admin_users table does not exist. Run migrations first.");
    } else {
      console.error("Error checking existing admins:", checkError.message);
    }
    process.exit(1);
  }

  if (existingAdmins && existingAdmins.length > 0) {
    console.log("Warning: Admin user(s) already exist in database.");
    console.log("Existing admin:", existingAdmins[0].email);

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question("Do you want to add another admin? (yes/no): ", resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  // Hash password
  const passwordHash = hashPassword(password);

  // Insert admin user
  const { data: newAdmin, error: insertError } = await supabase
    .from("admin_users")
    .insert({
      name,
      email,
      password_hash: passwordHash,
      role,
      is_active: true,
      must_reset_password: false // Production admin doesn't need reset
    })
    .select("id, email, role")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      console.error(`Error: Admin with email "${email}" already exists.`);
    } else {
      console.error("Error creating admin:", insertError.message);
    }
    process.exit(1);
  }

  console.log("\n=== Admin Created Successfully ===\n");
  console.log(`Email: ${newAdmin.email}`);
  console.log(`Role: ${newAdmin.role}`);
  console.log(`ID: ${newAdmin.id}`);
  console.log("\nYou can now login at /admin/login");
  console.log("\n");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});

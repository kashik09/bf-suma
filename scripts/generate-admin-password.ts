#!/usr/bin/env npx ts-node

/**
 * Generate a password hash for admin user seeding.
 *
 * Usage:
 *   npx ts-node scripts/generate-admin-password.ts <password>
 *
 * Example:
 *   npx ts-node scripts/generate-admin-password.ts "MySecure@Password123"
 *
 * Password requirements:
 *   - Minimum 12 characters
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one number
 *   - At least one special character
 *
 * For production admin setup, prefer using:
 *   npx ts-node scripts/bootstrap-admin.ts
 */

import { randomBytes, scryptSync } from "node:crypto";

const PASSWORD_HASH_PREFIX = "scrypt";
const SALT_BYTES = 16;
const HASH_BYTES = 64;

function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmed = password.trim();

  if (trimmed.length < 12) {
    errors.push("Password must be at least 12 characters.");
  }
  if (!/[A-Z]/.test(trimmed)) {
    errors.push("Must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(trimmed)) {
    errors.push("Must contain at least one lowercase letter.");
  }
  if (!/\d/.test(trimmed)) {
    errors.push("Must contain at least one number.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(trimmed)) {
    errors.push("Must contain at least one special character.");
  }

  const lowerPassword = trimmed.toLowerCase();
  const weakPatterns = ["password", "admin", "123456", "qwerty", "letmein", "welcome"];
  if (weakPatterns.some((pattern) => lowerPassword.includes(pattern))) {
    errors.push("Contains a common weak pattern.");
  }

  return { valid: errors.length === 0, errors };
}

function hashPassword(password: string): string {
  const trimmed = password.trim();
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = scryptSync(trimmed, salt, HASH_BYTES).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derived}`;
}

const password = process.argv[2];

if (!password) {
  console.error("\nUsage: npx ts-node scripts/generate-admin-password.ts <password>\n");
  console.error("Password requirements:");
  console.error("  - Minimum 12 characters");
  console.error("  - At least one uppercase letter");
  console.error("  - At least one lowercase letter");
  console.error("  - At least one number");
  console.error("  - At least one special character\n");
  console.error("Example: npx ts-node scripts/generate-admin-password.ts \"MySecure@Pass123\"\n");
  process.exit(1);
}

const validation = validatePasswordStrength(password);
if (!validation.valid) {
  console.error("\nError: Password does not meet security requirements:\n");
  validation.errors.forEach((err) => console.error(`  - ${err}`));
  console.error("\n");
  process.exit(1);
}

const hash = hashPassword(password);

console.log("\n=== Admin Password Hash Generated ===\n");
console.log("Password Hash:");
console.log(hash);
console.log("\n=== SQL Insert Statement ===\n");
console.log(`INSERT INTO public.admin_users (name, email, password_hash, role, is_active, must_reset_password)
VALUES ('Admin User', 'admin@example.com', '${hash}', 'SUPER_ADMIN', true, false);`);
console.log("\nNote: For production, prefer using: npx ts-node scripts/bootstrap-admin.ts\n");

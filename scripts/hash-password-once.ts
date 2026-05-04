#!/usr/bin/env npx tsx

/**
 * Hash a password using the app's existing scrypt implementation.
 *
 * Usage:
 *   npx tsx scripts/hash-password-once.ts "YourPassword123!"
 */

import { hashPassword } from "../src/lib/password";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npx tsx scripts/hash-password-once.ts <password>");
  process.exit(1);
}

try {
  const hash = hashPassword(password);
  console.log(hash);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

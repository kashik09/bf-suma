import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_HASH_PREFIX = "scrypt";
const SALT_BYTES = 16;
const HASH_BYTES = 64;

export function hashPassword(password: string): string {
  const trimmed = password.trim();
  if (trimmed.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = scryptSync(trimmed, salt, HASH_BYTES).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [prefix, salt, expectedHash] = storedHash.split("$");
  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !expectedHash) {
    return false;
  }

  const derived = scryptSync(password, salt, HASH_BYTES).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const derivedBuffer = Buffer.from(derived, "hex");

  if (expectedBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, derivedBuffer);
}

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_HASH_PREFIX = "scrypt";
const SALT_BYTES = 16;
const HASH_BYTES = 64;

const MIN_PASSWORD_LENGTH = 12;
const PASSWORD_REQUIREMENTS = {
  minLength: MIN_PASSWORD_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const trimmed = password.trim();

  if (trimmed.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters.`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(trimmed)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(trimmed)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(trimmed)) {
    errors.push("Password must contain at least one number.");
  }

  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(trimmed)) {
    errors.push("Password must contain at least one special character.");
  }

  // Check for common weak patterns
  const lowerPassword = trimmed.toLowerCase();
  const weakPatterns = ["password", "admin", "123456", "qwerty", "letmein", "welcome"];
  if (weakPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push("Password contains a common weak pattern.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function hashPassword(password: string): string {
  const trimmed = password.trim();
  const validation = validatePasswordStrength(trimmed);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derived = scryptSync(trimmed, salt, HASH_BYTES).toString("hex");
  return `${PASSWORD_HASH_PREFIX}$${salt}$${derived}`;
}

export function hashPasswordUnsafe(password: string): string {
  // For migration/bootstrap scripts only - skips strength validation
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

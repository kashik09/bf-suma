#!/usr/bin/env npx tsx

/**
 * Admin User Management Script
 *
 * Commands:
 *   list                           - List all admin users
 *   create <email> <name> <role>   - Create new admin (prompts for password)
 *   delete <email>                 - Delete admin user
 *   reset <email>                  - Set new password
 *   deactivate <email>             - Deactivate admin account
 *   activate <email>               - Reactivate admin account
 *
 * Roles: SUPER_ADMIN, OPERATIONS, EXECUTIVE, SUPPORT
 *
 * Usage:
 *   npx tsx scripts/manage-admin.ts list
 *   npx tsx scripts/manage-admin.ts create admin@example.com "John Doe" OPERATIONS
 *   npx tsx scripts/manage-admin.ts delete old@example.com
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { randomBytes, scryptSync } from "node:crypto";
import * as readline from "node:readline";

const VALID_ROLES = ["SUPER_ADMIN", "OPERATIONS", "EXECUTIVE", "SUPPORT"] as const;
type AdminRole = (typeof VALID_ROLES)[number];

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const trimmed = password.trim();

  if (trimmed.length < 12) errors.push("Must be at least 12 characters");
  if (!/[A-Z]/.test(trimmed)) errors.push("Must have uppercase letter");
  if (!/[a-z]/.test(trimmed)) errors.push("Must have lowercase letter");
  if (!/\d/.test(trimmed)) errors.push("Must have a number");
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(trimmed)) errors.push("Must have special character");

  return { valid: errors.length === 0, errors };
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password.trim(), salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function getEnvConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
    process.exit(1);
  }

  return { url, key };
}

async function supabaseQuery(
  method: string,
  table: string,
  options: {
    select?: string;
    filter?: Record<string, string>;
    body?: Record<string, unknown>;
    order?: string;
    single?: boolean;
  } = {}
) {
  const { url, key } = getEnvConfig();
  const baseUrl = `${url}/rest/v1/${table}`;

  const params = new URLSearchParams();
  if (options.select) params.set("select", options.select);
  if (options.filter) {
    for (const [col, val] of Object.entries(options.filter)) {
      params.set(col, `eq.${val}`);
    }
  }
  if (options.order) params.set("order", options.order);

  const queryUrl = `${baseUrl}?${params.toString()}`;

  const headers: Record<string, string> = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": options.single ? "return=representation" : "return=minimal"
  };

  if (method === "GET" && options.single) {
    headers["Accept"] = "application/vnd.pgrst.object+json";
  }

  const response = await fetch(queryUrl, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${text}`);
  }

  if (method === "GET" || options.single) {
    return response.json();
  }
  return null;
}

async function listAdmins() {
  const data = await supabaseQuery("GET", "admin_users", {
    select: "id,name,email,role,is_active,must_reset_password,created_at",
    order: "created_at.asc"
  });

  console.log("\n=== Admin Users ===\n");
  if (!data || data.length === 0) {
    console.log("No admin users found.");
    return;
  }

  console.log("EMAIL                          ROLE          ACTIVE  RESET   NAME");
  console.log("-".repeat(80));
  for (const user of data) {
    const email = user.email.padEnd(30);
    const role = user.role.padEnd(12);
    const active = user.is_active ? "YES" : "NO ";
    const reset = user.must_reset_password ? "YES" : "NO ";
    console.log(`${email} ${role}  ${active}     ${reset}    ${user.name}`);
  }
  console.log();
}

async function createAdmin(email: string, name: string, role: string) {
  if (!VALID_ROLES.includes(role as AdminRole)) {
    console.error(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("Invalid email format");
    process.exit(1);
  }

  console.log(`\nCreating admin: ${email} (${role})`);
  console.log("Password requirements: 12+ chars, uppercase, lowercase, number, special char\n");

  const password = await prompt("Enter password: ");
  const validation = validatePasswordStrength(password);

  if (!validation.valid) {
    console.error("Password invalid:", validation.errors.join(", "));
    process.exit(1);
  }

  // Check if exists
  const existing = await supabaseQuery("GET", "admin_users", {
    select: "id",
    filter: { email: email.toLowerCase() }
  });

  if (existing && existing.length > 0) {
    console.error(`Admin ${email} already exists`);
    process.exit(1);
  }

  const { url, key } = getEnvConfig();
  const response = await fetch(`${url}/rest/v1/admin_users`, {
    method: "POST",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      role,
      is_active: true,
      must_reset_password: true,
      password_version: 1
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error:", text);
    process.exit(1);
  }

  console.log(`\nCreated: ${email} (${role}) - must reset password on first login`);
}

async function deleteAdmin(email: string) {
  const existing = await supabaseQuery("GET", "admin_users", {
    select: "id,name,role",
    filter: { email: email.toLowerCase() }
  });

  if (!existing || existing.length === 0) {
    console.error(`Admin ${email} not found`);
    process.exit(1);
  }

  const user = existing[0];
  console.log(`\nDeleting: ${user.name} (${email}) - ${user.role}`);
  const confirm = await prompt("Type 'DELETE' to confirm: ");

  if (confirm !== "DELETE") {
    console.log("Cancelled");
    process.exit(0);
  }

  const { url, key } = getEnvConfig();
  const response = await fetch(`${url}/rest/v1/admin_users?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
    method: "DELETE",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error:", text);
    process.exit(1);
  }

  console.log(`Deleted: ${email}`);
}

async function resetPassword(email: string) {
  const existing = await supabaseQuery("GET", "admin_users", {
    select: "id,password_version",
    filter: { email: email.toLowerCase() }
  });

  if (!existing || existing.length === 0) {
    console.error(`Admin ${email} not found`);
    process.exit(1);
  }

  console.log(`\nSetting new password for: ${email}`);
  console.log("Password requirements: 12+ chars, uppercase, lowercase, number, special char\n");

  const password = await prompt("Enter new password: ");
  const validation = validatePasswordStrength(password);

  if (!validation.valid) {
    console.error("Password invalid:", validation.errors.join(", "));
    process.exit(1);
  }

  const { url, key } = getEnvConfig();
  const response = await fetch(`${url}/rest/v1/admin_users?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password_hash: hashPassword(password),
      must_reset_password: false,
      password_version: (existing[0].password_version || 1) + 1
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error:", text);
    process.exit(1);
  }

  console.log(`Password updated for: ${email}`);
}

async function setActiveStatus(email: string, active: boolean) {
  const { url, key } = getEnvConfig();
  const response = await fetch(`${url}/rest/v1/admin_users?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ is_active: active })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error:", text);
    process.exit(1);
  }

  console.log(`${active ? "Activated" : "Deactivated"}: ${email}`);
}

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "list":
      await listAdmins();
      break;

    case "create":
      if (args.length < 3) {
        console.error("Usage: create <email> <name> <role>");
        console.error(`Roles: ${VALID_ROLES.join(", ")}`);
        process.exit(1);
      }
      await createAdmin(args[0], args[1], args[2]);
      break;

    case "delete":
      if (!args[0]) {
        console.error("Usage: delete <email>");
        process.exit(1);
      }
      await deleteAdmin(args[0]);
      break;

    case "reset":
      if (!args[0]) {
        console.error("Usage: reset <email>");
        process.exit(1);
      }
      await resetPassword(args[0]);
      break;

    case "deactivate":
      if (!args[0]) {
        console.error("Usage: deactivate <email>");
        process.exit(1);
      }
      await setActiveStatus(args[0], false);
      break;

    case "activate":
      if (!args[0]) {
        console.error("Usage: activate <email>");
        process.exit(1);
      }
      await setActiveStatus(args[0], true);
      break;

    default:
      console.log(`
Admin User Management

Commands:
  list                           List all admin users
  create <email> <name> <role>   Create new admin
  delete <email>                 Delete admin user
  reset <email>                  Set new password
  deactivate <email>             Deactivate account
  activate <email>               Reactivate account

Roles: ${VALID_ROLES.join(", ")}

Examples:
  npx tsx scripts/manage-admin.ts list
  npx tsx scripts/manage-admin.ts create admin@bfsuma.com "John Doe" SUPER_ADMIN
  npx tsx scripts/manage-admin.ts delete old@example.com
  npx tsx scripts/manage-admin.ts reset admin@bfsuma.com
`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});

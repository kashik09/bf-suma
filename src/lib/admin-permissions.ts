import type { AdminRole } from "@/types";

/**
 * Roles that can create and edit records.
 * EXECUTIVE has identical permissions to OPERATIONS.
 */
export const OPERATIONAL_ROLES: AdminRole[] = ["SUPER_ADMIN", "OPERATIONS", "EXECUTIVE"];

/**
 * Roles with view-only access.
 */
export const VIEW_ONLY_ROLES: AdminRole[] = ["SUPPORT"];

/**
 * All valid admin roles.
 */
export const ALL_ADMIN_ROLES: AdminRole[] = [...OPERATIONAL_ROLES, ...VIEW_ONLY_ROLES];

/**
 * Check if role can create/edit records.
 */
export function canEdit(role: AdminRole | string | undefined): boolean {
  if (!role) return false;
  return OPERATIONAL_ROLES.includes(role as AdminRole);
}

/**
 * Check if role can access admin panel.
 */
export function canViewAdmin(role: AdminRole | string | undefined): boolean {
  if (!role) return false;
  return ALL_ADMIN_ROLES.includes(role as AdminRole);
}

/**
 * Check if role can delete records (SUPER_ADMIN only).
 */
export function canDelete(role: AdminRole | string | undefined): boolean {
  return role === "SUPER_ADMIN";
}

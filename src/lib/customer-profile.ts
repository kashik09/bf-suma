export interface StoredCustomerProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

const CUSTOMER_PROFILE_KEY = "bf_suma_customer_profile_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getStoredCustomerProfile(): StoredCustomerProfile | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCustomerProfile;
    if (!parsed || typeof parsed.email !== "string") return null;
    const email = normalizeEmail(parsed.email);
    if (!email) return null;
    return {
      email,
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : undefined,
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : undefined
    };
  } catch {
    return null;
  }
}

export function setStoredCustomerProfile(profile: StoredCustomerProfile): void {
  if (!canUseStorage()) return;
  const normalized = normalizeEmail(profile.email);
  if (!normalized) return;

  window.localStorage.setItem(
    CUSTOMER_PROFILE_KEY,
    JSON.stringify({
      email: normalized,
      firstName: profile.firstName?.trim() || "",
      lastName: profile.lastName?.trim() || ""
    })
  );
}

export function clearStoredCustomerProfile(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CUSTOMER_PROFILE_KEY);
}

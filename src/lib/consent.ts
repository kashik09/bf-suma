export type ConsentLevel = "all" | "essential";

export const CONSENT_STORAGE_KEY = "cookie-consent";
export const CONSENT_CHANGE_EVENT = "cookie-consent-changed";

export function getConsentLevel(): ConsentLevel | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (value === "all" || value === "essential") return value;
  return null;
}

export function hasConsent(): boolean {
  return getConsentLevel() !== null;
}

export function setConsent(level: ConsentLevel): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, level);
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { level } }));
}

import { getConsentLevel } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function resolveDoNotTrackValue(): string | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;

  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  return nav.doNotTrack || win.doNotTrack || nav.msDoNotTrack || null;
}

export function isDoNotTrackEnabled(): boolean {
  const value = resolveDoNotTrackValue();
  if (!value) return false;
  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "yes";
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (isDoNotTrackEnabled()) return;
  if (getConsentLevel() !== "all") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, params);
}

"use client";

import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, hasConsent, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasConsent());

    function handleConsentChange() {
      setVisible(!hasConsent());
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange as EventListener);
    window.addEventListener("storage", handleConsentChange);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange as EventListener);
      window.removeEventListener("storage", handleConsentChange);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 p-4 text-slate-100 shadow-2xl backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
          We use cookies to improve your experience and track analytics. Essential cookies are always active.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-500 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => {
              setConsent("essential");
              setVisible(false);
            }}
            type="button"
          >
            Essential Only
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition hover:bg-brand-600"
            onClick={() => {
              setConsent("all");
              setVisible(false);
            }}
            type="button"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

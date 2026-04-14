"use client";

import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, type ConsentLevel, getConsentLevel, setConsent } from "@/lib/consent";

export function CookieSettingsPanel() {
  const [consent, setConsentState] = useState<ConsentLevel | null>(null);

  useEffect(() => {
    setConsentState(getConsentLevel());

    function handleChange() {
      setConsentState(getConsentLevel());
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, handleChange as EventListener);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, handleChange as EventListener);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return (
    <section className="not-prose rounded-xl border border-slate-200 bg-slate-50 p-4" id="cookie-settings">
      <h3 className="text-base font-semibold text-slate-900">Cookie Settings</h3>
      <p className="mt-2 text-sm text-slate-600">
        Current setting: <span className="font-semibold text-slate-900">{consent ?? "not selected"}</span>
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          onClick={() => setConsent("essential")}
          type="button"
        >
          Essential Only
        </button>
        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          onClick={() => setConsent("all")}
          type="button"
        >
          Accept All
        </button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CONSENT_CHANGE_EVENT, hasConsent, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState<"accept" | "decline">("decline");

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
    <div className="fixed inset-0 z-50 bg-black/50 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          aria-labelledby="cookie-preferences-title"
          aria-modal="true"
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          role="dialog"
        >
          <h2 className="text-2xl font-bold text-slate-900" id="cookie-preferences-title">
            Cookie Preferences
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            We use cookies to improve your experience and track analytics. Choose your preference below.
          </p>

          <div className="mt-5 space-y-3">
            <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Essential Cookies</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Always active. Required for the site to function.
                  </p>
                </div>
                <span className="inline-flex h-7 items-center rounded-full bg-emerald-100 px-2.5 text-xs font-semibold text-emerald-700">
                  Always On
                </span>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">Analytics Cookies</p>
              <p className="mt-1 text-sm text-slate-600">
                Helps us understand how visitors use the site (Google Analytics).
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-semibold transition ${
                    analyticsChoice === "accept"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setAnalyticsChoice("accept")}
                  type="button"
                >
                  Accept
                </button>
                <button
                  className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-semibold transition ${
                    analyticsChoice === "decline"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setAnalyticsChoice("decline")}
                  type="button"
                >
                  Decline
                </button>
              </div>
            </section>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              onClick={() => {
                setConsent("essential");
                setVisible(false);
              }}
              type="button"
            >
              Essential Only
            </button>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
    </div>
  );
}

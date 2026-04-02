"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastPayload {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastPayload, "title" | "variant" | "duration">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  toast: (payload: ToastPayload) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION = 3600;

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-700/90 bg-emerald-950 text-emerald-50",
  error: "border-rose-700/80 bg-rose-950 text-rose-50",
  info: "border-slate-700 bg-slate-900 text-slate-50"
};

const variantBadgeStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-700/80 text-emerald-50",
  error: "bg-rose-700/80 text-rose-50",
  info: "bg-slate-700 text-slate-50"
};

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((entry) => entry.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const toast = useCallback(
    ({ id, title, description, variant = "info", duration = DEFAULT_DURATION }: ToastPayload) => {
      const toastId = id || makeId();
      const nextItem: ToastItem = {
        id: toastId,
        title,
        description,
        variant,
        duration
      };

      setToasts((current) => [...current.filter((entry) => entry.id !== toastId), nextItem]);

      const existingTimer = timersRef.current.get(toastId);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
        timersRef.current.delete(toastId);
      }

      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(toastId), duration);
        timersRef.current.set(toastId, timer);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss, clear }), [toast, dismiss, clear]);
  const portalTarget = isMounted ? document.body : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalTarget
        ? createPortal(
            <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,24rem)] flex-col gap-2">
              {toasts.map((item) => (
                <div
                  className={cn(
                    "pointer-events-auto rounded-xl border px-3 py-3 shadow-card",
                    "transition-transform duration-200",
                    variantStyles[item.variant]
                  )}
                  key={item.id}
                  role="status"
                >
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase", variantBadgeStyles[item.variant])}>
                      {item.variant}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.description ? <p className="mt-0.5 text-xs text-current/90">{item.description}</p> : null}
                    </div>
                    <button
                      aria-label="Dismiss notification"
                      className="rounded-md p-1 text-current/80 transition hover:bg-white/10 hover:text-current"
                      onClick={() => dismiss(item.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>,
            portalTarget
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

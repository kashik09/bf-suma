"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("relative w-full max-w-lg rounded-lg bg-white p-5 shadow-card")}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-semibold">{title}</h3>
          <button
            ref={closeButtonRef}
            className="text-sm text-slate-500 hover:text-slate-700"
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

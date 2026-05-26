"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useCartDrawer } from "./cart-drawer-context";
import { CartPanel } from "./cart-panel";

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      setIsVisible(false);
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[110] bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Drawer panel */}
      <div
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed bottom-0 right-0 top-0 z-[111] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
          <button
            ref={closeButtonRef}
            aria-label="Close cart"
            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={close}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <CartPanel />
        </div>
      </div>
    </>,
    document.body
  );
}

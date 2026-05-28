"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { STORE_NAV_LINKS } from "@/lib/constants";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = STORE_NAV_LINKS;

  return (
    <>
      {/* Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Image
              alt="BF Suma"
              src="/bf-suma-logo.png"
              width={100}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="block rounded-md bg-slate-900 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Shop Now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

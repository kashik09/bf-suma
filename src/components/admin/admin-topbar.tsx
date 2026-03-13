"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Menu button (mobile) & Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className={cn("hidden sm:block", searchOpen && "hidden")}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:hidden"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <Link
            href="/admin/settings"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-medium text-slate-700">Admin</p>
              <p className="text-[10px] text-slate-500">Operations</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="border-t border-slate-100 px-4 py-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              autoFocus
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

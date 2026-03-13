"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Package, Search, ShoppingBag, User, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "order" | "customer" | "stock";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order",
    message: "Order #ORD-2024-089 received from John Doe",
    time: "2 min ago",
    read: false
  },
  {
    id: "2",
    type: "customer",
    title: "New Customer",
    message: "Jane Smith just registered",
    time: "15 min ago",
    read: false
  },
  {
    id: "3",
    type: "stock",
    title: "Low Stock Alert",
    message: "Reishi Coffee is running low (5 left)",
    time: "1 hour ago",
    read: false
  },
  {
    id: "4",
    type: "order",
    title: "Order Delivered",
    message: "Order #ORD-2024-085 was delivered",
    time: "2 hours ago",
    read: true
  },
  {
    id: "5",
    type: "order",
    title: "New Order",
    message: "Order #ORD-2024-088 received from Mike Wilson",
    time: "3 hours ago",
    read: true
  }
];

const notificationIcons = {
  order: ShoppingBag,
  customer: UserPlus,
  stock: Package
};

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {mockNotifications.map((notif) => {
                    const Icon = notificationIcons[notif.type];
                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                          !notif.read && "bg-brand-50/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            notif.type === "order" && "bg-blue-100 text-blue-600",
                            notif.type === "customer" && "bg-emerald-100 text-emerald-600",
                            notif.type === "stock" && "bg-amber-100 text-amber-600"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                          <p className="truncate text-xs text-slate-500">{notif.message}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-slate-100 px-4 py-2">
                  <Link
                    href="/admin/notifications"
                    className="block text-center text-xs font-medium text-brand-600 hover:text-brand-700"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

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

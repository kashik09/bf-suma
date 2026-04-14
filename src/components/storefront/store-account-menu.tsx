"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSession, signOut } from "@/lib/auth/customer-auth";

function resolveDisplayName(email: string | null, firstName: string | null) {
  if (firstName && firstName.trim().length > 0) return firstName.trim();
  if (!email) return "Account";
  const [localPart] = email.split("@");
  return localPart || "Account";
}

export function StoreAccountMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((session) => {
        if (!mounted) return;
        const user = session?.user;
        setEmail(user?.email || null);
        const metadata = user?.user_metadata as { first_name?: string } | undefined;
        setFirstName(metadata?.first_name || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isSignedIn = Boolean(email);
  const displayName = useMemo(() => resolveDisplayName(email, firstName), [email, firstName]);

  if (loading) {
    return (
      <span className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-500">
        Account
      </span>
    );
  }

  if (!isSignedIn) {
    return (
      <Link
        className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        href="/account/login"
      >
        Sign In
      </Link>
    );
  }

  return (
    <details className="relative">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
        {displayName}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-44 rounded-md border border-slate-200 bg-white p-1.5 shadow-card">
        <Link
          className="block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
          href="/account/dashboard"
        >
          Dashboard
        </Link>
        <button
          className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
          onClick={async () => {
            await signOut();
            router.push("/account/login");
            router.refresh();
          }}
          type="button"
        >
          Sign Out
        </button>
      </div>
    </details>
  );
}

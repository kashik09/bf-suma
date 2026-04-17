"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "@/lib/auth/customer-auth";
import {
  WISHLIST_UPDATED_EVENT,
  addToWishlist,
  clearWishlist,
  getWishlist,
  toggleWishlist
} from "@/lib/wishlist";

interface WishlistSyncResponse {
  slugs?: string[];
}

function normalizeSlugs(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const slugs: string[] = [];

  values.forEach((value) => {
    if (typeof value !== "string") return;
    const slug = value.trim();
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    slugs.push(slug);
  });

  return slugs;
}

function replaceLocalWishlist(slugs: string[]) {
  clearWishlist();
  slugs.forEach((slug) => addToWishlist(slug));
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(() => getWishlist());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshWishlist = useCallback(() => {
    setWishlist(getWishlist());
  }, []);

  const syncFromAccount = useCallback(async (localSlugs: string[]) => {
    try {
      const response = await fetch("/api/account/wishlist/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: localSlugs })
      });

      if (!response.ok) return;

      const payload = (await response.json()) as WishlistSyncResponse;
      const mergedSlugs = normalizeSlugs(payload.slugs);
      replaceLocalWishlist(mergedSlugs);
      setWishlist(getWishlist());
    } catch {
      // Best effort sync only.
    }
  }, []);

  useEffect(() => {
    const sync = () => refreshWishlist();

    sync();
    window.addEventListener(WISHLIST_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [refreshWishlist]);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      try {
        const session = await getSession();
        const hasSession = Boolean(session?.user?.email);

        if (!isActive) return;
        setIsLoggedIn(hasSession);

        if (!hasSession) return;
        await syncFromAccount(getWishlist());
      } catch {
        if (isActive) setIsLoggedIn(false);
      }
    };

    void initialize();

    return () => {
      isActive = false;
    };
  }, [syncFromAccount]);

  const toggle = useCallback(
    (slug: string) => {
      const nextState = toggleWishlist(slug);
      const nextWishlist = getWishlist();
      setWishlist(nextWishlist);

      if (isLoggedIn) {
        void fetch("/api/account/wishlist", {
          method: nextState ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug })
        }).catch(() => undefined);
      }

      return nextState;
    },
    [isLoggedIn]
  );

  const isWishlisted = useCallback(
    (slug: string) => {
      const normalized = slug.trim();
      if (!normalized) return false;
      return wishlist.includes(normalized);
    },
    [wishlist]
  );

  const count = useMemo(() => wishlist.length, [wishlist]);

  return {
    wishlist,
    toggle,
    isWishlisted,
    count
  };
}

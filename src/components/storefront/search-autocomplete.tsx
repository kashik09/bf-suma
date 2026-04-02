"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import type { StorefrontProduct } from "@/types";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 6;
const DEBOUNCE_MS = 180;

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function rankProducts(products: StorefrontProduct[], query: string) {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  return products
    .map((product) => {
      const name = normalizeText(product.name);
      const category = normalizeText(product.category_name);
      const description = normalizeText(product.description);
      const exact = name === normalized;
      const starts = name.startsWith(normalized);
      const contains = name.includes(normalized);
      const meta = category.includes(normalized) || description.includes(normalized);

      if (!exact && !starts && !contains && !meta) return null;

      let score = 4;
      if (exact) score = 0;
      else if (starts) score = 1;
      else if (contains) score = 2;
      else if (meta) score = 3;

      return { product, score };
    })
    .filter((entry): entry is { product: StorefrontProduct; score: number } => Boolean(entry))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.product.name.localeCompare(b.product.name);
    })
    .map((entry) => entry.product)
    .slice(0, MAX_RESULTS);
}

export function SearchAutocomplete({
  className,
  placeholder = "Search products...",
  onNavigate
}: SearchAutocompleteProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<StorefrontProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const canSearch = useMemo(() => query.trim().length >= MIN_QUERY_LENGTH, [query]);

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");
        const payload = (await response.json()) as StorefrontProduct[];
        const ranked = rankProducts(Array.isArray(payload) ? payload : [], query);
        setResults(ranked);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [canSearch, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToShopSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/shop");
    } else {
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        navigateToShopSearch();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        router.push(`/shop/${results[activeIndex].slug}`);
      } else {
        navigateToShopSearch();
      }
      setOpen(false);
      setActiveIndex(-1);
      onNavigate?.();
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={className} ref={rootRef}>
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          navigateToShopSearch();
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label="Search products"
          className="pr-9 pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (canSearch) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              setActiveIndex(-1);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {open ? (
        <div className="relative z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          {loading ? <p className="px-3 py-2 text-sm text-slate-600">Searching...</p> : null}

          {!loading && results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-600">No products found. Press Enter to view shop results.</p>
          ) : null}

          {!loading && results.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((product, index) => (
                <li key={product.id}>
                  <Link
                    className={`flex items-center justify-between gap-3 px-3 py-2 text-sm transition ${
                      activeIndex === index ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`}
                    href={`/shop/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setActiveIndex(-1);
                      onNavigate?.();
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{product.name}</span>
                      <span className="block truncate text-xs text-slate-500">{product.category_name}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

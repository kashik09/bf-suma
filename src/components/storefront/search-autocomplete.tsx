"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  image_url: string | null;
  category_name: string;
}

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

export function SearchAutocomplete({
  className,
  placeholder = "Search products...",
  onNavigate
}: SearchAutocompleteProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const canSearch = useMemo(() => query.trim().length >= MIN_QUERY_LENGTH, [query]);

  // Compute inline autocomplete suggestion from first result
  const suggestionTail = useMemo(() => {
    if (!results.length || !query.trim()) return "";
    const firstMatch = results[0].name;
    const lowerQuery = query.trim().toLowerCase();
    const lowerMatch = firstMatch.toLowerCase();
    if (lowerMatch.startsWith(lowerQuery)) {
      return firstMatch.slice(query.trim().length);
    }
    return "";
  }, [results, query]);

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
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!response.ok) throw new Error("Search failed");
        const payload = await response.json();
        setResults(Array.isArray(payload.products) ? payload.products : []);
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

  function acceptSuggestion() {
    if (suggestionTail) {
      setQuery(query.trim() + suggestionTail);
    }
  }

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
    // Tab or Right Arrow accepts inline suggestion
    if ((event.key === "Tab" || event.key === "ArrowRight") && suggestionTail) {
      // Only accept on ArrowRight if cursor is at end
      const input = inputRef.current;
      if (event.key === "ArrowRight" && input && input.selectionStart !== query.length) {
        return; // Let arrow key move cursor normally
      }
      event.preventDefault();
      acceptSuggestion();
      return;
    }

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
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

        {/* Input with inline autocomplete overlay */}
        <div className="relative">
          {/* Ghost text overlay for autocomplete suggestion */}
          {suggestionTail && (
            <div className="pointer-events-none absolute inset-0 flex items-center pl-9 pr-9">
              <span className="text-sm">
                <span className="invisible">{query}</span>
                <span className="text-slate-400">{suggestionTail}</span>
              </span>
            </div>
          )}

          <input
            ref={inputRef}
            aria-label="Search products"
            className={cn(
              "h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 pl-9 pr-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-0"
            )}
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (canSearch) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>

        {query ? (
          <button
            aria-label="Clear search"
            className="absolute right-2 top-1/2 z-10 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
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
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
          ) : null}

          {!loading && !canSearch ? (
            <p className="px-4 py-3 text-sm text-slate-500">Type to search products</p>
          ) : null}

          {!loading && canSearch && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">
              No products match &quot;{query.trim()}&quot;
            </p>
          ) : null}

          {!loading && results.length > 0 ? (
            <ul className="max-h-64 overflow-auto py-1">
              {results.map((product, index) => (
                <li key={product.id}>
                  <Link
                    className={`flex items-center gap-3 px-4 py-2.5 transition ${
                      activeIndex === index
                        ? "bg-slate-100"
                        : "hover:bg-slate-50"
                    }`}
                    href={`/shop/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setActiveIndex(-1);
                      onNavigate?.();
                    }}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                      <Image
                        alt=""
                        className="object-contain"
                        fill
                        sizes="40px"
                        src={product.image_url || "/catalog-images/placeholder.svg"}
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {product.category_name}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatPrice(product.price, product.currency)}
                    </p>
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

export default SearchAutocomplete;

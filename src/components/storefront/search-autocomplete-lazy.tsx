"use client";

import dynamic from "next/dynamic";

export const SearchAutocompleteLazy = dynamic(
  () =>
    import("@/components/storefront/search-autocomplete").then(
      (mod) => mod.SearchAutocomplete
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-10 w-full rounded-md border border-slate-200 bg-slate-50"
      />
    )
  }
);

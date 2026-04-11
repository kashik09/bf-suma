"use client";

import dynamic from "next/dynamic";

const SearchAutocompleteLazy = dynamic(() => import("./search-autocomplete"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-10 w-full rounded-md border border-slate-200 bg-slate-50"
    />
  )
});

export { SearchAutocompleteLazy };
export default SearchAutocompleteLazy;

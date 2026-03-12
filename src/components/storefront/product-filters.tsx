"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SHOP_SORT_OPTIONS } from "@/lib/constants";
import type { StorefrontCategory } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export interface ProductFilterState {
  search: string;
  sort: string;
  availability: string;
  category: string;
}

export function ProductFilters({
  categories,
  state
}: {
  categories: StorefrontCategory[];
  state: ProductFilterState;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all" && value !== "featured") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      startTransition(() => {
        router.push(`/shop?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const search = formData.get("search") as string;
      updateFilter("search", search);
    },
    [updateFilter]
  );

  return (
    <div
      className={`grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 ${isPending ? "opacity-70" : ""}`}
    >
      <form onSubmit={handleSearchSubmit}>
        <Input
          defaultValue={state.search}
          name="search"
          placeholder="Search products..."
          onBlur={(e) => updateFilter("search", e.target.value)}
        />
      </form>

      <Select
        value={state.category || "all"}
        onChange={(e) => updateFilter("category", e.target.value)}
      >
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>

      <Select
        value={state.availability || "all"}
        onChange={(e) => updateFilter("availability", e.target.value)}
      >
        <option value="all">Any availability</option>
        <option value="in_stock">In stock</option>
        <option value="out_of_stock">Out of stock</option>
      </Select>

      <Select
        value={state.sort || "featured"}
        onChange={(e) => updateFilter("sort", e.target.value)}
      >
        {SHOP_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

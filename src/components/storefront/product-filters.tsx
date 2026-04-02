"use client";

import { Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SHOP_SORT_OPTIONS } from "@/lib/constants";
import type { StorefrontCategory } from "@/types";
import { useMemo } from "react";

export interface ProductFilterState {
  search: string;
  sort: string;
  availability: string;
  category: string;
}

export function ProductFilters({
  categories,
  state,
  onChange
}: {
  categories: StorefrontCategory[];
  state: ProductFilterState;
  onChange: (patch: Partial<ProductFilterState>) => void;
}) {
  const normalizedSearch = state.search.trim();
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (normalizedSearch) count += 1;
    if (state.category && state.category !== "all") count += 1;
    if (state.availability && state.availability !== "all") count += 1;
    if (state.sort && state.sort !== "featured") count += 1;
    return count;
  }, [normalizedSearch, state.availability, state.category, state.sort]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; clearValue: string }> = [];
    if (normalizedSearch) {
      chips.push({ id: "search", label: `Search: "${normalizedSearch}"`, clearValue: "" });
    }
    if (state.category && state.category !== "all") {
      const categoryName = categories.find((category) => category.slug === state.category)?.name || state.category;
      chips.push({ id: "category", label: `Category: ${categoryName}`, clearValue: "all" });
    }
    if (state.availability && state.availability !== "all") {
      const availabilityLabel = state.availability === "in_stock" ? "In stock" : "Out of stock";
      chips.push({ id: "availability", label: `Availability: ${availabilityLabel}`, clearValue: "all" });
    }
    if (state.sort && state.sort !== "featured") {
      const sortLabel = SHOP_SORT_OPTIONS.find((option) => option.value === state.sort)?.label || state.sort;
      chips.push({ id: "sort", label: `Sort: ${sortLabel}`, clearValue: "featured" });
    }
    return chips;
  }, [categories, normalizedSearch, state.availability, state.category, state.sort]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-brand-700" />
          Filter products
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{activeFilterCount} active</span>
          ) : null}
        </p>
        {activeFilterCount > 0 ? (
          <button
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            type="button"
            onClick={() => onChange({ search: "", category: "all", availability: "all", sort: "featured" })}
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        ) : null}
      </div>

      {activeFilterChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <button
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              key={chip.id}
              type="button"
              onClick={() => onChange({ [chip.id]: chip.clearValue })}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
            Search
          </label>
          <Input
            id="search"
            name="search"
            placeholder="Search products..."
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="category-filter">
            Category
          </label>
          <Select
            id="category-filter"
            value={state.category || "all"}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="availability-filter">
            Availability
          </label>
          <Select
            id="availability-filter"
            value={state.availability || "all"}
            onChange={(e) => onChange({ availability: e.target.value })}
          >
            <option value="all">Any availability</option>
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sort-filter">
            Sort
          </label>
          <Select
            id="sort-filter"
            value={state.sort || "featured"}
            onChange={(e) => onChange({ sort: e.target.value })}
          >
            {SHOP_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

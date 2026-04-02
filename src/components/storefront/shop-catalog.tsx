"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductFilters, type ProductFilterState } from "@/components/storefront/product-filters";
import { ProductGrid } from "@/components/storefront/product-grid";
import type { StorefrontCategory, StorefrontProduct } from "@/types";

interface ShopCatalogProps {
  categories: StorefrontCategory[];
  products: StorefrontProduct[];
  initialState: ProductFilterState;
}

function applyFilters(products: StorefrontProduct[], filters: ProductFilterState): StorefrontProduct[] {
  const normalizedSearch = filters.search.trim().toLowerCase();
  let result = [...products];

  if (filters.category && filters.category !== "all") {
    result = result.filter((product) => product.category_slug === filters.category);
  }

  if (normalizedSearch) {
    result = result.filter((product) => {
      const searchText = `${product.name} ${product.description} ${product.category_name}`.toLowerCase();
      return searchText.includes(normalizedSearch);
    });
  }

  if (filters.availability === "in_stock") {
    result = result.filter((product) => product.availability !== "out_of_stock");
  }

  if (filters.availability === "out_of_stock") {
    result = result.filter((product) => product.availability === "out_of_stock");
  }

  if (filters.sort === "price_asc") {
    return [...result].sort((a, b) => a.price - b.price);
  }

  if (filters.sort === "price_desc") {
    return [...result].sort((a, b) => b.price - a.price);
  }

  if (filters.sort === "name_asc") {
    return [...result].sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...result].sort((a, b) => {
    if (a.availability !== b.availability) {
      if (a.availability === "in_stock") return -1;
      if (b.availability === "in_stock") return 1;
    }

    return a.name.localeCompare(b.name);
  });
}

function toQueryString(filters: ProductFilterState): string {
  const params = new URLSearchParams();
  const normalizedSearch = filters.search.trim();

  if (normalizedSearch) params.set("search", normalizedSearch);
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.availability && filters.availability !== "all") params.set("availability", filters.availability);
  if (filters.sort && filters.sort !== "featured") params.set("sort", filters.sort);

  return params.toString();
}

export function ShopCatalog({ categories, products, initialState }: ShopCatalogProps) {
  const [filters, setFilters] = useState<ProductFilterState>(initialState);

  useEffect(() => {
    setFilters(initialState);
  }, [initialState]);

  const filteredProducts = useMemo(() => applyFilters(products, filters), [products, filters]);

  useEffect(() => {
    const query = toQueryString(filters);
    const nextPath = query ? `/shop?${query}` : "/shop";
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (currentPath !== nextPath) {
      window.history.replaceState(null, "", nextPath);
    }
  }, [filters]);

  return (
    <>
      <ProductFilters
        categories={categories}
        state={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
      />

      <ProductGrid
        emptyDescription="No products match your current filters. Try another category or clear search."
        emptyTitle="No matching products"
        products={filteredProducts}
      />
    </>
  );
}

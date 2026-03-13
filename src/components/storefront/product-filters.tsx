import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SHOP_SORT_OPTIONS } from "@/lib/constants";
import type { StorefrontCategory } from "@/types";

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
  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" method="GET">
      <Input defaultValue={state.search} name="search" placeholder="Search products" />

      <Select defaultValue={state.category || "all"} name="category">
        <option value="all">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>

      <Select defaultValue={state.availability || "all"} name="availability">
        <option value="all">Any availability</option>
        <option value="in_stock">In stock</option>
        <option value="out_of_stock">Out of stock</option>
      </Select>

      <Select defaultValue={state.sort || "featured"} name="sort">
        {SHOP_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Button type="submit" variant="secondary">
        Apply Filters
      </Button>
    </form>
  );
}

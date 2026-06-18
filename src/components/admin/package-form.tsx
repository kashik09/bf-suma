"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode, PackageDisplayData } from "@/types";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: CurrencyCode;
  stock_qty: number;
  image_url: string | null;
}

interface PackageItem {
  product_id: string;
  product: ProductOption;
  quantity: number;
}

interface PackageFormProps {
  products: ProductOption[];
  initialData?: PackageDisplayData | null;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PackageForm({ products, initialData, action, submitLabel }: PackageFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [heroImageUrl, setHeroImageUrl] = useState(initialData?.hero_image_url || "");
  const [infographicImageUrl, setInfographicImageUrl] = useState(initialData?.infographic_image_url || "");
  const [overridePrice, setOverridePrice] = useState<string>(
    initialData?.override_price_minor != null ? String(initialData.override_price_minor) : ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>(initialData?.currency || "UGX");
  const [dmKeyword, setDmKeyword] = useState(initialData?.dm_keyword || "");
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);

  const [items, setItems] = useState<PackageItem[]>(() => {
    if (!initialData?.items) return [];
    return initialData.items.map((item) => ({
      product_id: item.product_id,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        currency: item.product.currency,
        stock_qty: item.product.stock_qty,
        image_url: item.product.image_url
      },
      quantity: item.quantity
    }));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(normalizeSlug(name));
    }
  }, [name, slugTouched]);

  // Calculate total from items
  const calculatedPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const finalPrice = overridePrice !== "" ? Number(overridePrice) : calculatedPrice;
  const savings = overridePrice !== "" && Number(overridePrice) < calculatedPrice
    ? calculatedPrice - Number(overridePrice)
    : null;

  // Filter products for picker
  const availableProducts = useMemo(() => {
    const selectedIds = new Set(items.map((item) => item.product_id));
    return products.filter((p) => {
      if (selectedIds.has(p.id)) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
    });
  }, [products, items, searchQuery]);

  function addProduct(product: ProductOption) {
    setItems((prev) => [
      ...prev,
      { product_id: product.id, product, quantity: 1 }
    ]);
    setSearchQuery("");
    setShowProductPicker(false);
  }

  function removeProduct(productId: string) {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, 99)) }
          : item
      )
    );
  }

  function handleSubmit(formData: FormData) {
    // Add items as JSON
    formData.set("items", JSON.stringify(items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))));

    action(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="mb-4 text-base font-semibold text-slate-900">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
              Name *
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="slug">
              Slug *
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
            />
            <p className="mt-1 text-xs text-slate-500">URL: /packages/{slug || "..."}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="dmKeyword">
              DM Keyword
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="dmKeyword"
              name="dmKeyword"
              placeholder="e.g. FIT"
              value={dmKeyword}
              onChange={(e) => setDmKeyword(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">For &quot;DM FIT to get started&quot; pattern</p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="tagline">
              Tagline
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="tagline"
              name="tagline"
              placeholder="e.g. 1-Month Gut Cleanse → Fat Burn"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              id="description"
              name="description"
              placeholder="Supports markdown formatting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-slate-900">Images</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="heroImageUrl">
              Hero Image URL
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="heroImageUrl"
              name="heroImageUrl"
              placeholder="https://..."
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
            />
            {heroImageUrl && (
              <img
                alt="Hero preview"
                className="mt-2 h-20 w-20 rounded-md border border-slate-200 object-contain"
                src={heroImageUrl}
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="infographicImageUrl">
              Infographic Image URL
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="infographicImageUrl"
              name="infographicImageUrl"
              placeholder="https://..."
              type="url"
              value={infographicImageUrl}
              onChange={(e) => setInfographicImageUrl(e.target.value)}
            />
            {infographicImageUrl && (
              <img
                alt="Infographic preview"
                className="mt-2 h-20 w-32 rounded-md border border-slate-200 object-contain"
                src={infographicImageUrl}
              />
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          TODO: Image upload component. For now, paste direct URLs.
        </p>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          Package Items ({items.length} products)
        </h3>

        {items.length > 0 && (
          <div className="mb-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                {item.product.image_url ? (
                  <img
                    alt={item.product.name}
                    className="h-12 w-12 rounded-md border border-slate-200 object-contain bg-white"
                    src={item.product.image_url}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-white text-xs text-slate-400">
                    IMG
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{item.product.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(item.product.price, item.product.currency)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${item.product_id}`}>
                    Quantity
                  </label>
                  <input
                    className="h-9 w-16 rounded-md border border-slate-300 px-2 text-center text-sm"
                    id={`qty-${item.product_id}`}
                    min={1}
                    max={99}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="rounded-md p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => removeProduct(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => setShowProductPicker(!showProductPicker)}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>

          {showProductPicker && (
            <div className="absolute left-0 top-12 z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoFocus
                    className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                  onClick={() => setShowProductPicker(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {availableProducts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No products available
                  </p>
                ) : (
                  availableProducts.slice(0, 20).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-slate-50"
                      onClick={() => addProduct(product)}
                    >
                      {product.image_url ? (
                        <img
                          alt={product.name}
                          className="h-10 w-10 rounded border border-slate-200 object-contain bg-white"
                          src={product.image_url}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs text-slate-400">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(product.price, product.currency)} • Stock: {product.stock_qty}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Calculated price (sum of items):</span>
              <span className="font-semibold">{formatCurrency(calculatedPrice, currency)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Final price:</span>
              <span className="font-bold text-brand-600">{formatCurrency(finalPrice, currency)}</span>
            </div>
            {savings && (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-emerald-600">Customer saves:</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(savings, currency)}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-slate-900">Pricing & Settings</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="overridePrice">
              Override Price ({currency})
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="overridePrice"
              name="overridePrice"
              placeholder="Leave empty to calculate"
              type="number"
              min={0}
              value={overridePrice}
              onChange={(e) => setOverridePrice(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">Leave empty to use sum of items</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="currency">
              Currency
            </label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              <option value="UGX">UGX</option>
              <option value="KES">KES</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="sortOrder">
              Sort Order
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Featured</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/packages"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

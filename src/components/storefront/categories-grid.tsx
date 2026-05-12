import Image from "next/image";
import Link from "next/link";
import type { StorefrontCategory } from "@/types";

const PLACEHOLDER_GRADIENT = "bg-gradient-to-br from-brand-100 to-brand-200";

interface CategoriesGridProps {
  categories: StorefrontCategory[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
        <p className="text-slate-600">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

function CategoryCard({ category }: { category: StorefrontCategory }) {
  const productCount = category.product_count ?? 0;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-brand-100"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={`${category.name} category`}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className={`h-full w-full ${PLACEHOLDER_GRADIENT}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">
          {category.name}
        </h3>
        <p className="mt-0.5 text-sm text-white/80">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}

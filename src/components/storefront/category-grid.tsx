import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { StorefrontCategory } from "@/types";

export function CategoryGrid({ categories }: { categories: StorefrontCategory[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link href={`/category/${category.slug}`} key={category.id}>
          <Card className="h-full overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-card">
            <div
              className="h-28 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${category.image_url})` }}
            />
            <div className="space-y-1 p-4">
              <h3 className="text-base font-semibold text-slate-900">{category.name}</h3>
              <p className="line-clamp-2 text-sm text-slate-600">{category.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

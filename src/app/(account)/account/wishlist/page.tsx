import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listStorefrontProducts } from "@/services/products";
import {
  ensureWishlistCustomerByEmail,
  getCustomerWishlist,
  removeFromCustomerWishlist
} from "@/services/wishlist";

export const dynamic = "force-dynamic";

function customerNameFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return { firstName: "", lastName: "" };
  }

  const data = metadata as { first_name?: unknown; last_name?: unknown };
  const firstName = typeof data.first_name === "string" ? data.first_name : "";
  const lastName = typeof data.last_name === "string" ? data.last_name : "";
  return { firstName, lastName };
}

async function removeWishlistItemAction(formData: FormData) {
  "use server";

  const slugValue = formData.get("slug");
  const slug = typeof slugValue === "string" ? slugValue.trim() : "";
  if (!slug) return;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) return;

  const { firstName, lastName } = customerNameFromMetadata(user.user_metadata);
  const customerId = await ensureWishlistCustomerByEmail({
    email: user.email,
    firstName,
    lastName
  });

  await removeFromCustomerWishlist(customerId, slug);
  revalidatePath("/account/wishlist");
}

export default async function AccountWishlistPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/account/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Wishlist</h1>
            <p className="text-sm text-slate-500">Sign in to save your wishlist</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Sign in to view your wishlist</h2>
          <p className="mt-1 text-sm text-slate-500">Save products and access them across devices.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/account/login"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Sign In
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { firstName, lastName } = customerNameFromMetadata(user.user_metadata);
  const customerId = await ensureWishlistCustomerByEmail({
    email: user.email,
    firstName,
    lastName
  });

  const [wishlistSlugs, products] = await Promise.all([
    getCustomerWishlist(customerId),
    listStorefrontProducts({ sort: "featured" })
  ]);

  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const wishlistProducts = wishlistSlugs
    .map((slug) => productsBySlug.get(slug) || null)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Wishlist</h1>
          <p className="text-sm text-slate-500">
            {wishlistProducts.length} saved {wishlistProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Heart className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-slate-500">Save products you like by tapping the heart icon.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="space-y-2">
              <ProductCard product={product} />
              <form action={removeWishlistItemAction}>
                <input name="slug" type="hidden" value={product.slug} />
                <button
                  type="submit"
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Remove from wishlist
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

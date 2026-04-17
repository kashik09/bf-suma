import Link from "next/link";
import { revalidatePath } from "next/cache";
import { PageContainer } from "@/components/layout/page-container";
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
      <PageContainer className="space-y-5 py-10 sm:py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold text-slate-900">Wishlist</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to save your wishlist across devices.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/account/login"
            >
              Sign In
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              href="/shop"
            >
              Browse Products
            </Link>
          </div>
        </section>
      </PageContainer>
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
    <PageContainer className="space-y-5 py-10 sm:py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Wishlist</h1>
        <p className="mt-2 text-sm text-slate-600">Saved products you can come back to anytime.</p>
      </section>

      {wishlistProducts.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Your wishlist is empty.</h2>
          <p className="mt-1 text-sm text-slate-600">Your wishlist is empty. Browse products to add some.</p>
          <Link
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/shop"
          >
            Browse Products
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => (
            <div className="space-y-2" key={product.id}>
              <ProductCard product={product} />
              <form action={removeWishlistItemAction}>
                <input name="slug" type="hidden" value={product.slug} />
                <button
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                  type="submit"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

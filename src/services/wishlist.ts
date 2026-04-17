import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function normalizeSlug(slug: string): string {
  return slug.trim();
}

function normalizeSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  slugs.forEach((value) => {
    const slug = normalizeSlug(value);
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    normalized.push(slug);
  });

  return normalized;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function fallbackFirstName(email: string, firstName?: string): string {
  const cleaned = (firstName || "").trim();
  if (cleaned) return cleaned;

  const localPart = email.split("@")[0]?.trim();
  return localPart || "Customer";
}

function fallbackLastName(lastName?: string): string {
  const cleaned = (lastName || "").trim();
  return cleaned || "Customer";
}

export async function ensureWishlistCustomerByEmail(input: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<string> {
  const supabase = createServiceRoleSupabaseClient();
  const email = normalizeEmail(input.email);

  const { data: existing, error: existingError } = await supabase
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertError } = await supabase
    .from("customers")
    .insert({
      email,
      first_name: fallbackFirstName(email, input.firstName),
      last_name: fallbackLastName(input.lastName),
      phone: null,
      whatsapp_opt_in: false
    })
    .select("id")
    .single();

  if (!insertError && inserted?.id) {
    return inserted.id;
  }

  const { data: retried, error: retryError } = await supabase
    .from("customers")
    .select("id")
    .eq("email", email)
    .single();

  if (retryError || !retried?.id) {
    throw new Error(insertError?.message || retryError?.message || "Unable to resolve customer for wishlist.");
  }

  return retried.id;
}

export async function getCustomerWishlist(customerId: string): Promise<string[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_slug")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return normalizeSlugs((data || []).map((entry) => entry.product_slug));
}

export async function addToCustomerWishlist(customerId: string, slug: string): Promise<void> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return;

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("wishlists")
    .upsert(
      {
        customer_id: customerId,
        product_slug: normalizedSlug
      },
      { onConflict: "customer_id,product_slug" }
    );

  if (error) throw new Error(error.message);
}

export async function removeFromCustomerWishlist(customerId: string, slug: string): Promise<void> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return;

  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("customer_id", customerId)
    .eq("product_slug", normalizedSlug);

  if (error) throw new Error(error.message);
}

export async function syncLocalWishlistToAccount(customerId: string, localSlugs: string[]): Promise<void> {
  const normalizedSlugs = normalizeSlugs(localSlugs);
  if (normalizedSlugs.length === 0) return;

  const supabase = createServiceRoleSupabaseClient();
  const rows = normalizedSlugs.map((slug) => ({
    customer_id: customerId,
    product_slug: slug
  }));

  const { error } = await supabase
    .from("wishlists")
    .upsert(rows, { onConflict: "customer_id,product_slug" });

  if (error) throw new Error(error.message);
}

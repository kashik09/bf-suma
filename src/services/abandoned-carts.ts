import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface AbandonedCartUpsertInput {
  customerEmail: string;
  customerName?: string | null;
  cartItems: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    slug?: string;
  }>;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function upsertAbandonedCart(input: AbandonedCartUpsertInput): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const customerEmail = normalizeEmail(input.customerEmail);

  const { error } = await (supabase as any)
    .from("abandoned_carts")
    .upsert(
      {
        customer_email: customerEmail,
        customer_name: input.customerName?.trim() || null,
        cart_items: input.cartItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_sent_at: null
      },
      {
        onConflict: "customer_email"
      }
    );

  if (error) throw error;
}

export async function deleteAbandonedCartByEmail(email: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const customerEmail = normalizeEmail(email);

  const { error } = await (supabase as any)
    .from("abandoned_carts")
    .delete()
    .eq("customer_email", customerEmail);

  if (error) throw error;
}

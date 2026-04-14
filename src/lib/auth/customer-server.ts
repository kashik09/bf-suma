import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthenticatedCustomerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function requireCustomerUser(): Promise<AuthenticatedCustomerUser> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const metadata = user.user_metadata as { first_name?: string; last_name?: string } | undefined;

  return {
    id: user.id,
    email: user.email,
    firstName: metadata?.first_name?.trim() || "",
    lastName: metadata?.last_name?.trim() || ""
  };
}

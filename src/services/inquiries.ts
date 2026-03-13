import type { InquiryInput } from "@/lib/validation";
import type { Inquiry } from "@/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createInquiry(input: InquiryInput): Promise<Pick<Inquiry, "id" | "status">> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      message: input.message.trim(),
      source: input.source,
      status: "NEW"
    })
    .select("id, status")
    .single();

  if (error || !data) throw error || new Error("Failed to save inquiry");
  return data;
}

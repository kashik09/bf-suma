import type { InquiryInput } from "@/lib/validation";
import type { Inquiry, InquiryStatus } from "@/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function createInquiry(input: InquiryInput): Promise<Pick<Inquiry, "id" | "status">> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: input.name.trim(),
      email: input.email?.trim().toLowerCase() || null,
      phone: input.phone.trim(),
      message: input.message.trim(),
      source: input.source,
      status: "NEW"
    })
    .select("id, status")
    .single();

  if (error || !data) throw error || new Error("Failed to save inquiry");
  return {
    id: data.id,
    status: data.status as InquiryStatus
  };
}

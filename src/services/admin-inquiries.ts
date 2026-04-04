import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { InquiryStatus } from "@/types";

export interface AdminInquiryListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminInquiryListFilters {
  search?: string;
  status?: InquiryStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface AdminInquiryListResult {
  inquiries: AdminInquiryListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
}

export async function listAdminInquiries(filters: AdminInquiryListFilters = {}): Promise<AdminInquiryListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  let query = supabase
    .from("inquiries")
    .select("id, name, email, phone, message, source, status, created_at, updated_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const search = filters.search?.trim();
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    inquiries: (data ?? []) as AdminInquiryListItem[],
    totalCount: count || 0,
    page,
    pageSize
  };
}

export async function updateAdminInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw error;
}

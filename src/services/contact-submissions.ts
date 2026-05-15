import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { ContactSubmission, ContactSubmissionStatus } from "@/types";

export interface ContactSubmissionListFilters {
  search?: string;
  status?: ContactSubmissionStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface ContactSubmissionListResult {
  submissions: ContactSubmission[];
  totalCount: number;
  page: number;
  pageSize: number;
}

function clampPage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value as number));
}

function clampPageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 25;
  return Math.max(1, Math.min(100, Math.floor(value as number)));
}

export async function listContactSubmissions(
  filters: ContactSubmissionListFilters = {}
): Promise<ContactSubmissionListResult> {
  const supabase = createServiceRoleSupabaseClient();
  const page = clampPage(filters.page);
  const pageSize = clampPageSize(filters.pageSize);
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  let query = supabase
    .from("contact_submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(rangeStart, rangeEnd);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const search = filters.search?.trim();
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    submissions: (data ?? []) as ContactSubmission[],
    totalCount: count || 0,
    page,
    pageSize
  };
}

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmissionStatus
): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

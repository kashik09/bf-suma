import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FormSubmitButton } from "@/components/forms";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { listAdminInquiries, updateAdminInquiryStatus } from "@/services/admin-inquiries";
import type { InquiryStatus } from "@/types";

type ContactsSearchParams = Promise<{
  search?: string;
  status?: InquiryStatus | "all";
  page?: string;
  updated?: string;
  error?: string;
}>;

const STATUS_VARIANTS: Record<InquiryStatus, "warning" | "info" | "success" | "neutral"> = {
  NEW: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral"
};

const updateInquirySchema = z.object({
  inquiryId: z.string().uuid(),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  page: z.string().optional(),
  search: z.string().optional(),
  statusFilter: z.string().optional()
});

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function getSafePage(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function buildReturnUrl(page: string | undefined, statusFilter: string | undefined, search: string | undefined, extra: string) {
  const params = new URLSearchParams();
  params.set("page", page && page.length > 0 ? page : "1");
  params.set("status", statusFilter && statusFilter.length > 0 ? statusFilter : "all");
  if (search && search.trim().length > 0) params.set("search", search.trim());
  params.set(extra, "1");
  return `/admin/contacts?${params.toString()}`;
}

export default async function AdminContactsPage({
  searchParams
}: {
  searchParams?: ContactsSearchParams;
}) {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);
  const query = searchParams ? await searchParams : {};

  const searchTerm = typeof query.search === "string" ? query.search : "";
  const statusFilter = INQUIRY_STATUSES.includes(query.status as InquiryStatus) ? (query.status as InquiryStatus) : "all";
  const page = getSafePage(query.page);

  async function updateStatusAction(formData: FormData) {
    "use server";

    await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);

    const parsed = updateInquirySchema.safeParse({
      inquiryId: formData.get("inquiryId"),
      status: formData.get("status"),
      page: formData.get("page"),
      search: formData.get("search"),
      statusFilter: formData.get("statusFilter")
    });

    if (!parsed.success) {
      redirect(buildReturnUrl(undefined, undefined, undefined, "error"));
    }

    try {
      await updateAdminInquiryStatus(parsed.data.inquiryId, parsed.data.status);
      revalidatePath("/admin/contacts");
      redirect(buildReturnUrl(parsed.data.page, parsed.data.statusFilter, parsed.data.search, "updated"));
    } catch {
      redirect(buildReturnUrl(parsed.data.page, parsed.data.statusFilter, parsed.data.search, "error"));
    }
  }

  let data: Awaited<ReturnType<typeof listAdminInquiries>> | null = null;
  let loadError: string | null = null;

  try {
    data = await listAdminInquiries({
      page,
      pageSize: 25,
      search: searchTerm || undefined,
      status: statusFilter
    });
  } catch {
    loadError = "We couldn't load contacts right now. Please refresh and try again.";
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Contacts"
          description="Inbound contact queue from the website."
        />

        {query.updated === "1" ? (
          <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            Inquiry status updated.
          </div>
        ) : null}

        {query.error === "1" ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            We couldn't update this contact status. Please try again.
          </div>
        ) : null}

        <Card>
          <form action="/admin/contacts" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
                Search
              </label>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                defaultValue={searchTerm}
                id="search"
                name="search"
                placeholder="Search name, email, phone, or message"
                type="search"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
                Status
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                defaultValue={statusFilter}
                id="status"
                name="status"
              >
                <option value="all">All</option>
                {INQUIRY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="submit"
              >
                Filter
              </button>
            </div>
          </form>
        </Card>

        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-semibold text-rose-900">Contacts are temporarily unavailable</p>
          <p className="mt-1 text-sm text-rose-800">{loadError}</p>
        </Card>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(data.totalCount / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < totalPages;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Contacts"
        description={`Inbound contact queue from the website. ${data.totalCount} total inquiry record(s).`}
      />

      {query.updated === "1" ? (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Inquiry status updated.
        </div>
      ) : null}

      {query.error === "1" ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          We couldn't update this contact status. Please try again.
        </div>
      ) : null}

      <Card>
        <form action="/admin/contacts" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search">
              Search
            </label>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={searchTerm}
              id="search"
              name="search"
              placeholder="Search name, email, phone, or message"
              type="search"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">
              Status
            </label>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              defaultValue={statusFilter}
              id="status"
              name="status"
            >
              <option value="all">All</option>
              {INQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Filter
            </button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Message</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Received</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.inquiries.map((entry) => (
              <tr className="text-sm text-slate-700" key={entry.id}>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-slate-900">{entry.name}</p>
                  <p className="text-xs text-slate-500">{entry.email || "No email provided"}</p>
                  <p className="text-xs text-slate-500">{entry.phone || "No phone"}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{entry.source}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="line-clamp-4 max-w-xl text-sm text-slate-700">{entry.message}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge variant={STATUS_VARIANTS[entry.status]}>
                    {entry.status.replace(/_/g, " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 align-top">{formatDateTime(entry.created_at)}</td>
                <td className="px-4 py-3 align-top text-right">
                  <form action={updateStatusAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="inquiryId" value={entry.id} />
                    <input type="hidden" name="page" value={String(data.page)} />
                    <input type="hidden" name="search" value={searchTerm} />
                    <input type="hidden" name="statusFilter" value={statusFilter} />
                    <label className="sr-only" htmlFor={`inquiry-status-${entry.id}`}>
                      Status for {entry.name}
                    </label>
                    <select
                      aria-label={`Status for ${entry.name}`}
                      className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs"
                      defaultValue={entry.status}
                      id={`inquiry-status-${entry.id}`}
                      name="status"
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                    <FormSubmitButton
                      className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-3 text-xs font-semibold text-white transition hover:bg-brand-700"
                      pendingLabel="Saving..."
                    >
                      Save
                    </FormSubmitButton>
                  </form>
                </td>
              </tr>
            ))}

            {data.inquiries.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                  No inquiries found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <Card className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page {data.page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href={`/admin/contacts?page=${data.page - 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
            >
              Previous
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
              Previous
            </span>
          )}

          {hasNext ? (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              href={`/admin/contacts?page=${data.page + 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
            >
              Next
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-400">
              Next
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}

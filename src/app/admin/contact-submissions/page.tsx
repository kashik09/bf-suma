import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { FormSubmitButton } from "@/components/forms";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { ALL_ADMIN_ROLES } from "@/lib/admin-permissions";
import { requireAdminSession } from "@/lib/admin-server";
import { CONTACT_SUBMISSION_STATUSES } from "@/lib/constants";
import { listContactSubmissions, updateContactSubmissionStatus } from "@/services/contact-submissions";
import type { ContactSubmissionStatus } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  search?: string;
  status?: ContactSubmissionStatus | "all";
  page?: string;
  updated?: string;
  error?: string;
}>;

const STATUS_VARIANTS: Record<ContactSubmissionStatus, "warning" | "info" | "success" | "neutral"> = {
  new: "warning",
  responded: "success",
  spam: "neutral"
};

const STATUS_LABELS: Record<ContactSubmissionStatus, string> = {
  new: "New",
  responded: "Responded",
  spam: "Spam"
};

const updateSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["new", "responded", "spam"]),
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

function buildReturnUrl(
  page: string | undefined,
  statusFilter: string | undefined,
  search: string | undefined,
  extra: string
) {
  const params = new URLSearchParams();
  params.set("page", page && page.length > 0 ? page : "1");
  params.set("status", statusFilter && statusFilter.length > 0 ? statusFilter : "all");
  if (search && search.trim().length > 0) params.set("search", search.trim());
  params.set(extra, "1");
  return `/admin/contact-submissions?${params.toString()}`;
}

export default async function AdminContactSubmissionsPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  await requireAdminSession(ALL_ADMIN_ROLES);
  const query = searchParams ? await searchParams : {};

  const searchTerm = typeof query.search === "string" ? query.search : "";
  const statusFilter = CONTACT_SUBMISSION_STATUSES.includes(query.status as ContactSubmissionStatus)
    ? (query.status as ContactSubmissionStatus)
    : "all";
  const page = getSafePage(query.page);

  async function updateStatusAction(formData: FormData) {
    "use server";

    await requireAdminSession(ALL_ADMIN_ROLES);

    const parsed = updateSchema.safeParse({
      submissionId: formData.get("submissionId"),
      status: formData.get("status"),
      page: formData.get("page"),
      search: formData.get("search"),
      statusFilter: formData.get("statusFilter")
    });

    if (!parsed.success) {
      redirect(buildReturnUrl(undefined, undefined, undefined, "error"));
    }

    try {
      await updateContactSubmissionStatus(parsed.data.submissionId, parsed.data.status);
      revalidatePath("/admin/contact-submissions");
      redirect(buildReturnUrl(parsed.data.page, parsed.data.statusFilter, parsed.data.search, "updated"));
    } catch {
      redirect(buildReturnUrl(parsed.data.page, parsed.data.statusFilter, parsed.data.search, "error"));
    }
  }

  let data: Awaited<ReturnType<typeof listContactSubmissions>> | null = null;
  let loadError: string | null = null;

  try {
    data = await listContactSubmissions({
      page,
      pageSize: 25,
      search: searchTerm || undefined,
      status: statusFilter
    });
  } catch {
    loadError = "We couldn't load submissions right now. Please refresh and try again.";
  }

  const renderFilters = () => (
    <Card>
      <form action="/admin/contact-submissions" className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="search"
          >
            Search
          </label>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            defaultValue={searchTerm}
            id="search"
            name="search"
            placeholder="Search name, email, subject, or message"
            type="search"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            htmlFor="status"
          >
            Status
          </label>
          <select
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            defaultValue={statusFilter}
            id="status"
            name="status"
          >
            <option value="all">All</option>
            {CONTACT_SUBMISSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
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
  );

  if (!data) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Contact Form Submissions"
          description="Messages from the website contact form."
        />

        {query.updated === "1" && (
          <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
            Submission status updated.
          </div>
        )}

        {query.error === "1" && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            We couldn&apos;t update this submission status. Please try again.
          </div>
        )}

        {renderFilters()}

        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-semibold text-rose-900">Submissions are temporarily unavailable</p>
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
        title="Contact Form Submissions"
        description={`Messages from the website contact form. ${data.totalCount} total submission(s).`}
      />

      {query.updated === "1" && (
        <div className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          Submission status updated.
        </div>
      )}

      {query.error === "1" && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          We couldn&apos;t update this submission status. Please try again.
        </div>
      )}

      {renderFilters()}

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject / Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Received
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.submissions.map((entry) => (
              <tr className="text-sm text-slate-700" key={entry.id}>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-slate-900">{entry.name}</p>
                  <a
                    className="text-xs text-brand-600 hover:underline"
                    href={`mailto:${entry.email}`}
                  >
                    {entry.email}
                  </a>
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-slate-800">{entry.subject}</p>
                  <p className="mt-1 line-clamp-3 max-w-xl text-sm text-slate-600">{entry.message}</p>
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge variant={STATUS_VARIANTS[entry.status]}>
                    {STATUS_LABELS[entry.status]}
                  </Badge>
                  {entry.email_sent_at && (
                    <p className="mt-1 text-[11px] text-slate-400">Email sent</p>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-slate-500">
                  {formatDateTime(entry.created_at)}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <form action={updateStatusAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="submissionId" value={entry.id} />
                    <input type="hidden" name="page" value={String(data.page)} />
                    <input type="hidden" name="search" value={searchTerm} />
                    <input type="hidden" name="statusFilter" value={statusFilter} />
                    <label className="sr-only" htmlFor={`submission-status-${entry.id}`}>
                      Status for {entry.name}
                    </label>
                    <select
                      aria-label={`Status for ${entry.name}`}
                      className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs"
                      defaultValue={entry.status}
                      id={`submission-status-${entry.id}`}
                      name="status"
                    >
                      {CONTACT_SUBMISSION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
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

            {data.submissions.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                  No submissions found for this filter.
                </td>
              </tr>
            )}
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
              href={`/admin/contact-submissions?page=${data.page - 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
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
              href={`/admin/contact-submissions?page=${data.page + 1}&status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`}
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

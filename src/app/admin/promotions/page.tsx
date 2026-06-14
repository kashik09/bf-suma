export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Percent, Plus } from "lucide-react";
import { getAdminSessionFromCookies } from "@/lib/admin-server";
import { Card } from "@/components/ui";

export default async function AdminPromotionsPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) redirect("/admin");
  if (session.mustResetPassword) redirect("/admin/reset-password");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Promotions</h1>
          <p className="text-sm text-slate-500">Manage discounts, coupons, and promotional campaigns.</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          Create promotion
        </button>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Percent className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Promotions coming soon</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Create discount codes, flash sales, and promotional campaigns to boost sales.
            This feature is under development.
          </p>
        </div>
      </Card>
    </div>
  );
}

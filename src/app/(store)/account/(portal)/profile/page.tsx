import { AccountProfileForm } from "@/components/storefront/account-profile-form";
import { requireCustomerUser } from "@/lib/auth/customer-server";
import { getCustomerDashboardSnapshot } from "@/services/customer-account";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const user = await requireCustomerUser();
  const snapshot = await getCustomerDashboardSnapshot(user.email);

  const firstName = snapshot?.customer.first_name || user.firstName || "";
  const lastName = snapshot?.customer.last_name || user.lastName || "";
  const phone = snapshot?.customer.phone || "";

  return (
    <div className="space-y-4 pb-16 md:pb-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update your personal details used for order communication.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <AccountProfileForm
          email={user.email}
          initialFirstName={firstName}
          initialLastName={lastName}
          initialPhone={phone}
        />
      </div>
    </div>
  );
}

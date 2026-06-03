import Link from "next/link";
import { ArrowLeft, MapPin, Plus, CreditCard, CheckCircle2 } from "lucide-react";
import { requireCustomerUser } from "@/lib/auth/customer-server";

export const dynamic = "force-dynamic";

// Mock addresses
const mockAddresses = [
  {
    id: "1",
    label: "Home",
    name: "Sarah Nakamya",
    address: "Plot 45, Kira Road",
    city: "Kampala",
    region: "Central",
    phone: "+256 700 123 456",
    isDefault: true
  },
  {
    id: "2",
    label: "Office",
    name: "Sarah Nakamya",
    address: "Garden City Mall, Level 2",
    city: "Kampala",
    region: "Central",
    phone: "+256 700 123 456",
    isDefault: false
  }
];

// Mock payment methods
const mockPaymentMethods = [
  {
    id: "1",
    type: "mobile_money",
    label: "MTN Mobile Money",
    lastFour: "3456",
    isDefault: true
  },
  {
    id: "2",
    type: "card",
    label: "Visa",
    lastFour: "4242",
    isDefault: false
  }
];

export default async function AddressesPage() {
  await requireCustomerUser();

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-3">
        <Link
          href="/account/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Addresses & Payment</h1>
          <p className="text-sm text-slate-500">Manage your delivery addresses and payment methods</p>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">Delivery Addresses</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
            <Plus className="h-4 w-4" />
            Add address
          </button>
        </div>

        {mockAddresses.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No addresses saved yet</p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Add your first address
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mockAddresses.map((address) => (
              <div key={address.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{address.label}</p>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{address.name}</p>
                    <p className="text-sm text-slate-600">{address.address}</p>
                    <p className="text-sm text-slate-600">{address.city}, {address.region}</p>
                    <p className="mt-1 text-xs text-slate-500">{address.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button className="text-xs font-medium text-rose-600 hover:text-rose-700">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-900">Payment Methods</h2>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
            <Plus className="h-4 w-4" />
            Add payment method
          </button>
        </div>

        {mockPaymentMethods.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No payment methods saved</p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Add payment method
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {mockPaymentMethods.map((method) => (
              <div key={method.id} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <CreditCard className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                        {method.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Ending in {method.lastFour}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <>
                        <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
                          Set default
                        </button>
                        <button className="text-xs font-medium text-rose-600 hover:text-rose-700">
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Your payment information is securely stored and encrypted. We never store your full card details.
        </p>
      </div>
    </div>
  );
}

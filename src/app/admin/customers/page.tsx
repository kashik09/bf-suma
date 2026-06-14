export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Users } from "lucide-react";
import { getAdminSessionFromCookies } from "@/lib/admin-server";
import { Card } from "@/components/ui";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

async function getCustomers(): Promise<Customer[]> {
  const supabase = createServiceRoleSupabaseClient();

  // Get customers
  const { data: customers, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !customers) return [];

  // Get order stats for each customer
  const customerIds = customers.map((c) => c.id);
  const { data: orderStats } = await supabase
    .from("orders")
    .select("customer_id, total")
    .in("customer_id", customerIds)
    .neq("status", "CANCELED");

  // Aggregate order stats
  const statsMap = new Map<string, { count: number; total: number }>();
  (orderStats || []).forEach((order) => {
    const current = statsMap.get(order.customer_id) || { count: 0, total: 0 };
    current.count += 1;
    current.total += Number(order.total) || 0;
    statsMap.set(order.customer_id, current);
  });

  return customers.map((c) => {
    const stats = statsMap.get(c.id) || { count: 0, total: 0 };
    return {
      ...c,
      orders_count: stats.count,
      total_spent: stats.total
    };
  });
}

export default async function AdminCustomersPage() {
  const session = await getAdminSessionFromCookies();
  if (!session) redirect("/admin");
  if (session.mustResetPassword) redirect("/admin/reset-password");

  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">{customers.length} registered customers</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 opacity-50 cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <Card className="overflow-hidden">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No customers yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Customers will appear here once they create accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                  <th className="px-5 py-3 text-right">Total Spent</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                          {customer.first_name[0]}{customer.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {customer.orders_count}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(customer.created_at).toLocaleDateString("en-UG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

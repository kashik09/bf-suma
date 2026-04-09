declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (request: Request) => Promise<Response> | Response) => void;
};

import {
  processReengagementLifecycle,
  type ReengagementCandidate
} from "../_shared/lifecycle-workers.ts";
import {
  jsonResponse,
  loadEnvConfig,
  sendResendEmail,
  supabaseRestRequest
} from "../_shared/runtime.ts";

interface CustomerRow {
  id: string;
  email: string;
  first_name: string;
}

interface OrderRow {
  customer_id: string;
  created_at: string;
  status: string;
}

function toInFilter(values: string[]): string {
  return `(${values.map((v) => `"${v}"`).join(",")})`;
}

function isExactly60DaysAgo(lastOrderIso: string, now: Date): boolean {
  const lastOrderDate = new Date(lastOrderIso);
  const target = new Date(now);
  target.setDate(target.getDate() - 60);

  return (
    lastOrderDate.getUTCFullYear() === target.getUTCFullYear()
    && lastOrderDate.getUTCMonth() === target.getUTCMonth()
    && lastOrderDate.getUTCDate() === target.getUTCDate()
  );
}

async function handler() {
  const env = loadEnvConfig();
  if (!env.lifecycleEnabled) {
    return jsonResponse({ ok: true, skipped: "lifecycle_emails_disabled" }, 200);
  }

  const result = await processReengagementLifecycle({
    listCandidates: async (): Promise<ReengagementCandidate[]> => {
      const customers = await supabaseRestRequest<CustomerRow[]>(
        env,
        "/customers?select=id,email,first_name&reengagement_email_sent_at=is.null&limit=500"
      );

      if (customers.length === 0) return [];
      const customerIds = customers.map((customer) => customer.id);
      const orders = await supabaseRestRequest<OrderRow[]>(
        env,
        `/orders?select=customer_id,created_at,status&customer_id=in.${encodeURIComponent(toInFilter(customerIds))}&status=neq.CANCELED&order=created_at.desc&limit=2000`
      );

      const lastOrderByCustomer = new Map<string, string>();
      for (const order of orders) {
        if (!lastOrderByCustomer.has(order.customer_id)) {
          lastOrderByCustomer.set(order.customer_id, order.created_at);
        }
      }

      const now = new Date();
      return customers
        .filter((customer) => {
          const lastOrderIso = lastOrderByCustomer.get(customer.id);
          if (!lastOrderIso) return false;
          return isExactly60DaysAgo(lastOrderIso, now);
        })
        .map((customer) => ({
          customerId: customer.id,
          customerEmail: customer.email,
          customerFirstName: customer.first_name || "there"
        }));
    },
    markSent: async (customerId, sentAtIso) => {
      await supabaseRestRequest<unknown>(
        env,
        `/customers?id=eq.${encodeURIComponent(customerId)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ reengagement_email_sent_at: sentAtIso })
        }
      );
    },
    sendEmail: async (candidate) => {
      const bestSellersUrl = `${env.appBaseUrl.replace(/\/+$/, "")}/shop`;
      const subject = "We miss you at BF Suma";
      const html = `
        <p>Hi ${candidate.customerFirstName},</p>
        <p>We’ve added new bestsellers and fresh wellness picks since your last order.</p>
        <p><a href="${bestSellersUrl}">See what’s popular now</a></p>
      `.trim();
      const text = [
        `Hi ${candidate.customerFirstName},`,
        "We’ve added new bestsellers and fresh wellness picks since your last order.",
        `See what’s popular now: ${bestSellersUrl}`
      ].join("\n");

      return sendResendEmail({
        env,
        to: candidate.customerEmail,
        subject,
        html,
        text
      });
    }
  });

  return jsonResponse({ ok: true, ...result }, 200);
}

Deno.serve(async () => {
  try {
    return await handler();
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unexpected error"
      },
      500
    );
  }
});

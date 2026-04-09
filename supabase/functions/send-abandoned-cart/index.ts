declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (request: Request) => Promise<Response> | Response) => void;
};

import {
  processAbandonedCartLifecycle,
  type AbandonedCartCandidate
} from "../_shared/lifecycle-workers.ts";
import {
  jsonResponse,
  loadEnvConfig,
  sendResendEmail,
  supabaseRestRequest
} from "../_shared/runtime.ts";

interface AbandonedCartRow {
  id: string;
  customer_email: string;
  customer_name: string | null;
  cart_items: Array<{ name?: string; quantity?: number; price?: number }>;
  created_at: string;
}

function hoursAgoIso(hours: number): string {
  const now = new Date();
  now.setHours(now.getHours() - hours);
  return now.toISOString();
}

function buildCartSummary(items: Array<{ name?: string; quantity?: number }>): string {
  if (items.length === 0) return "Your saved items are waiting in your cart.";
  return items
    .slice(0, 4)
    .map((item) => `${item.name || "Product"} x${item.quantity || 1}`)
    .join(", ");
}

async function handler() {
  const env = loadEnvConfig();

  if (!env.lifecycleEnabled) {
    return jsonResponse({ ok: true, skipped: "lifecycle_emails_disabled" }, 200);
  }

  const result = await processAbandonedCartLifecycle({
    listCandidates: async (): Promise<AbandonedCartCandidate[]> => {
      const cutoffIso = hoursAgoIso(1);
      const rows = await supabaseRestRequest<AbandonedCartRow[]>(
        env,
        `/abandoned_carts?select=id,customer_email,customer_name,cart_items,created_at&email_sent_at=is.null&created_at=lt.${encodeURIComponent(cutoffIso)}&order=created_at.asc&limit=200`
      );

      return rows.map((row) => ({
        id: row.id,
        customerEmail: row.customer_email,
        customerName: row.customer_name,
        cartItems: Array.isArray(row.cart_items) ? row.cart_items : [],
        createdAt: row.created_at
      }));
    },
    markSent: async (id, sentAtIso) => {
      await supabaseRestRequest<unknown>(
        env,
        `/abandoned_carts?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ email_sent_at: sentAtIso })
        }
      );
    },
    sendEmail: async (candidate) => {
      const firstName = candidate.customerName?.split(" ")[0] || "there";
      const cartSummary = buildCartSummary(candidate.cartItems || []);
      const cartUrl = `${env.appBaseUrl.replace(/\/+$/, "")}/cart`;
      const subject = "You left something behind";
      const html = `
        <p>Hi ${firstName},</p>
        <p>Your BF Suma cart is still waiting for you.</p>
        <p><strong>${cartSummary}</strong></p>
        <p><a href="${cartUrl}">Return to your cart</a></p>
      `.trim();
      const text = [
        `Hi ${firstName},`,
        "Your BF Suma cart is still waiting for you.",
        cartSummary,
        `Return to your cart: ${cartUrl}`
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

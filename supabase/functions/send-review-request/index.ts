declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (request: Request) => Promise<Response> | Response) => void;
};

import {
  processReviewRequestLifecycle,
  type ReviewRequestCandidate
} from "../_shared/lifecycle-workers.ts";
import {
  jsonResponse,
  loadEnvConfig,
  sendResendEmail,
  supabaseRestRequest
} from "../_shared/runtime.ts";

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  total: number;
  currency: string;
}

interface CustomerRow {
  id: string;
  email: string;
  first_name: string;
}

interface OrderItemRow {
  order_id: string;
  product_id: string;
  product_name_snapshot: string;
}

interface ProductRow {
  id: string;
  slug: string;
}

function buildWindow() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 5);
  const end = new Date(now);
  end.setDate(end.getDate() - 4);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString()
  };
}

function toInFilter(values: string[]): string {
  return `(${values.map((v) => `"${v}"`).join(",")})`;
}

async function handler() {
  const env = loadEnvConfig();
  if (!env.lifecycleEnabled) {
    return jsonResponse({ ok: true, skipped: "lifecycle_emails_disabled" }, 200);
  }

  const result = await processReviewRequestLifecycle({
    listCandidates: async (): Promise<ReviewRequestCandidate[]> => {
      const { startIso, endIso } = buildWindow();
      const orders = await supabaseRestRequest<OrderRow[]>(
        env,
        `/orders?select=id,order_number,customer_id,total,currency&status=eq.DELIVERED&review_request_sent_at=is.null&created_at=gte.${encodeURIComponent(startIso)}&created_at=lt.${encodeURIComponent(endIso)}&limit=200`
      );

      if (orders.length === 0) return [];

      const customerIds = [...new Set(orders.map((order) => order.customer_id))];
      const customers = await supabaseRestRequest<CustomerRow[]>(
        env,
        `/customers?select=id,email,first_name&id=in.${encodeURIComponent(toInFilter(customerIds))}`
      );
      const customerById = new Map(customers.map((c) => [c.id, c]));

      const orderIds = orders.map((order) => order.id);
      const orderItems = await supabaseRestRequest<OrderItemRow[]>(
        env,
        `/order_items?select=order_id,product_id,product_name_snapshot&order_id=in.${encodeURIComponent(toInFilter(orderIds))}`
      );
      const firstOrderItemByOrderId = new Map<string, OrderItemRow>();
      for (const item of orderItems) {
        if (!firstOrderItemByOrderId.has(item.order_id)) {
          firstOrderItemByOrderId.set(item.order_id, item);
        }
      }

      const productIds = [...new Set(orderItems.map((item) => item.product_id))];
      const products = productIds.length
        ? await supabaseRestRequest<ProductRow[]>(
            env,
            `/products?select=id,slug&id=in.${encodeURIComponent(toInFilter(productIds))}`
          )
        : [];
      const productSlugById = new Map(products.map((product) => [product.id, product.slug]));

      return orders
        .map((order) => {
          const customer = customerById.get(order.customer_id);
          if (!customer?.email) return null;
          const item = firstOrderItemByOrderId.get(order.id);
          const productSlug = item ? productSlugById.get(item.product_id) || null : null;

          return {
            orderId: order.id,
            orderNumber: order.order_number,
            customerEmail: customer.email,
            customerFirstName: customer.first_name || "there",
            total: Number(order.total) || 0,
            currency: order.currency || "KES",
            productName: item?.product_name_snapshot || null,
            productSlug
          };
        })
        .filter((candidate): candidate is ReviewRequestCandidate => Boolean(candidate));
    },
    markSent: async (orderId, sentAtIso) => {
      await supabaseRestRequest<unknown>(
        env,
        `/orders?id=eq.${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ review_request_sent_at: sentAtIso })
        }
      );
    },
    sendEmail: async (candidate) => {
      const reviewUrl = candidate.productSlug
        ? `${env.appBaseUrl.replace(/\/+$/, "")}/shop/${candidate.productSlug}#reviews`
        : `${env.appBaseUrl.replace(/\/+$/, "")}/shop`;

      const subject = "How are you getting on with your order?";
      const html = `
        <p>Hi ${candidate.customerFirstName},</p>
        <p>We hope your order ${candidate.orderNumber} is working well for you.</p>
        <p>${candidate.productName ? `Tell us about your ${candidate.productName}.` : "Tell us how your product is working for you."}</p>
        <p><a href="${reviewUrl}">Leave a quick review</a></p>
      `.trim();
      const text = [
        `Hi ${candidate.customerFirstName},`,
        `We hope your order ${candidate.orderNumber} is working well for you.`,
        candidate.productName
          ? `Tell us about your ${candidate.productName}.`
          : "Tell us how your product is working for you.",
        `Leave a quick review: ${reviewUrl}`
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

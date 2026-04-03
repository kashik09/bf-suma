import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export interface OrderCreatedNotificationInput {
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
  receivedAt: string;
}

export async function enqueueOrderCreatedNotification(input: OrderCreatedNotificationInput): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const payload = {
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    total: input.total,
    currency: input.currency,
    receivedAt: input.receivedAt
  };

  const { error } = await supabase
    .from("order_notification_outbox")
    .upsert(
      {
        order_id: input.orderId,
        event_type: "ORDER_CREATED",
        payload,
        status: "PENDING",
        attempt_count: 0,
        available_at: new Date().toISOString(),
        last_error: null
      },
      {
        onConflict: "order_id,event_type",
        ignoreDuplicates: true
      }
    );

  if (error) {
    throw error;
  }
}

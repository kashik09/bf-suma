-- Migration: Expand order status enum for till-payment workflow
-- New statuses: PENDING_PAYMENT, PAYMENT_CONFIRMED, READY_FOR_PICKUP

-- 1. Drop existing status constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add expanded status constraint
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (status IN (
  'PENDING',
  'PENDING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'CONFIRMED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELED'
));

-- 3. Update order_status_history table constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'order_status_history'
    AND constraint_name = 'order_status_history_from_status_check'
  ) THEN
    ALTER TABLE public.order_status_history
    DROP CONSTRAINT order_status_history_from_status_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'order_status_history'
    AND constraint_name = 'order_status_history_to_status_check'
  ) THEN
    ALTER TABLE public.order_status_history
    DROP CONSTRAINT order_status_history_to_status_check;
  END IF;
END $$;

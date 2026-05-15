-- Add payment and delivery tracking columns to orders
-- Migration: 20260515100000_add_payment_delivery_tracking.sql

-- Add new columns (all nullable, additive only)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_received_by uuid REFERENCES public.admin_users(id),
  ADD COLUMN IF NOT EXISTS payment_notes text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_by uuid REFERENCES public.admin_users(id);

-- Constraint: payment_method must be one of known values when set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_method_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IS NULL OR payment_method IN
        ('CASH', 'MTN_MOMO', 'AIRTEL_MONEY', 'BANK_TRANSFER', 'OTHER'));
  END IF;
END $$;

-- Index for filtering paid orders
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status);

-- Comments for clarity
COMMENT ON COLUMN public.orders.payment_method IS
  'Method used to receive payment. NULL until payment received.';
COMMENT ON COLUMN public.orders.payment_reference IS
  'External reference: M-Pesa/MTN/Airtel transaction code, bank ref, etc.';
COMMENT ON COLUMN public.orders.payment_received_at IS
  'Timestamp when payment was marked as received.';
COMMENT ON COLUMN public.orders.payment_received_by IS
  'Admin user who marked the payment as received.';
COMMENT ON COLUMN public.orders.payment_notes IS
  'Optional notes about the payment.';
COMMENT ON COLUMN public.orders.delivered_at IS
  'Timestamp when order was marked as delivered.';
COMMENT ON COLUMN public.orders.delivered_by IS
  'Admin user who marked the order as delivered.';

-- Fix function_search_path_mutable warnings for partner functions
-- Setting search_path to empty string prevents search_path injection attacks

-- Fix generate_partner_code function
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate PA-XXX format (3 random uppercase letters)
    new_code := 'PA-' || chr(65 + floor(random() * 26)::int)
                      || chr(65 + floor(random() * 26)::int)
                      || chr(65 + floor(random() * 26)::int);

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.partners WHERE partner_code = new_code) INTO code_exists;

    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Fix set_partner_code trigger function
CREATE OR REPLACE FUNCTION public.set_partner_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.partner_code IS NULL OR NEW.partner_code = '' THEN
    NEW.partner_code := public.generate_partner_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_partners_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_partners_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add RLS policies for tables that have RLS enabled but no policies
-- These are service-role only tables, so we add restrictive policies

-- admin_users: Only service role should access (no public policies needed)
-- The table is already protected by RLS being enabled with no policies,
-- which means only service_role can access it. This is intentional.

-- customers: Allow customers to read their own data
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- newsletter_subscribers: Service role only (no public access needed)
-- Keeping restrictive by not adding policies

-- order_events: Allow customers to see events for their orders
CREATE POLICY "order_events_select_own" ON public.order_events
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id::text = auth.uid()::text
    )
  );

-- order_items: Allow customers to see their order items
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id::text = auth.uid()::text
    )
  );

-- order_status_history: Allow customers to see their order history
CREATE POLICY "order_status_history_select_own" ON public.order_status_history
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_id::text = auth.uid()::text
    )
  );

-- orders: Allow customers to see their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  USING (customer_id::text = auth.uid()::text);

-- package_items: Allow public read (packages are public)
CREATE POLICY "package_items_select_all" ON public.package_items
  FOR SELECT
  USING (true);

-- packages: Allow public read
CREATE POLICY "packages_select_all" ON public.packages
  FOR SELECT
  USING (true);

-- product_reviews: Allow public read of approved reviews
CREATE POLICY "product_reviews_select_approved" ON public.product_reviews
  FOR SELECT
  USING (status = 'APPROVED');

-- product_reviews: Allow users to see their own reviews
CREATE POLICY "product_reviews_select_own" ON public.product_reviews
  FOR SELECT
  USING (reviewer_email = auth.jwt()->>'email');

-- wishlists: Allow customers to manage their own wishlist
CREATE POLICY "wishlists_select_own" ON public.wishlists
  FOR SELECT
  USING (customer_id::text = auth.uid()::text);

CREATE POLICY "wishlists_insert_own" ON public.wishlists
  FOR INSERT
  WITH CHECK (customer_id::text = auth.uid()::text);

CREATE POLICY "wishlists_delete_own" ON public.wishlists
  FOR DELETE
  USING (customer_id::text = auth.uid()::text);

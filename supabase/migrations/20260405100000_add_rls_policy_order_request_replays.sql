-- Add explicit RLS policy for order_request_replays
-- This table is internal-only (service_role access), so we deny all client access
-- This also satisfies the Supabase linter warning about RLS without policies

-- Deny all access for anon and authenticated roles
-- Service role bypasses RLS automatically
create policy "Deny all client access"
  on public.order_request_replays
  for all
  to anon, authenticated
  using (false)
  with check (false);

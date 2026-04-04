-- Enable RLS on order_request_replays to block PostgREST access
-- Service role bypasses RLS, so internal access still works

alter table public.order_request_replays enable row level security;

-- Revoke direct access from public roles (defense in depth)
revoke all on public.order_request_replays from anon;
revoke all on public.order_request_replays from authenticated;

-- Ensure service_role has full access
grant all on public.order_request_replays to service_role;

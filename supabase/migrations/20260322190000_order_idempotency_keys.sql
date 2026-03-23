create table if not exists public.order_idempotency_keys (
  idempotency_key text primary key,
  request_hash text not null,
  order_id uuid null,
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'SUCCEEDED', 'FAILED')),
  response_payload jsonb null,
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists idx_order_idempotency_keys_expires_at
  on public.order_idempotency_keys (expires_at);

create index if not exists idx_order_idempotency_keys_order_id
  on public.order_idempotency_keys (order_id);

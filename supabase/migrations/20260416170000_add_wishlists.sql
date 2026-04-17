create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz default now(),
  unique (customer_id, product_slug)
);

alter table public.wishlists enable row level security;

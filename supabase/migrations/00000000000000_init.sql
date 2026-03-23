-- BF Suma baseline schema
-- Launch access model: server-side API only (service role key).
-- Public clients should use app API routes, not direct table access.

create extension if not exists pgcrypto;

set search_path = public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_non_empty check (char_length(trim(name)) > 0),
  constraint categories_slug_non_empty check (char_length(trim(slug)) > 0)
);

create index if not exists idx_categories_is_active on public.categories (is_active);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text null,
  price integer not null check (price >= 0),
  compare_at_price integer null check (compare_at_price is null or compare_at_price >= 0),
  sku text not null unique,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  status text not null default 'ACTIVE'
    check (status in ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK')),
  category_id uuid not null references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_non_empty check (char_length(trim(name)) > 0),
  constraint products_slug_non_empty check (char_length(trim(slug)) > 0),
  constraint products_sku_non_empty check (char_length(trim(sku)) > 0)
);

create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_created_at on public.products (created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text null,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_images_url_non_empty check (char_length(trim(url)) > 0),
  unique (product_id, sort_order)
);

create index if not exists idx_product_images_product_id
  on public.product_images (product_id, sort_order);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text null,
  whatsapp_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_first_name_non_empty check (char_length(trim(first_name)) > 0),
  constraint customers_last_name_non_empty check (char_length(trim(last_name)) > 0),
  constraint customers_email_non_empty check (char_length(trim(email)) > 0)
);

create unique index if not exists uq_customers_email_lower
  on public.customers ((lower(email)));
create index if not exists idx_customers_created_at on public.customers (created_at desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED')),
  payment_status text not null default 'UNPAID'
    check (payment_status in ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  delivery_address text not null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_delivery_address_non_empty check (char_length(trim(delivery_address)) > 0),
  constraint orders_total_matches_components check (total = subtotal + delivery_fee)
);

create index if not exists idx_orders_customer_id on public.orders (customer_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 99),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_name_non_empty check (char_length(trim(product_name_snapshot)) > 0),
  constraint order_items_line_total_matches check (line_total = unit_price * quantity)
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text null,
  phone text not null,
  message text not null,
  source text not null default 'contact_page',
  status text not null default 'NEW'
    check (status in ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiries_name_non_empty check (char_length(trim(name)) > 0),
  constraint inquiries_phone_non_empty check (char_length(trim(phone)) > 0),
  constraint inquiries_message_non_empty check (char_length(trim(message)) > 0),
  constraint inquiries_source_non_empty check (char_length(trim(source)) > 0)
);

create index if not exists idx_inquiries_status on public.inquiries (status);
create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);

create table if not exists public.order_idempotency_keys (
  idempotency_key text primary key,
  request_hash text not null,
  order_id uuid null references public.orders(id) on delete set null,
  status text not null default 'IN_PROGRESS'
    check (status in ('IN_PROGRESS', 'SUCCEEDED', 'FAILED')),
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

create table if not exists public.api_rate_limits (
  endpoint text not null,
  fingerprint text not null,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (endpoint, fingerprint, window_start)
);

create index if not exists idx_api_rate_limits_window_start
  on public.api_rate_limits (window_start);
create index if not exists idx_api_rate_limits_updated_at
  on public.api_rate_limits (updated_at);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_product_images_updated_at on public.product_images;
create trigger trg_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_order_items_updated_at on public.order_items;
create trigger trg_order_items_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

drop trigger if exists trg_order_idempotency_keys_updated_at on public.order_idempotency_keys;
create trigger trg_order_idempotency_keys_updated_at
before update on public.order_idempotency_keys
for each row execute function public.set_updated_at();

drop trigger if exists trg_api_rate_limits_updated_at on public.api_rate_limits;
create trigger trg_api_rate_limits_updated_at
before update on public.api_rate_limits
for each row execute function public.set_updated_at();

-- Service-role-only model for launch:
-- deny direct table access to anon/authenticated roles
-- keep access for service_role where available.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema public from anon';
    execute 'revoke all on all sequences in schema public from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from authenticated';
    execute 'revoke all on all sequences in schema public from authenticated';
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant all on all tables in schema public to service_role';
    execute 'grant all on all sequences in schema public to service_role';
  end if;
end
$$;

-- Explicitly disable RLS on app tables for service-role execution path.
alter table public.categories disable row level security;
alter table public.products disable row level security;
alter table public.product_images disable row level security;
alter table public.customers disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
alter table public.inquiries disable row level security;
alter table public.order_idempotency_keys disable row level security;
alter table public.api_rate_limits disable row level security;

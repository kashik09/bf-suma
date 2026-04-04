alter table if exists public.products
  add column if not exists currency text;
update public.products set currency = 'KES' where currency is null;
alter table if exists public.products
  alter column currency set default 'KES';
alter table if exists public.products
  alter column currency set not null;
alter table if exists public.products
  drop constraint if exists products_currency_valid;
alter table if exists public.products
  add constraint products_currency_valid check (currency in ('KES'));

alter table if exists public.orders
  add column if not exists currency text;
update public.orders set currency = 'KES' where currency is null;
alter table if exists public.orders
  alter column currency set default 'KES';
alter table if exists public.orders
  alter column currency set not null;
alter table if exists public.orders
  drop constraint if exists orders_currency_valid;
alter table if exists public.orders
  add constraint orders_currency_valid check (currency in ('KES'));

alter table if exists public.orders
  add column if not exists idempotency_key text;
create unique index if not exists uq_orders_idempotency_key
  on public.orders (idempotency_key)
  where idempotency_key is not null;

alter table if exists public.order_items
  add column if not exists currency text;
update public.order_items set currency = 'KES' where currency is null;
alter table if exists public.order_items
  alter column currency set default 'KES';
alter table if exists public.order_items
  alter column currency set not null;
alter table if exists public.order_items
  drop constraint if exists order_items_currency_valid;
alter table if exists public.order_items
  add constraint order_items_currency_valid check (currency in ('KES'));

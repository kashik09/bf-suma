create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text null
    check (from_status in ('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED')),
  to_status text not null
    check (to_status in ('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED')),
  changed_by text null,
  note text null,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_changed_at
  on public.order_status_history (order_id, changed_at desc);

create unique index if not exists uq_order_status_history_initial
  on public.order_status_history (order_id)
  where from_status is null;

create table if not exists public.order_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null
    check (event_type in ('ORDER_CREATED')),
  payload jsonb not null,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default now(),
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_order_notification_outbox_order_event
  on public.order_notification_outbox (order_id, event_type);

create index if not exists idx_order_notification_outbox_pending
  on public.order_notification_outbox (status, available_at, created_at);

drop trigger if exists trg_order_notification_outbox_updated_at on public.order_notification_outbox;
create trigger trg_order_notification_outbox_updated_at
before update on public.order_notification_outbox
for each row execute function public.set_updated_at();

create or replace function public.record_initial_order_status_history()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by,
    note,
    changed_at,
    created_at
  )
  values (
    new.id,
    null,
    new.status,
    'system',
    'Order created',
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (order_id) where from_status is null do nothing;

  return new;
end;
$$;

drop trigger if exists trg_orders_insert_status_history on public.orders;
create trigger trg_orders_insert_status_history
after insert on public.orders
for each row execute function public.record_initial_order_status_history();

drop function if exists public.update_order_status_with_history(uuid, text, text, text, text);
create or replace function public.update_order_status_with_history(
  p_order_id uuid,
  p_expected_status text,
  p_new_status text,
  p_changed_by text default null,
  p_note text default null
)
returns table (
  id uuid,
  order_number text,
  customer_id uuid,
  status text,
  payment_status text,
  subtotal integer,
  delivery_fee integer,
  total integer,
  currency text,
  delivery_address text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_changed_by text;
  v_note text;
begin
  if p_order_id is null then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_new_status is null or p_new_status not in ('PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED') then
    raise exception 'INVALID_ORDER_STATUS' using errcode = '22023';
  end if;

  select * into v_order
  from public.orders
  where public.orders.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_expected_status is not null and v_order.status <> p_expected_status then
    raise exception 'ORDER_STATUS_CONFLICT' using errcode = '40001';
  end if;

  if v_order.status = p_new_status then
    return query
    select
      public.orders.id,
      public.orders.order_number,
      public.orders.customer_id,
      public.orders.status,
      public.orders.payment_status,
      public.orders.subtotal,
      public.orders.delivery_fee,
      public.orders.total,
      public.orders.currency,
      public.orders.delivery_address,
      public.orders.notes,
      public.orders.created_at,
      public.orders.updated_at
    from public.orders
    where public.orders.id = p_order_id;
    return;
  end if;

  update public.orders
  set
    status = p_new_status,
    updated_at = now()
  where public.orders.id = p_order_id;

  v_changed_by := nullif(trim(coalesce(p_changed_by, '')), '');
  v_note := nullif(trim(coalesce(p_note, '')), '');

  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by,
    note,
    changed_at,
    created_at
  )
  values (
    p_order_id,
    v_order.status,
    p_new_status,
    v_changed_by,
    v_note,
    now(),
    now()
  );

  return query
  select
    public.orders.id,
    public.orders.order_number,
    public.orders.customer_id,
    public.orders.status,
    public.orders.payment_status,
    public.orders.subtotal,
    public.orders.delivery_fee,
    public.orders.total,
    public.orders.currency,
    public.orders.delivery_address,
    public.orders.notes,
    public.orders.created_at,
    public.orders.updated_at
  from public.orders
  where public.orders.id = p_order_id;
end;
$$;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.order_status_history from anon';
    execute 'revoke all on public.order_notification_outbox from anon';
    execute 'revoke execute on function public.update_order_status_with_history(uuid, text, text, text, text) from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.order_status_history from authenticated';
    execute 'revoke all on public.order_notification_outbox from authenticated';
    execute 'revoke execute on function public.update_order_status_with_history(uuid, text, text, text, text) from authenticated';
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant all on public.order_status_history to service_role';
    execute 'grant all on public.order_notification_outbox to service_role';
    execute 'grant execute on function public.update_order_status_with_history(uuid, text, text, text, text) to service_role';
  end if;
end
$$;

alter table public.order_status_history disable row level security;
alter table public.order_notification_outbox disable row level security;

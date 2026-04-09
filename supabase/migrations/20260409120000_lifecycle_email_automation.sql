create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text null,
  cart_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email_sent_at timestamptz null,
  constraint abandoned_carts_customer_email_non_empty check (char_length(trim(customer_email)) > 0)
);

create unique index if not exists uq_abandoned_carts_customer_email
  on public.abandoned_carts (customer_email);

create index if not exists idx_abandoned_carts_created_email_sent
  on public.abandoned_carts (email_sent_at, created_at);

drop trigger if exists trg_abandoned_carts_updated_at on public.abandoned_carts;
create trigger trg_abandoned_carts_updated_at
before update on public.abandoned_carts
for each row execute function public.set_updated_at();

alter table public.abandoned_carts enable row level security;

drop policy if exists "service_role_all_abandoned_carts" on public.abandoned_carts;
create policy "service_role_all_abandoned_carts"
on public.abandoned_carts
for all
to service_role
using (true)
with check (true);

alter table public.orders
  add column if not exists review_request_sent_at timestamptz null;

alter table public.customers
  add column if not exists reengagement_email_sent_at timestamptz null;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.abandoned_carts from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.abandoned_carts from authenticated';
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant all on public.abandoned_carts to service_role';
  end if;
end
$$;

create or replace function public.invoke_lifecycle_edge_function(function_name text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  supabase_url text := current_setting('app.settings.supabase_url', true);
  service_role_key text := current_setting('app.settings.service_role_key', true);
  url text;
  request_id bigint;
begin
  if function_name is null or char_length(trim(function_name)) = 0 then
    raise exception 'function_name is required';
  end if;

  if supabase_url is null or char_length(trim(supabase_url)) = 0 then
    raise notice 'Lifecycle cron skipped: app.settings.supabase_url is not configured.';
    return null;
  end if;

  if service_role_key is null or char_length(trim(service_role_key)) = 0 then
    raise notice 'Lifecycle cron skipped: app.settings.service_role_key is not configured.';
    return null;
  end if;

  url := concat(trim(trailing '/' from supabase_url), '/functions/v1/', function_name);

  select net.http_post(
    url := url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', service_role_key)
    ),
    body := '{}'::jsonb
  )
  into request_id;

  return request_id;
end;
$$;

do $$
declare
  abandoned_job_id bigint;
  review_job_id bigint;
  reengage_job_id bigint;
begin
  select jobid into abandoned_job_id from cron.job where jobname = 'lifecycle-send-abandoned-cart';
  if abandoned_job_id is not null then
    perform cron.unschedule(abandoned_job_id);
  end if;

  select jobid into review_job_id from cron.job where jobname = 'lifecycle-send-review-request';
  if review_job_id is not null then
    perform cron.unschedule(review_job_id);
  end if;

  select jobid into reengage_job_id from cron.job where jobname = 'lifecycle-send-reengagement';
  if reengage_job_id is not null then
    perform cron.unschedule(reengage_job_id);
  end if;

  perform cron.schedule(
    'lifecycle-send-abandoned-cart',
    '0 * * * *',
    $job$select public.invoke_lifecycle_edge_function('send-abandoned-cart');$job$
  );

  -- 10:00 Africa/Kampala (UTC+3) == 07:00 UTC
  perform cron.schedule(
    'lifecycle-send-review-request',
    '0 7 * * *',
    $job$select public.invoke_lifecycle_edge_function('send-review-request');$job$
  );

  -- 11:00 Africa/Kampala (UTC+3) == 08:00 UTC
  perform cron.schedule(
    'lifecycle-send-reengagement',
    '0 8 * * *',
    $job$select public.invoke_lifecycle_edge_function('send-reengagement');$job$
  );
end
$$;

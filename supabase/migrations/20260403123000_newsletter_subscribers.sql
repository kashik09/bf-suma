set search_path = public;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'unknown',
  context text null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'UNSUBSCRIBED')),
  welcome_email_sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_non_empty check (char_length(trim(email)) > 0),
  constraint newsletter_subscribers_source_non_empty check (char_length(trim(source)) > 0)
);

create unique index if not exists uq_newsletter_subscribers_email_lower
  on public.newsletter_subscribers ((lower(email)));

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers (status);

create index if not exists idx_newsletter_subscribers_created_at
  on public.newsletter_subscribers (created_at desc);

drop trigger if exists trg_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger trg_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row execute function public.set_updated_at();

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.newsletter_subscribers from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.newsletter_subscribers from authenticated';
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant all on public.newsletter_subscribers to service_role';
  end if;
end
$$;

alter table public.newsletter_subscribers disable row level security;

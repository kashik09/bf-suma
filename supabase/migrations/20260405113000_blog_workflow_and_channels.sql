set search_path = public;

alter table public.blog_posts
  add column if not exists internal_tags text[] not null default '{}'::text[],
  add column if not exists channel_targets text[] not null default '{}'::text[];

update public.blog_posts
set internal_tags = coalesce(tags, '{}'::text[])
where (internal_tags is null or cardinality(internal_tags) = 0)
  and tags is not null
  and cardinality(tags) > 0;

do $$
declare
  rec record;
begin
  for rec in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'blog_posts'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
      and pg_get_constraintdef(c.oid) ilike '%DRAFT%'
      and pg_get_constraintdef(c.oid) ilike '%PUBLISHED%'
  loop
    execute format('alter table public.blog_posts drop constraint %I', rec.conname);
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'blog_posts'
      and c.conname = 'blog_posts_status_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_status_check
      check (status in ('DRAFT', 'REVIEW', 'PUBLISHED'));
  end if;

  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'blog_posts'
      and c.conname = 'blog_posts_channel_targets_check'
  ) then
    alter table public.blog_posts
      add constraint blog_posts_channel_targets_check
      check (channel_targets <@ array['SHOP', 'WHATSAPP', 'NEWSLETTER', 'SOCIAL']::text[]);
  end if;
end
$$;

create index if not exists idx_blog_posts_internal_tags_gin on public.blog_posts using gin (internal_tags);
create index if not exists idx_blog_posts_channel_targets_gin on public.blog_posts using gin (channel_targets);

notify pgrst, 'reload schema';

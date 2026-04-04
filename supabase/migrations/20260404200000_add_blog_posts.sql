set search_path = public;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text null,
  content text not null,
  cover_image_url text null,
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'PUBLISHED')),
  author text not null default 'BF Suma Team',
  tags text[] not null default '{}',
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_posts_title_non_empty check (char_length(trim(title)) > 0),
  constraint blog_posts_slug_non_empty check (char_length(trim(slug)) > 0),
  constraint blog_posts_content_non_empty check (char_length(trim(content)) > 0),
  constraint blog_posts_author_non_empty check (char_length(trim(author)) > 0)
);

create index if not exists idx_blog_posts_status on public.blog_posts (status);
create index if not exists idx_blog_posts_published_at on public.blog_posts (published_at desc);
create index if not exists idx_blog_posts_created_at on public.blog_posts (created_at desc);
create index if not exists idx_blog_posts_tags_gin on public.blog_posts using gin (tags);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.blog_posts from anon';
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.blog_posts from authenticated';
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant all on public.blog_posts to service_role';
  end if;
end
$$;

alter table public.blog_posts disable row level security;

notify pgrst, 'reload schema';

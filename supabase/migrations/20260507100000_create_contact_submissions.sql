-- Contact form submissions table
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip_address text,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'responded', 'spam')),
  email_sent_at timestamptz
);

-- Index for admin queries
create index idx_contact_submissions_status on public.contact_submissions(status);
create index idx_contact_submissions_created_at on public.contact_submissions(created_at desc);

-- RLS policies
alter table public.contact_submissions enable row level security;

-- Only service role can insert/read (no public access)
create policy "Service role full access" on public.contact_submissions
  for all using (auth.role() = 'service_role');

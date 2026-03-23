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

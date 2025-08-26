-- AI usage logs for rate limiting and observability
create extension if not exists pgcrypto;
create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tokens_used int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ai_usage_logs enable row level security;

-- RLS: users can only see their own logs; inserts allowed for authenticated users (function writes via service role)
create policy if not exists "read_own_ai_logs" on public.ai_usage_logs for select using (auth.uid() = user_id);
create policy if not exists "insert_own_ai_logs" on public.ai_usage_logs for insert with check (auth.uid() = user_id);

-- Helpful index for rate limit window queries
create index if not exists ai_usage_logs_user_time_idx on public.ai_usage_logs(user_id, created_at desc);

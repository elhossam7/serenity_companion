-- Satisfaction logs for guided sessions and resources
create extension if not exists pgcrypto;
create table if not exists public.satisfaction_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.wellness_resources(id) on delete cascade,
  rating int check (rating between 1 and 5),
  minutes int check (minutes >= 0) default 0,
  satisfaction numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table public.satisfaction_logs enable row level security;

-- Users can read their own satisfaction logs
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'satisfaction_logs'
      and policyname = 'read_own_satisfaction'
  ) then
    execute 'create policy "read_own_satisfaction" on public.satisfaction_logs for select using (auth.uid() = user_id)';
  end if;
end $$;

-- Users can insert their own logs
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'satisfaction_logs'
      and policyname = 'insert_own_satisfaction'
  ) then
    execute 'create policy "insert_own_satisfaction" on public.satisfaction_logs for insert with check (auth.uid() = user_id)';
  end if;
end $$;

create index if not exists satisfaction_logs_user_time_idx on public.satisfaction_logs(user_id, created_at desc);
create index if not exists satisfaction_logs_resource_idx on public.satisfaction_logs(resource_id);

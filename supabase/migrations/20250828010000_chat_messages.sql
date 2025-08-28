-- Chat messages table for AI Chat Support
create extension if not exists pgcrypto;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  thread_id uuid,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

-- Users can manage their own chat messages (Postgres 15 compatible; CREATE POLICY has no IF NOT EXISTS)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_messages'
      and policyname = 'users_manage_own_chat_messages'
  ) then
    create policy "users_manage_own_chat_messages" on public.chat_messages
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

create index if not exists chat_messages_user_time_idx on public.chat_messages(user_id, created_at desc);

-- ============================================
-- OKMindful — Supabase Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates all tables, RLS policies, and triggers needed.

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Anyone can read profiles (needed for validator lookup)
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Users can insert their own profile (on signup)
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 2. Commitments table
create table if not exists public.commitments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  mode text not null check (mode in ('commit', 'stake')),
  stake_amount integer default 0,
  duration_days integer not null,
  start_date date not null default current_date,
  status text not null default 'active' check (status in ('active', 'completed', 'failed')),
  daily_checkins jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.commitments enable row level security;

-- Everyone can read commitments (validators need to see them)
create policy "Commitments are viewable by everyone"
  on public.commitments for select using (true);

-- Owner can insert
create policy "Users can create own commitments"
  on public.commitments for insert with check (auth.uid() = owner_id);

-- Owner can update
create policy "Users can update own commitments"
  on public.commitments for update using (auth.uid() = owner_id);

-- Owner can delete
create policy "Users can delete own commitments"
  on public.commitments for delete using (auth.uid() = owner_id);

-- 3. Commitment validators (join table)
create table if not exists public.commitment_validators (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references public.commitments(id) on delete cascade,
  validator_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decided_at timestamptz,
  unique(commitment_id, validator_id)
);

alter table public.commitment_validators enable row level security;

-- Everyone can read validator assignments
create policy "Validator assignments are viewable by everyone"
  on public.commitment_validators for select using (true);

-- Commitment owner can insert validators
create policy "Commitment owner can assign validators"
  on public.commitment_validators for insert
  with check (
    auth.uid() = (select owner_id from public.commitments where id = commitment_id)
  );

-- Validator can update their own status (approve/reject)
create policy "Validators can update own status"
  on public.commitment_validators for update
  using (auth.uid() = validator_id);

-- 4. Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_sessions integer not null default 4,
  completed_sessions integer not null default 0,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);
create policy "Users can create own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- 5. Pomodoro sessions table
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  task_title text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes integer not null,
  completed boolean not null default true,
  created_at timestamptz default now()
);

alter table public.pomodoro_sessions enable row level security;

create policy "Users can view own sessions"
  on public.pomodoro_sessions for select using (auth.uid() = user_id);
create policy "Users can create own sessions"
  on public.pomodoro_sessions for insert with check (auth.uid() = user_id);

-- 6. Chat messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  opik_trace_id text,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view own messages"
  on public.chat_messages for select using (auth.uid() = user_id);
create policy "Users can create own messages"
  on public.chat_messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages"
  on public.chat_messages for delete using (auth.uid() = user_id);

-- 7. Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: run on every new auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 8. Function: update commitment status when all validators decide
create or replace function public.check_commitment_resolution()
returns trigger as $$
declare
  total_validators integer;
  decided_count integer;
  rejected_count integer;
  c_id uuid;
begin
  c_id := new.commitment_id;
  
  select count(*) into total_validators
  from public.commitment_validators where commitment_id = c_id;
  
  select count(*) into decided_count
  from public.commitment_validators where commitment_id = c_id and status != 'pending';
  
  select count(*) into rejected_count
  from public.commitment_validators where commitment_id = c_id and status = 'rejected';
  
  if decided_count = total_validators and total_validators > 0 then
    if rejected_count > 0 then
      update public.commitments set status = 'failed' where id = c_id and status = 'active';
    else
      update public.commitments set status = 'completed' where id = c_id and status = 'active';
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_validator_decision on public.commitment_validators;
create trigger on_validator_decision
  after update on public.commitment_validators
  for each row
  when (old.status = 'pending' and new.status != 'pending')
  execute function public.check_commitment_resolution();

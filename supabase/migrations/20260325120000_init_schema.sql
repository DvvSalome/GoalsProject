-- Reality Check AI: profiles, goals, goal_history
-- Run in Supabase SQL Editor or via supabase db push

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- Goals: fields aligned with frontend InputForm
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal text not null,
  hours numeric not null check (hours >= 0.5 and hours <= 16),
  energy smallint not null check (energy between 1 and 10),
  mood text not null check (mood in ('good', 'neutral', 'bad')),
  distractions boolean not null default false,
  consistency text not null check (consistency in ('high', 'medium', 'low')),
  recent_schedule text not null check (recent_schedule in ('stable', 'unstable', 'chaotic')),
  recent_follow_through text not null check (
    recent_follow_through in ('strong', 'partial', 'little', 'none')
  ),
  recent_history text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_created_at_idx on public.goals (created_at desc);

-- History per goal: predictions (OpenAI/demo) or manual notes
create table if not exists public.goal_history (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null default 'prediction' check (event_type in ('prediction', 'note')),
  source text check (source is null or source in ('openai', 'demo')),
  input_snapshot jsonb not null default '{}'::jsonb,
  prediction jsonb,
  created_at timestamptz not null default now(),
  constraint goal_history_prediction_check check (
    (event_type = 'prediction' and prediction is not null and source is not null)
    or (event_type = 'note' and prediction is null)
  )
);

create index if not exists goal_history_goal_id_idx on public.goal_history (goal_id, created_at desc);
create index if not exists goal_history_user_id_idx on public.goal_history (user_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at();

-- New auth user -> profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_history enable row level security;

-- Profiles: own row only
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Goals: CRUD own rows
create policy "Users can select own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Goal history: own user_id
create policy "Users can select own goal history"
  on public.goal_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own goal history"
  on public.goal_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own goal history"
  on public.goal_history for delete
  using (auth.uid() = user_id);

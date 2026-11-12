-- LEVEL UP MVP schema (PostgreSQL / Supabase)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  category text not null check (category in ('physical','intellect','discipline','finance','social','mental')),
  description text,
  xp integer not null default 10 check (xp between 1 and 100),
  scheduled_for date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_key text not null,
  log_date date not null default current_date,
  completed boolean not null default false,
  unique(user_id, habit_key, log_date)
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  amount integer not null check (amount between 1 and 100),
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'telegram_stars',
  provider_charge_id text unique,
  status text not null check (status in ('pending','active','cancelled','expired','refunded')),
  plan_code text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- MVP access pattern: service-role server only. Do not expose service_role to browser.
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.missions enable row level security;
alter table public.habit_logs enable row level security;
alter table public.xp_events enable row level security;
alter table public.subscriptions enable row level security;

-- No public policies are intentionally added. Add user-scoped policies only after
-- implementing a trusted server session mapping Telegram identity to app identity.

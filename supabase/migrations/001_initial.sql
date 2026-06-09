-- SubTracker schema for Supabase
-- Run in: Supabase Dashboard → SQL Editor → New query

-- Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category_id text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'THB',
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly')),
  next_billing_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  is_shared boolean not null default false,
  shared_members jsonb not null default '[]'::jsonb,
  notes text,
  remind_days_before int not null default 3,
  icon text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- User settings (base currency, etc.)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  base_currency text not null default 'THB',
  updated_at timestamptz not null default now()
);

-- Web Push subscriptions (optional)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null unique,
  keys jsonb not null,
  device_info jsonb,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.subscriptions enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = user_id);

create policy "subscriptions_delete_own" on public.subscriptions
  for delete using (auth.uid() = user_id);

create policy "user_settings_all_own" on public.user_settings
  for all using (auth.uid() = user_id);

create policy "push_subscriptions_all_own" on public.push_subscriptions
  for all using (auth.uid() = user_id);

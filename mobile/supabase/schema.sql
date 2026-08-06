-- Nabhni (نبهني) — initial schema
-- Paste this whole file into Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement uses IF NOT EXISTS / CREATE OR REPLACE / DROP-then-CREATE for policies.

-- ============================================================================
-- profiles — one row per auth.users row, auto-created on signup.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'plus')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- addresses — home / work / custom saved places, used by the AI chat to
-- resolve phrases like "ذكرني عند مغادرة البيت" without re-asking for the
-- location every time.
-- ============================================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default 'custom' check (label in ('home', 'work', 'custom')),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius integer not null default 150,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

alter table public.addresses enable row level security;

drop policy if exists "addresses_all_own" on public.addresses;
create policy "addresses_all_own" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- reminders — cloud mirror of the on-device reminders (kept in sync once the
-- user is signed in) so the AI chat's "what are my reminders today" /
-- "analyze my subscriptions" tools can read a consistent server-side view.
-- ============================================================================
create table if not exists public.reminders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text not null default '',
  due_date timestamptz,
  is_all_day boolean not null default false,
  repeat text not null default 'none',
  time_sensitive boolean not null default false,
  completed boolean not null default false,
  location jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

drop policy if exists "reminders_all_own" on public.reminders;
create policy "reminders_all_own" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- tracked_subscriptions — the user's OWN external subscriptions (Netflix,
-- gym, etc.) they log manually so the app can remind them before renewal and
-- the "حلل اشتراكاتك" AI tool can total up monthly spend.
-- ============================================================================
create table if not exists public.tracked_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  currency text not null default 'SAR',
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tracked_subscriptions_user_id_idx on public.tracked_subscriptions (user_id);

alter table public.tracked_subscriptions enable row level security;

drop policy if exists "tracked_subscriptions_all_own" on public.tracked_subscriptions;
create policy "tracked_subscriptions_all_own" on public.tracked_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- support_tickets — submissions from Settings → "طلب دعم فني". A DB webhook
-- (configured separately, see supabase/functions/send-support-email) emails
-- gm@skhaa.sa whenever a row is inserted here.
-- ============================================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "support_tickets_insert_own" on public.support_tickets;
create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "support_tickets_select_own" on public.support_tickets;
create policy "support_tickets_select_own" on public.support_tickets
  for select using (auth.uid() = user_id);

-- ============================================================================
-- updated_at auto-touch trigger, reused across tables.
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_addresses_updated_at on public.addresses;
create trigger touch_addresses_updated_at before update on public.addresses
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_reminders_updated_at on public.reminders;
create trigger touch_reminders_updated_at before update on public.reminders
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_tracked_subscriptions_updated_at on public.tracked_subscriptions;
create trigger touch_tracked_subscriptions_updated_at before update on public.tracked_subscriptions
  for each row execute function public.touch_updated_at();

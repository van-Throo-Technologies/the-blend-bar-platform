-- The Blend Bar V1 - Supabase schema
-- Run in Supabase SQL editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  amount_total integer,
  currency text,
  status text not null check (status in ('paid','refunded','disputed','pending')),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  status text not null default 'active' check (status in ('active','revoked','expired')),
  source text not null,
  source_reference text,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, product_key)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  edition_key text not null,
  status text not null default 'completed' check (status in ('draft','completed')),
  answers jsonb not null,
  customer_result jsonb not null,
  method_version text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_created_idx on public.assessments(user_id, created_at desc);
create index if not exists entitlements_user_product_idx on public.entitlements(user_id, product_key);

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;
alter table public.assessments enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id);
create policy "entitlements_select_own" on public.entitlements for select using (auth.uid() = user_id);
create policy "assessments_select_own" on public.assessments for select using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.assessments for insert with check (auth.uid() = user_id);

-- Create profile automatically after signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- The Blend Bar V1 - Supabase schema
-- Run in Supabase SQL editor after creating the project.
-- Fresh installs only. Existing projects apply the files in supabase/migrations/ in order instead.

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
  created_at timestamptz not null default now(),
  unique (id, user_id),
  -- The Blend Brief is stored in blend_briefs, never inside the Explorer-readable result.
  constraint assessments_result_has_no_blend_brief check (not (customer_result ? 'blendBrief'))
);

-- Protected Blend Brief, readable only while an active entitlement for its edition exists.
create table if not exists public.blend_briefs (
  assessment_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  edition_key text not null,
  brief jsonb not null check (jsonb_typeof(brief) = 'object'),
  method_version text not null,
  created_at timestamptz not null default now(),
  foreign key (assessment_id, user_id) references public.assessments(id, user_id) on delete cascade
);

-- Optional, purpose-specific communication consent. Never tied to the Hair Need Result.
create table if not exists public.communication_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null check (email = lower(email) and length(email) between 3 and 254),
  channel text not null check (channel in ('email')),
  purpose text not null check (purpose in ('blend_bar_updates')),
  status text not null check (status in ('subscribed','unsubscribed')),
  consented_at timestamptz not null,
  withdrawn_at timestamptz,
  source text not null check (length(source) between 1 and 100),
  wording_version text not null check (length(wording_version) between 1 and 50),
  wording_text text not null check (length(wording_text) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, channel, purpose),
  check ((status = 'subscribed' and withdrawn_at is null) or (status = 'unsubscribed' and withdrawn_at is not null))
);

create index if not exists assessments_user_created_idx on public.assessments(user_id, created_at desc);
create index if not exists entitlements_user_product_idx on public.entitlements(user_id, product_key);
create index if not exists blend_briefs_user_edition_idx on public.blend_briefs(user_id, edition_key);
create index if not exists communication_consents_user_idx on public.communication_consents(user_id);

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;
alter table public.assessments enable row level security;
alter table public.blend_briefs enable row level security;
alter table public.communication_consents enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id);
create policy "entitlements_select_own" on public.entitlements for select using (auth.uid() = user_id);
create policy "assessments_select_own" on public.assessments for select using (auth.uid() = user_id);
-- Assessments are written by the server only (record_assessment), never by the browser.
create policy "blend_briefs_select_entitled_owner" on public.blend_briefs for select to authenticated
  using (
    user_id = (select auth.uid())
    and exists (select 1 from public.entitlements e where e.user_id = (select auth.uid()) and e.product_key = blend_briefs.edition_key and e.status = 'active')
  );
create policy "communication_consents_select_own" on public.communication_consents for select to authenticated using (user_id = (select auth.uid()));

revoke insert, update, delete, truncate on public.assessments from anon, authenticated;
revoke insert, update, delete, truncate on public.blend_briefs from anon, authenticated;
revoke insert, update, delete, truncate on public.communication_consents from anon, authenticated;

-- At most 10 completed assessments per participant per 24 hours.
create or replace function public.enforce_assessment_rate_limit()
returns trigger language plpgsql set search_path = public as $$
declare recent integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('assessments:' || new.user_id::text, 0));
  select count(*) into recent from public.assessments where user_id = new.user_id and created_at > now() - interval '24 hours';
  if recent >= 10 then
    raise exception 'assessment_rate_limited' using hint = 'At most 10 completed assessments per participant per 24 hours.';
  end if;
  return new;
end;
$$;

drop trigger if exists assessments_rate_limit on public.assessments;
create trigger assessments_rate_limit before insert on public.assessments
for each row execute function public.enforce_assessment_rate_limit();

-- Server-only atomic write of a Hair Need result and its Blend Brief.
create or replace function public.record_assessment(
  p_user_id uuid, p_edition_key text, p_answers jsonb, p_result jsonb, p_brief jsonb, p_method_version text
) returns uuid language plpgsql security invoker set search_path = public as $$
declare v_id uuid;
begin
  if p_result ? 'blendBrief' then raise exception 'blend_brief_must_be_stored_separately'; end if;
  insert into public.assessments (user_id, edition_key, status, answers, customer_result, method_version, completed_at)
  values (p_user_id, p_edition_key, 'completed', p_answers, p_result, p_method_version, now())
  returning id into v_id;
  insert into public.blend_briefs (assessment_id, user_id, edition_key, brief, method_version)
  values (v_id, p_user_id, p_edition_key, p_brief, p_method_version);
  return v_id;
end;
$$;

revoke all on function public.record_assessment(uuid, text, jsonb, jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.record_assessment(uuid, text, jsonb, jsonb, jsonb, text) to service_role;

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

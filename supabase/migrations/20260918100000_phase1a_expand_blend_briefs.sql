-- ============================================================================
-- PHASE 1A — STEP 1 OF 2: EXPAND (additive; safe while the current code is live)
--
-- Apply BEFORE deploying the Phase 1A application code.
-- Then deploy the code. Then apply 20260918100100_phase1a_contract_blend_briefs.sql.
--
-- What this does:
--   1. Creates public.blend_briefs: the protected Blend Brief, stored apart from the
--      Explorer-readable assessment result. Readable only by its owner while they hold an
--      active entitlement for that edition. Browsers can never write it.
--   2. Copies every existing embedded Blend Brief into blend_briefs (nothing is deleted here).
--   3. Adds public.record_assessment(): one transaction that stores the Hair Need result and
--      its Blend Brief together. Executable by the server (service_role) only.
--   4. Adds a per-participant limit on completed assessments (Postgres only, no Redis).
--   5. Creates public.communication_consents for optional, purpose-specific consent.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Blend Briefs
-- ---------------------------------------------------------------------------

-- Lets blend_briefs reference (assessment, owner) as a pair, so a brief can never be
-- attached to somebody else's assessment.
alter table public.assessments
  drop constraint if exists assessments_id_user_id_key;
alter table public.assessments
  add constraint assessments_id_user_id_key unique (id, user_id);

create table if not exists public.blend_briefs (
  assessment_id  uuid primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  -- The entitlement product key that unlocks this brief (e.g. 'conditioner-edition-v1').
  edition_key    text not null,
  brief          jsonb not null check (jsonb_typeof(brief) = 'object'),
  method_version text not null,
  created_at     timestamptz not null default now(),
  foreign key (assessment_id, user_id)
    references public.assessments(id, user_id) on delete cascade
);

create index if not exists blend_briefs_user_edition_idx
  on public.blend_briefs(user_id, edition_key);

alter table public.blend_briefs enable row level security;

-- Owner-only, and only while an ACTIVE entitlement for the brief's edition exists.
-- Revoking/expiring the entitlement hides the brief immediately; nothing is deleted.
drop policy if exists "blend_briefs_select_entitled_owner" on public.blend_briefs;
create policy "blend_briefs_select_entitled_owner"
  on public.blend_briefs
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.entitlements e
      where e.user_id = (select auth.uid())
        and e.product_key = blend_briefs.edition_key
        and e.status = 'active'
    )
  );

-- No insert/update/delete policies exist, so RLS already denies browser writes.
-- Revoking the privileges as well means a future permissive policy cannot reopen them.
revoke insert, update, delete, truncate on public.blend_briefs from anon, authenticated;

-- Copy existing embedded briefs. Idempotent; the embedded copies are only removed in step 2.
insert into public.blend_briefs (assessment_id, user_id, edition_key, brief, method_version, created_at)
select a.id,
       a.user_id,
       a.edition_key,
       a.customer_result -> 'blendBrief',
       a.method_version,
       coalesce(a.completed_at, a.created_at)
from public.assessments a
where jsonb_typeof(a.customer_result -> 'blendBrief') = 'object'
on conflict (assessment_id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Per-participant limit on completed assessments
-- ---------------------------------------------------------------------------
-- Enforced in the database, so it holds for every write path. The advisory lock serialises
-- concurrent submissions from the same participant so the count cannot be raced.

create or replace function public.enforce_assessment_rate_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  recent integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('assessments:' || new.user_id::text, 0));
  select count(*) into recent
  from public.assessments
  where user_id = new.user_id
    and created_at > now() - interval '24 hours';
  if recent >= 10 then
    raise exception 'assessment_rate_limited'
      using hint = 'At most 10 completed assessments per participant per 24 hours.';
  end if;
  return new;
end;
$$;

drop trigger if exists assessments_rate_limit on public.assessments;
create trigger assessments_rate_limit
  before insert on public.assessments
  for each row execute function public.enforce_assessment_rate_limit();

-- ---------------------------------------------------------------------------
-- 3. Server-only atomic write: Hair Need result + Blend Brief in one transaction
-- ---------------------------------------------------------------------------

create or replace function public.record_assessment(
  p_user_id        uuid,
  p_edition_key    text,
  p_answers        jsonb,
  p_result         jsonb,
  p_brief          jsonb,
  p_method_version text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_result ? 'blendBrief' then
    raise exception 'blend_brief_must_be_stored_separately';
  end if;

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

-- ---------------------------------------------------------------------------
-- 4. Communication consent (optional, purpose-specific, never tied to the Hair Need Result)
-- ---------------------------------------------------------------------------
-- One current-state row per address, channel and purpose. Withdrawal is recorded, not deleted.
-- Written only by the server; owners may read their own records.

create table if not exists public.communication_consents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  email           text not null check (email = lower(email) and length(email) between 3 and 254),
  channel         text not null check (channel in ('email')),
  purpose         text not null check (purpose in ('blend_bar_updates')),
  status          text not null check (status in ('subscribed', 'unsubscribed')),
  consented_at    timestamptz not null,
  withdrawn_at    timestamptz,
  source          text not null check (length(source) between 1 and 100),
  wording_version text not null check (length(wording_version) between 1 and 50),
  wording_text    text not null check (length(wording_text) between 1 and 2000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (email, channel, purpose),
  check (
    (status = 'subscribed'   and withdrawn_at is null) or
    (status = 'unsubscribed' and withdrawn_at is not null)
  )
);

create index if not exists communication_consents_user_idx on public.communication_consents(user_id);

alter table public.communication_consents enable row level security;

drop policy if exists "communication_consents_select_own" on public.communication_consents;
create policy "communication_consents_select_own"
  on public.communication_consents
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete, truncate on public.communication_consents from anon, authenticated;

commit;

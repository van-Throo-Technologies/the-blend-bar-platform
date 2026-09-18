-- ============================================================================
-- PHASE 1A — STEP 2 OF 2: CONTRACT
--
-- Apply ONLY AFTER the Phase 1A application code is deployed (the code that writes through
-- record_assessment() and reads Blend Briefs from public.blend_briefs).
-- Must be applied BEFORE the Hair Need Journey is opened to Explorers (Phase 1B).
--
-- What this does:
--   1. Re-copies any embedded Blend Brief written by the old code between step 1 and now.
--   2. Refuses to continue if any embedded brief still lacks a separate copy.
--   3. Removes the Blend Brief from every stored assessment result.
--   4. Removes direct browser creation of assessment rows.
--   5. Adds a constraint so a stored result can never again embed a Blend Brief.
-- ============================================================================

begin;

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

do $$
begin
  if exists (
    select 1
    from public.assessments a
    where a.customer_result ? 'blendBrief'
      and jsonb_typeof(a.customer_result -> 'blendBrief') = 'object'
      and not exists (select 1 from public.blend_briefs b where b.assessment_id = a.id)
  ) then
    raise exception 'Aborting: an embedded Blend Brief has no separate copy in public.blend_briefs.';
  end if;
end;
$$;

update public.assessments
set customer_result = customer_result - 'blendBrief'
where customer_result ? 'blendBrief';

-- Browsers may no longer create (or change) assessment rows; the server writes them.
drop policy if exists "assessments_insert_own" on public.assessments;
revoke insert, update, delete, truncate on public.assessments from anon, authenticated;

alter table public.assessments
  drop constraint if exists assessments_result_has_no_blend_brief;
alter table public.assessments
  add constraint assessments_result_has_no_blend_brief
  check (not (customer_result ? 'blendBrief'));

commit;

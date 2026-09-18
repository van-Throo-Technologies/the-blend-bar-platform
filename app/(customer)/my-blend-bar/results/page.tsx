import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Check, HeartPulse, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'

/** Hair Need fields read back from storage. Older rows predate widerSignals and Maintain & Support. */
type StoredResult = {
  characteristics?: string[] | null
  currentCondition?: string[] | null
  primaryNeed?: string | null
  widerSignals?: { title: string; body: string }[] | null
}

type BlendBrief = { direction?: string; priorities?: string[]; performanceEdit?: string[]; proteinGuidance?: string }

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only the Hair Need fields are requested — never the whole stored result — so this page cannot
  // pick up protected Blend Brief content from rows written before the Blend Brief was separated.
  const { data } = await supabase
    .from('assessments')
    .select('id,completed_at,characteristics:customer_result->characteristics,currentCondition:customer_result->currentCondition,primaryNeed:customer_result->>primaryNeed,widerSignals:customer_result->widerSignals')
    .eq('user_id', user.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!data) redirect('/my-blend-bar/assessment')

  const result = data as StoredResult & { id: string }
  const signals = result.widerSignals ?? []
  const maintaining = result.primaryNeed === 'Maintain & Support'

  // The Blend Brief lives in blend_briefs. The database only returns it to its owner while they hold
  // an active entitlement for its edition; the check here decides which panel to show.
  const entitlement = await getConditionerEntitlement(user.id)
  const { data: briefRow } = entitlement
    ? await supabase.from('blend_briefs').select('brief').eq('assessment_id', result.id).maybeSingle()
    : { data: null }
  const brief = (briefRow?.brief ?? null) as BlendBrief | null

  return (
    <>
      {/* Arrival */}
      <section data-surface="deep" className="surface">
        <div className="shell max-w-4xl py-20 sm:py-28">
          <p className="eyebrow">Your Hair Need</p>
          <span aria-hidden className="rule-gold mt-6" />
          <h1 className="display mt-8 text-[2.75rem] leading-[1.02] sm:text-[4.5rem]">{result.primaryNeed ?? 'Maintain & Support'}</h1>
          <p className="muted mt-8 max-w-2xl text-[1.0625rem] leading-8">
            {maintaining
              ? 'Nothing in your current observations strongly suggests that your hair needs corrective support in one particular area. That’s useful information too. Your Blend Brief can focus on supporting what is already working rather than automatically adding more.'
              : 'This is a guided formulation direction based on the pattern across your observations. It is not a public score, and it does not expose the internal decision logic behind the assessment.'}
          </p>
        </div>
      </section>

      {/* Descriptive detail on a clean science surface */}
      <section data-surface="clean" className="surface border-b border-[var(--rule)]">
        <div className="shell max-w-4xl grid gap-12 py-16 md:grid-cols-2 sm:py-20">
          <div>
            <h2 className="eyebrow">Hair Characteristics</h2>
            <p className="muted mt-3 text-sm leading-6">Descriptive information that shapes how we formulate.</p>
            <ul className="mt-6 border-t border-[var(--rule)]">
              {(result.characteristics ?? []).map((item) => (
                <li className="flex gap-3 border-b border-[var(--rule)] py-4" key={item}>
                  <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[var(--green)]" /><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow">Current Condition</h2>
            <p className="muted mt-3 text-sm leading-6">What your fibre appears to be doing right now.</p>
            <ul className="mt-6 border-t border-[var(--rule)]">
              {(result.currentCondition ?? []).map((item) => (
                <li className="flex gap-3 border-b border-[var(--rule)] py-4" key={item}>
                  <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[var(--green)]" /><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Blend Brief — participant-only. Its content only ever comes from blend_briefs. */}
      <section data-surface="deep" className="surface">
        <div className="shell max-w-4xl py-16 sm:py-24">
          {brief ? (
            <>
              <p className="eyebrow">Blend Brief · V1</p>
              <span aria-hidden className="rule-gold mt-6" />
              <h2 className="display mt-8 max-w-3xl text-[2rem] leading-tight sm:text-[2.75rem]">{brief.direction}</h2>
              <div className="mt-14 grid gap-12 md:grid-cols-2">
                <div>
                  <h3 className="eyebrow">Priorities</h3>
                  <ul className="mt-5 border-t border-[var(--rule)]">
                    {(brief.priorities ?? []).map((item) => <li key={item} className="border-b border-[var(--rule)] py-4">{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="eyebrow">Performance Edit direction</h3>
                  {(brief.performanceEdit ?? []).length > 0
                    ? <ul className="mt-5 border-t border-[var(--rule)]">{(brief.performanceEdit ?? []).map((item) => <li key={item} className="border-b border-[var(--rule)] py-4">{item}</li>)}</ul>
                    : <p className="muted mt-5 leading-7">No corrective additions are indicated. Your workshop guidance will focus on a balanced base that supports what is already working.</p>}
                </div>
              </div>
              <div className="mt-12 border-l border-[var(--gold)] pl-6">
                <h3 className="font-semibold">Protein guidance</h3>
                <p className="muted mt-3 max-w-2xl text-sm leading-6">{brief.proteinGuidance}</p>
              </div>
            </>
          ) : entitlement ? (
            <>
              <p className="eyebrow">Your Blend Brief</p>
              <span aria-hidden className="rule-gold mt-6" />
              <p className="muted mt-8 max-w-2xl leading-7">
                Your Blend Brief isn&rsquo;t available for this result yet. If this persists, contact{' '}
                <a href="mailto:blendbar@naturalhairtherapist.com" className="focus-ring font-semibold text-[var(--text)] underline underline-offset-4">blendbar@naturalhairtherapist.com</a>.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow flex items-center gap-2"><LockKeyhole aria-hidden className="h-3.5 w-3.5" />Participant access</p>
              <span aria-hidden className="rule-gold mt-6" />
              <h2 className="display mt-8 text-[2rem] leading-tight sm:text-[2.75rem]">Your Blend Brief</h2>
              <p className="display mt-6 max-w-2xl text-xl leading-snug sm:text-2xl">
                At The Blend Bar, understanding becomes formulation. Your Blend Brief connects your Hair Need observations to the functions you&rsquo;ll explore while creating your conditioner.
              </p>
              <p className="muted mt-6 leading-7">Available with your Belgium Edition reservation.</p>
              <Link href="/#belgium-edition" className="btn mt-10">Reserve your place<ArrowRight aria-hidden className="h-4 w-4" /></Link>
            </>
          )}
        </div>
      </section>

      {/* Wider signals — deliberately outside the formulation */}
      {signals.length > 0 && (
        <section className="surface border-b border-[var(--rule)]">
          <div className="shell max-w-4xl py-16 sm:py-20">
            <div className="flex items-center gap-3">
              <HeartPulse aria-hidden className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="eyebrow">Wider hair health signals</h2>
            </div>
            <p className="muted mt-5 max-w-2xl leading-7">
              These sit outside your conditioner formulation. They do not change your Hair Need or your Blend Brief — they are here because they deserve awareness.
            </p>
            <div className="mt-10 grid gap-px border-t border-[var(--rule)] md:grid-cols-2">
              {signals.map((signal) => (
                <div key={signal.title} className="border-b border-[var(--rule)] py-7 md:pr-10">
                  <h3 className="display text-xl">{signal.title}</h3>
                  <p className="muted mt-3 text-sm leading-6">{signal.body}</p>
                </div>
              ))}
            </div>
            <p className="muted mt-8 text-sm leading-6">
              None of this is a diagnosis. If something here concerns you, a medical professional is the right place to take it.
            </p>
          </div>
        </section>
      )}

      <div className="shell max-w-4xl flex flex-wrap gap-3 py-14">
        {entitlement && <a href="/my-blend-bar/workshop" className="btn">Continue to workshop preparation<ArrowRight aria-hidden className="h-4 w-4" /></a>}
        <a href="/my-blend-bar/assessment" className="btn-ghost">Retake assessment</a>
      </div>
    </>
  )
}

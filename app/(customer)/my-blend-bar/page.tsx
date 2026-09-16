import Link from 'next/link'
import { ArrowRight, ClipboardCheck, FlaskConical, LockKeyhole, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'

export default async function MyBlendBarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const entitlement = user ? await getConditionerEntitlement(user.id) : null
  const { data: assessment } = user
    ? await supabase.from('assessments').select('status,completed_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }
  const completed = assessment?.status === 'completed'

  const cards: [typeof ClipboardCheck, string, string, string][] = [
    [ClipboardCheck, 'Hair Need Journey', completed ? 'Completed · review your result' : 'Tell us what your hair is showing you.', entitlement ? '/my-blend-bar/assessment' : '#'],
    [FlaskConical, 'Your Blend Brief', completed ? 'Your guided formulation direction is ready.' : 'Available after your journey.', completed ? '/my-blend-bar/results' : '#'],
    [PlayCircle, 'Workshop preparation', 'Prepare your space and understand what to expect.', entitlement ? '/my-blend-bar/workshop' : '#'],
  ]

  return (
    <>
      <section className="surface border-b border-[var(--rule)]">
        <div className="shell flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between sm:py-20">
          <div>
            <p className="eyebrow">My Blend Bar</p>
            <span aria-hidden className="rule-gold mt-5" />
            <h1 className="display mt-7 text-[2.5rem] leading-[1.05] sm:text-[3.5rem]">Your Conditioner Edition space.</h1>
            <p className="muted mt-5 max-w-2xl leading-8">Journey, preparation and workshop content — kept together in one guided pathway.</p>
          </div>
          <p className={`shrink-0 border px-4 py-2 text-sm font-semibold ${entitlement ? 'border-[var(--green)] text-[var(--green-deep)]' : 'border-[var(--rule-strong)] text-[var(--slate)]'}`} style={{ borderRadius: 'var(--radius)' }}>
            {entitlement ? 'Access active' : 'Workshop access not yet active'}
          </p>
        </div>
      </section>

      {!entitlement && (
        <section data-surface="deep" className="surface">
          <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_auto] md:items-center sm:py-20">
            <div>
              <p className="eyebrow">Activate your edition</p>
              <span aria-hidden className="rule-gold mt-5" />
              <h2 className="display mt-7 text-[2rem] leading-tight sm:text-[2.75rem]">Unlock Conditioner Edition</h2>
              <p className="muted mt-5 max-w-2xl leading-8">Secure checkout is handled by Stripe. Once payment is confirmed, your access is granted automatically.</p>
            </div>
            <form action="/api/checkout" method="post">
              <button className="btn">Continue to secure checkout<ArrowRight aria-hidden className="h-4 w-4" /></button>
            </form>
          </div>
        </section>
      )}

      <section data-surface="clean" className="surface">
        <div className="shell grid gap-px py-16 md:grid-cols-3 sm:py-20">
          {cards.map(([Icon, title, description, href]) => {
            const locked = href === '#'
            return (
              <Link
                aria-disabled={locked}
                href={href}
                key={title}
                className={`focus-ring group flex flex-col justify-between border border-[var(--rule)] p-8 transition ${locked ? 'pointer-events-none opacity-60' : 'hover:border-[var(--green)]'}`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <div className="flex items-center justify-between">
                  <Icon aria-hidden className="h-6 w-6 text-[var(--green)]" />
                  {locked ? <LockKeyhole aria-hidden className="h-4 w-4 text-[var(--slate)]" /> : <ArrowRight aria-hidden className="h-4 w-4 text-[var(--green)]" />}
                </div>
                <div className="mt-16">
                  <h2 className="display text-xl">{title}</h2>
                  <p className="muted mt-3 text-sm leading-6">{description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

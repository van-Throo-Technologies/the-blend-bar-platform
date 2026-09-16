import { redirect } from 'next/navigation'
import { Beaker, PackageCheck, PlayCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'

const videos = ['Welcome to Conditioner Edition', 'How to read your Blend Brief', 'Your workstation setup', 'Understanding the Performance Edit']
const checklist = ['Review your Hair Need result', 'Read your Blend Brief', 'Prepare a clean workspace', 'Keep your workshop kit together', 'Have a notebook or digital notes ready']

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!await getConditionerEntitlement(user.id)) redirect('/my-blend-bar')

  return (
    <>
      <section className="surface border-b border-[var(--rule)]">
        <div className="shell py-16 sm:py-20">
          <p className="eyebrow">Conditioner Edition</p>
          <span aria-hidden className="rule-gold mt-5" />
          <h1 className="display mt-7 max-w-3xl text-[2.5rem] leading-[1.05] sm:text-[3.5rem]">Prepare first. Blend with intention.</h1>
          <p className="muted mt-5 max-w-3xl leading-8">
            This space will hold your short preparation videos, ingredient education and workshop sequence.
          </p>
        </div>
      </section>

      <section data-surface="clean" className="surface">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[1.25fr_.75fr] sm:py-20">
          <div>
            <h2 className="eyebrow">Before the workshop</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {videos.map((title, i) => (
                <article key={title}>
                  <div data-surface="deep" className="surface grid aspect-video place-items-center" style={{ borderRadius: 'var(--radius)' }}>
                    <PlayCircle aria-hidden className="h-10 w-10 text-[var(--ivory)]" />
                  </div>
                  <p className="eyebrow mt-5">Video placeholder · {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="display mt-2 text-lg">{title}</h3>
                  <p className="muted mt-2 text-sm leading-6">Replace this placeholder with the final hosted video when content is ready.</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-10">
            <div>
              <PackageCheck aria-hidden className="h-6 w-6 text-[var(--green)]" />
              <h2 className="display mt-5 text-xl">Preparation checklist</h2>
              <ul className="muted mt-5 border-t border-[var(--rule)] text-sm">
                {checklist.map((item) => <li key={item} className="border-b border-[var(--rule)] py-3">{item}</li>)}
              </ul>
            </div>
            <div className="border-l border-[var(--gold)] pl-6">
              <Beaker aria-hidden className="h-6 w-6 text-[var(--gold)]" />
              <h2 className="display mt-5 text-xl">Performance Edit</h2>
              <p className="muted mt-3 text-sm leading-6">D-Panthenol · Polyquaternium-7 · Sodium PCA · Hydrolyzed Rice Protein · Silk Amino Acids</p>
              <p className="muted mt-5 flex gap-3 text-xs leading-5">
                <ShieldCheck aria-hidden className="h-4 w-4 shrink-0" />
                Protein options are taught as informed choices, not universal additions.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

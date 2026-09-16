import { ArrowRight, Beaker, BookOpen, FlaskConical, ShieldCheck, Sparkles } from 'lucide-react'
import { PublicNav } from '@/components/public-nav'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

const steps: [string, string, string][] = [
  ['01', 'Understand your hair', 'Complete the Hair Need Journey to explore how your hair behaves and what it may need now.'],
  ['02', 'Receive your Blend Brief', 'Translate your Hair Characteristics and Current Condition into a guided formulation direction.'],
  ['03', 'Learn before you blend', 'Understand the role of the base, performance ingredients and informed choices before the workshop begins.'],
  ['04', 'Create with intention', 'Follow the Conditioner Edition experience with a clearer reason behind every selection.'],
]

const pillars: [typeof Beaker, string, string][] = [
  [Beaker, 'Science-led', 'Ingredient education is grounded in cosmetic function, not trends or simplistic ingredient labels.'],
  [BookOpen, 'Accessible', 'We translate technical ideas into language you can actually use when making choices.'],
  [Sparkles, 'Personalised direction', 'Hair Need is based on reported behaviour and current condition, not race, ethnicity or traditional hair type.'],
]

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        {/* Hero — deep green presence */}
        <section data-surface="deep" className="surface">
          <div className="shell grid items-center gap-16 py-20 lg:grid-cols-[1.05fr_.95fr] sm:py-28">
            <div>
              <p className="eyebrow">Conditioner Edition · V1</p>
              <span aria-hidden className="rule-gold mt-6" />
              <h1 className="display mt-8 max-w-3xl text-[3rem] leading-[1.02] sm:text-6xl lg:text-[4.75rem]">Formulate with a reason, not a recipe.</h1>
              <p className="muted mt-8 max-w-2xl text-[1.0625rem] leading-8">
                The Blend Bar is a guided formulation experience that helps you understand what your hair is communicating, learn how selected cosmetic ingredients behave, and build a conditioner with intention.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href="/signup">Enter The Blend Bar <ArrowRight className="h-4 w-4" /></Button>
                <Button href="#experience" variant="secondary">Explore the experience</Button>
              </div>
              <p className="eyebrow mt-8">No hair typing · No ethnicity-based assumptions · No one-size-fits-all formula</p>
            </div>

            <div className="border border-[var(--rule)] p-8" style={{ borderRadius: 'var(--radius)' }}>
              <div className="flex items-center justify-between">
                <span className="eyebrow">Your guided pathway</span>
                <FlaskConical aria-hidden className="h-5 w-5 text-[var(--gold)]" />
              </div>
              <p className="display mt-12 text-[2rem] leading-tight">Hair Need → Blend Brief → Conditioner</p>
              <ul className="mt-12 grid gap-px border-t border-[var(--rule)] sm:grid-cols-2">
                {['Hair Characteristics', 'Current Condition', 'Hair Need', 'Blend Brief'].map((item, i) => (
                  <li key={item} className="border-b border-[var(--rule)] py-4 sm:pr-6">
                    <span className="eyebrow">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-2 text-sm">{item}</p>
                  </li>
                ))}
              </ul>
              <p className="muted mt-10 flex gap-3 text-sm leading-6">
                <ShieldCheck aria-hidden className="h-5 w-5 shrink-0" />
                Your result explains the direction. Our internal methodology stays protected.
              </p>
            </div>
          </div>
        </section>

        {/* Experience — editorial breathing space */}
        <section id="experience" className="surface border-b border-[var(--rule)]">
          <div className="shell py-20 sm:py-28">
            <div className="max-w-2xl">
              <p className="eyebrow">The experience</p>
              <span aria-hidden className="rule-gold mt-5" />
              <h2 className="display mt-7 text-[2.25rem] leading-tight sm:text-[3rem]">More than a workshop. A smarter way to make choices.</h2>
            </div>
            <ol className="mt-16 grid gap-px border-t border-[var(--rule)] md:grid-cols-2">
              {steps.map(([number, title, description]) => (
                <li key={number} className="flex gap-6 border-b border-[var(--rule)] py-10 md:pr-12">
                  <span aria-hidden className="display text-2xl text-[var(--gold)]">{number}</span>
                  <div>
                    <h3 className="display text-xl">{title}</h3>
                    <p className="muted mt-3 leading-7">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Conditioner Edition — clean science surface */}
        <section id="conditioner" data-surface="clean" className="surface border-b border-[var(--rule)]">
          <div className="shell grid gap-16 py-20 lg:grid-cols-[.9fr_1.1fr] sm:py-28">
            <div>
              <p className="eyebrow">Conditioner Edition</p>
              <span aria-hidden className="rule-gold mt-5" />
              <h2 className="display mt-7 text-[2.25rem] leading-tight sm:text-[3rem]">Start with the base. Edit performance with purpose.</h2>
              <p className="muted mt-6 max-w-xl leading-8">
                The Performance Edit is deliberately focused. You will learn what each option contributes, where restraint matters, and why &ldquo;more&rdquo; is not automatically &ldquo;better&rdquo;.
              </p>
            </div>
            <ul className="grid gap-px border-t border-[var(--rule)] sm:grid-cols-2">
              {['D-Panthenol', 'Polyquaternium-7', 'Sodium PCA', 'Hydrolyzed Rice Protein', 'Silk Amino Acids'].map((item, i) => (
                <li key={item} className="border-b border-[var(--rule)] py-6 sm:pr-8">
                  <span className="eyebrow">Performance Edit {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display mt-2 text-lg">{item}</h3>
                  {i > 2 && <p className="muted mt-2 text-sm leading-6">Protein option · informed and optional, not automatically required.</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Approach */}
        <section id="science" className="surface">
          <div className="shell grid gap-px border-t border-[var(--rule)] py-20 lg:grid-cols-3 sm:py-24">
            {pillars.map(([Icon, title, description]) => (
              <div key={title} className="border-b border-[var(--rule)] py-10 lg:pr-12">
                <Icon aria-hidden className="h-6 w-6 text-[var(--green)]" />
                <h3 className="display mt-8 text-xl">{title}</h3>
                <p className="muted mt-3 leading-7">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Close */}
        <section data-surface="deep" className="surface">
          <div className="shell max-w-3xl py-20 text-center sm:py-28">
            <p className="eyebrow">Ready when you are</p>
            <span aria-hidden className="rule-gold mx-auto mt-6" />
            <h2 className="display mt-8 text-[2.25rem] leading-tight sm:text-[3rem]">Your conditioner should begin with understanding — not guessing.</h2>
            <div className="mt-10 flex justify-center">
              <Button href="/signup">Create My Blend Bar<ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

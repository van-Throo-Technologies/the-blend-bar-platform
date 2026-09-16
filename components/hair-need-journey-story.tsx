import { useRef, type MouseEvent } from 'react'
import Image from 'next/image'
import { ArrowRight, Check, Maximize2, X } from 'lucide-react'
import type { JourneyAnswers, JourneyStep } from '@/lib/assessment/journey'
import {
  BEYOND_THE_FIBRE,
  BREAKAGE_OR_SHEDDING,
  EMERGING_PATTERN_TITLE,
  THREE_WORDS,
  WHAT_THIS_MEANS,
  WIDER_LOOK,
  emergingPattern,
  whatThisMeans,
} from '@/lib/assessment/journey-story'
import { ActionBar, JourneyHeader, Screen, type HeadingRef } from '@/components/hair-need-journey-screens'

type StoryProps = {
  step: Extract<JourneyStep, { kind: 'story' }>
  answers: JourneyAnswers
  headingRef: HeadingRef
  onBack: () => void
  onContinue: () => void
}

const storyHeading = 'display text-[2.25rem] leading-[1.1] outline-none sm:text-[3rem]'
const storyBody = 'space-y-6 text-[1.0625rem] leading-8'

export function StoryScreen(props: StoryProps) {
  switch (props.step.story) {
    case 'breakage-or-shedding':
      return <TeachingScreen {...props} content={BREAKAGE_OR_SHEDDING} />
    case 'wider-look':
      return <TeachingScreen {...props} content={WIDER_LOOK} surface="deep" />
    case 'emerging-pattern':
      return <EmergingPatternScreen {...props} />
    case 'three-words':
      return <ThreeWordsScreen {...props} />
    case 'what-this-means':
      return <WhatThisMeansScreen {...props} />
    case 'beyond-the-fibre':
      return <TeachingScreen {...props} content={BEYOND_THE_FIBRE} />
  }
}

function ContinueButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="btn w-full sm:w-auto">{label}<ArrowRight aria-hidden className="h-5 w-5" /></button>
}

function TeachingScreen({ answers, headingRef, onBack, onContinue, content, surface }: StoryProps & {
  content: { eyebrow: string; title: string; body: readonly string[]; cta: string }
  surface?: 'deep'
}) {
  return (
    <Screen surface={surface}>
      <JourneyHeader answers={answers} onBack={onBack} />
      <p className="eyebrow">{content.eyebrow}</p>
      <span aria-hidden className="rule-gold mt-6" />
      <h2 ref={headingRef} tabIndex={-1} className={`${storyHeading} mt-8`}>{content.title}</h2>
      <div className={`muted mt-10 max-w-xl ${storyBody}`}>
        {content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <ActionBar><ContinueButton label={content.cta} onClick={onContinue} /></ActionBar>
    </Screen>
  )
}

function EmergingPatternScreen({ answers, headingRef, onBack, onContinue }: StoryProps) {
  const pattern = emergingPattern(answers)
  return (
    <Screen surface="deep">
      <JourneyHeader answers={answers} onBack={onBack} />
      <span aria-hidden className="rule-gold" />
      <h2 ref={headingRef} tabIndex={-1} className={`${storyHeading} mt-8`}>{EMERGING_PATTERN_TITLE}</h2>
      <div className={`muted mt-10 max-w-xl ${storyBody}`}>
        {pattern.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {pattern.closing.length > 0 && (
        <div className="display mt-12 max-w-xl space-y-2 border-l border-[var(--gold)] pl-6 text-xl leading-8 sm:text-2xl sm:leading-9">
          {pattern.closing.map((line) => <p key={line}>{line}</p>)}
        </div>
      )}
      {pattern.explore.length > 0 && <ObservationAreas title="Worth a closer look" items={pattern.explore} />}
      {pattern.working.length > 0 && <ObservationAreas title="What appears to be working" items={pattern.working} working />}
      <ActionBar><ContinueButton label="Continue" onClick={onContinue} /></ActionBar>
    </Screen>
  )
}

function ObservationAreas({ title, items, working = false }: { title: string; items: readonly { area: string; note: string }[]; working?: boolean }) {
  return (
    <div className="mt-14">
      <h3 className="eyebrow">{title}</h3>
      <ul className="mt-5 grid gap-px border-t border-[var(--rule)] sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.area} className="border-b border-[var(--rule)] py-6 sm:pr-8">
            <p className="display flex items-center gap-3 text-xl leading-snug">
              {working
                ? <Check aria-hidden className="h-4 w-4 shrink-0 text-[var(--mark)]" />
                : <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-[var(--gold)]" />}
              {item.area}
            </p>
            <p className="muted mt-2 text-sm leading-6">{item.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ThreeWordsScreen({ answers, headingRef, onBack, onContinue }: StoryProps) {
  return (
    <Screen>
      <JourneyHeader answers={answers} onBack={onBack} />
      <span aria-hidden className="rule-gold" />
      <h2 ref={headingRef} tabIndex={-1} className={`${storyHeading} mt-8`}>{THREE_WORDS.title}</h2>
      <p className="muted mt-8 max-w-xl text-[1.0625rem] leading-8">{THREE_WORDS.intro}</p>

      <div className="mt-14 border-t border-[var(--rule)]">
        {THREE_WORDS.words.map(({ word, think, body }) => (
          <article key={word} className="border-b border-[var(--rule)] py-10">
            <h3 className="eyebrow">{word}</h3>
            <p className="display mt-4 text-2xl leading-snug">
              <span className="muted italic">Think:</span> {think}
            </p>
            <div className="muted mt-5 max-w-xl space-y-4 leading-7">
              {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 border-l border-[var(--gold)] pl-6">
        <p className="display text-xl leading-8 sm:text-2xl sm:leading-9">{THREE_WORDS.overlap[0]}</p>
        <p className="muted mt-4 max-w-xl leading-7">{THREE_WORDS.overlap[1]}</p>
      </div>

      <ScienceVisual />

      <ActionBar><ContinueButton label={THREE_WORDS.cta} onClick={onContinue} /></ActionBar>
    </Screen>
  )
}

/** Presented as an editorial science plate: a white mat, a hairline frame and a set caption. */
function ScienceVisual() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { src, width, height, alt, caption } = THREE_WORDS.visual

  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()
  function closeOnEmptySpace(event: MouseEvent<HTMLElement>) {
    if (event.target === event.currentTarget) close()
  }

  return (
    <figure className="mt-16 lg:-mx-28">
      {/* Keyboard and screen-reader users open the larger view with the button below. */}
      <div onClick={open} className="cursor-zoom-in border border-[var(--rule)] bg-[var(--white)] p-3 sm:p-5" style={{ borderRadius: 'var(--radius)' }}>
        <Image src={src} width={width} height={height} alt={alt} sizes="(min-width: 1024px) 900px, (min-width: 640px) 672px, calc(100vw - 40px)" className="block h-auto w-full" />
      </div>
      <figcaption className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:px-28">
        <span className="muted max-w-md text-sm leading-6">
          <span aria-hidden className="mr-3 inline-block h-px w-6 align-middle bg-[var(--gold)]" />
          {caption}
        </span>
        <button type="button" onClick={open} aria-haspopup="dialog" className="btn-ghost btn-small shrink-0 self-start sm:self-auto">
          <Maximize2 aria-hidden className="h-4 w-4" />
          View larger
        </button>
      </figcaption>

      {/* Native modal dialog: traps focus, closes on Escape and returns focus to the opener. */}
      {/* Solid dark surface rather than a translucent backdrop, so contrast is explicit. */}
      <dialog ref={dialogRef} data-surface="deep" aria-label="Enlarged illustration" onClick={closeOnEmptySpace} className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-[var(--charcoal)] p-0 text-[var(--ivory)] backdrop:bg-[var(--charcoal)] open:flex open:flex-col">
        <div onClick={closeOnEmptySpace} className="flex shrink-0 items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
          <p className="text-sm leading-5 text-[var(--ivory)] sm:hidden">Scroll or pinch to explore the details.</p>
          <button type="button" onClick={close} className="btn btn-small ml-auto shrink-0">
            <X aria-hidden className="h-4 w-4" />
            Close
          </button>
        </div>
        <div onClick={closeOnEmptySpace} className="min-h-0 flex-1 overflow-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:grid sm:place-items-center">
          {/* Unoptimised so the infographic's fine text stays crisp. On phones it opens wider than the screen to pan. */}
          <Image src={src} width={width} height={height} alt={alt} unoptimized className="block h-auto w-[200vw] max-w-none bg-[var(--white)] sm:max-h-[calc(100dvh-7rem)] sm:w-auto sm:max-w-full" />
        </div>
      </dialog>
    </figure>
  )
}

function WhatThisMeansScreen({ answers, headingRef, onBack, onContinue }: StoryProps) {
  return (
    <Screen>
      <JourneyHeader answers={answers} onBack={onBack} />
      <span aria-hidden className="rule-gold" />
      <h2 ref={headingRef} tabIndex={-1} className={`${storyHeading} mt-8`}>{WHAT_THIS_MEANS.title}</h2>
      <div className={`muted mt-10 max-w-xl ${storyBody}`}>
        {whatThisMeans(answers).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>

      <div className="mt-16 border-t border-[var(--rule)] pt-14">
        <p className="display max-w-xl text-xl italic leading-8 sm:text-2xl sm:leading-9">{WHAT_THIS_MEANS.turn}</p>
        <h3 className="display mt-8 text-[2.25rem] leading-none sm:text-[3.5rem]">{WHAT_THIS_MEANS.heading}</h3>
        <div className={`muted mt-8 max-w-xl ${storyBody}`}>
          {WHAT_THIS_MEANS.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>

      <ActionBar><ContinueButton label={WHAT_THIS_MEANS.cta} onClick={onContinue} /></ActionBar>
    </Screen>
  )
}

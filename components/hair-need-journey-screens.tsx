import { useState, type ReactNode, type Ref } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, FlaskConical, Loader2 } from 'lucide-react'
import {
  QUESTIONS,
  activeQuestionSteps,
  answerLabel,
  bridgeParagraphs,
  isValidAnswer,
  type ActiveAnswerKey,
  type JourneyAnswerValue,
  type JourneyAnswers,
  type JourneyQuestion,
  type JourneyStep,
} from '@/lib/assessment/journey'

export type HeadingRef = Ref<HTMLHeadingElement>
type StepOf<K extends JourneyStep['kind']> = Extract<JourneyStep, { kind: K }>

/** Whole-person context, kept visually and conceptually apart from the fibre observations. */
const WIDER_CONTEXT_KEYS: readonly ActiveAnswerKey[] = ['fluidIntake', 'stress', 'sleep']

/**
 * Every screen is a full-width colour block. `surface` flips the token set, so text,
 * rules, focus rings and buttons stay legible without any per-element colour.
 */
export function Screen({ surface, children }: { surface?: 'deep' | 'clean'; children: ReactNode }) {
  return (
    <section data-surface={surface} className="surface min-h-[calc(100svh-5rem)]">
      <div className="shell max-w-2xl py-12 sm:py-20">{children}</div>
    </section>
  )
}

export function ActionBar({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-14 border-t border-[var(--rule)] bg-[var(--surface)] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
      {children}
      {hint}
    </div>
  )
}

/** Back navigation and a quiet progress line. No chapters, counts or clue labels. */
export function JourneyHeader({ answers, onBack, backLabel = 'Back' }: { answers: JourneyAnswers; onBack: () => void; backLabel?: string }) {
  const steps = activeQuestionSteps(answers)
  const observed = steps.filter((step) => isValidAnswer(step.key, answers[step.key])).length
  return (
    <div className="mb-12 sm:mb-16">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="link-quiet focus-ring -ml-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {backLabel}
        </button>
        <p className="eyebrow text-right">Your Hair Need Journey</p>
      </div>
      <div aria-hidden className="mt-5 h-px w-full bg-[var(--rule)]">
        <div className="h-px bg-[var(--mark)] transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${steps.length === 0 ? 0 : (observed / steps.length) * 100}%` }} />
      </div>
    </div>
  )
}

export function JourneySkeleton() {
  return (
    <Screen surface="deep">
      <div role="status" className="min-h-[50vh] animate-pulse motion-reduce:animate-none">
        <span className="sr-only">Loading your Hair Need Journey</span>
        <div className="h-3 w-32 bg-[var(--rule)]" />
        <div className="mt-8 h-14 w-full max-w-md bg-[var(--rule)]" />
        <div className="mt-6 h-6 w-3/4 max-w-sm bg-[var(--rule)]" />
      </div>
    </Screen>
  )
}

export function IntroScreen({ headingRef, hasSavedProgress, onBegin, onResume, onStartAgain }: {
  headingRef: HeadingRef
  hasSavedProgress: boolean
  onBegin: () => void
  onResume: () => void
  onStartAgain: () => void
}) {
  const [confirmingRestart, setConfirmingRestart] = useState(false)
  return (
    <Screen surface="deep">
      <p className="eyebrow">The Blend Bar</p>
      <span aria-hidden className="rule-gold mt-6" />
      <h1 ref={headingRef} tabIndex={-1} className="display mt-8 text-[2.75rem] leading-[1.02] outline-none sm:text-[4.25rem]">
        Your Hair Need Journey
      </h1>

      <div className="mt-12 max-w-xl space-y-7 text-[1.0625rem] leading-8">
        <p className="display text-2xl leading-snug sm:text-[1.875rem]">Your hair is already giving you information.</p>
        <p className="display border-l border-[var(--gold)] pl-6 text-xl italic leading-9">
          <span className="block">In the way it feels.</span>
          <span className="block">In how easily the strands move past one another.</span>
          <span className="block">In how it holds up to everyday handling.</span>
        </p>
        <p className="muted">Most of us were simply never taught how to read those clues.</p>
        <p className="font-semibold">Let&apos;s change that.</p>
        <p className="muted">
          Over the next few minutes, we&apos;ll look at what your hair has been showing you — and gradually translate those observations into something you can use when you formulate your conditioner at The Blend Bar.
        </p>
        <p className="display text-xl leading-9">
          <span className="block">No hair typing.</span>
          <span className="block">No guessing what your hair &ldquo;should&rdquo; need.</span>
        </p>
        <p className="muted">Just your hair, as it behaves today.</p>
      </div>

      {hasSavedProgress && (
        <div className="plate mt-12 p-6">
          {confirmingRestart ? (
            <>
              <p className="font-semibold">Start again from the beginning?</p>
              <p className="muted mt-2 text-sm leading-6">This clears the answers saved on this device.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={onStartAgain} className="btn-ghost btn-small">Yes, start again</button>
                <button type="button" onClick={() => setConfirmingRestart(false)} className="link-quiet focus-ring min-h-11 text-sm font-semibold underline underline-offset-4">Keep my answers</button>
              </div>
            </>
          ) : (
            <>
              <p className="font-semibold">Welcome back.</p>
              <p className="muted mt-2 text-sm leading-6">You&apos;ve already started your Hair Need Journey. Your answers are saved on this device, so you can pick up where you left off.</p>
              <button type="button" onClick={() => setConfirmingRestart(true)} className="link-quiet focus-ring mt-3 min-h-11 text-sm font-semibold underline underline-offset-4">Start again instead</button>
            </>
          )}
        </div>
      )}

      <p className="muted mt-12 max-w-xl text-xs leading-5">
        The Hair Need Journey is educational guidance to prepare you for your workshop — not a medical diagnosis. Sudden shedding, scalp pain or irritation deserve a conversation with a medical professional.
      </p>

      <ActionBar>
        {hasSavedProgress
          ? <button type="button" onClick={onResume} className="btn w-full sm:w-auto">Continue my Hair Need Journey<ArrowRight aria-hidden className="h-5 w-5" /></button>
          : <button type="button" onClick={onBegin} className="btn w-full sm:w-auto">Begin my Hair Need Journey<ArrowRight aria-hidden className="h-5 w-5" /></button>}
      </ActionBar>
    </Screen>
  )
}

export function QuestionScreen({ step, answers, headingRef, returnToReview, onAnswer, onBack, onContinue }: {
  step: StepOf<'question'>
  answers: JourneyAnswers
  headingRef: HeadingRef
  returnToReview: boolean
  onAnswer: (key: ActiveAnswerKey, value: JourneyAnswerValue) => void
  onBack: () => void
  onContinue: () => void
}) {
  const question: JourneyQuestion = QUESTIONS[step.key]
  const answered = isValidAnswer(step.key, answers[step.key])
  const opening = bridgeParagraphs(question, answers) ?? (question.lead ? [question.lead] : [])
  const openingId = `${step.key}-opening`
  const experimentId = `${step.key}-experiment`
  const hintId = `${step.key}-hint`
  const experiment = question.kind === 'single' ? question.experiment : undefined
  const describedBy = [opening.length > 0 && openingId, experiment && experimentId].filter(Boolean).join(' ') || undefined

  const selected = answers[step.key]
  const selectedValues: string[] = Array.isArray(selected) ? selected : []

  function toggleMulti(value: string) {
    if (question.kind !== 'multi') return
    const exclusive: readonly string[] = question.exclusive
    const isExclusive = exclusive.includes(value)
    if (isExclusive) {
      onAnswer(question.key, selectedValues.includes(value) ? [] : [value])
      return
    }
    const withoutExclusive = selectedValues.filter((entry) => !exclusive.includes(entry))
    onAnswer(question.key, withoutExclusive.includes(value)
      ? withoutExclusive.filter((entry) => entry !== value)
      : [...withoutExclusive, value])
  }

  return (
    <Screen>
      <JourneyHeader answers={answers} onBack={onBack} backLabel={returnToReview ? 'Back to summary' : 'Back'} />
      <form onSubmit={(event) => { event.preventDefault(); onContinue() }}>
        {/* Storytelling stays serif; the question itself is precise sans. */}
        {opening.length > 0 && (
          <>
            <div id={openingId} className="display space-y-4 text-xl italic leading-8 sm:text-[1.375rem] sm:leading-9">
              {opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <span aria-hidden className="rule-gold mt-9" />
          </>
        )}
        {experiment && (
          <div id={experimentId} className="mt-9 border-l border-[var(--gold)] pl-6">
            <p className="eyebrow flex items-center gap-2"><FlaskConical aria-hidden className="h-4 w-4 text-[var(--gold)]" />{experiment.title}</p>
            <p className="mt-3 text-lg leading-7">{experiment.instruction}</p>
            {experiment.note && <p className="muted mt-3 text-sm leading-6">{experiment.note}</p>}
          </div>
        )}

        <fieldset aria-describedby={describedBy} className={opening.length > 0 || experiment ? 'mt-10' : ''}>
          <legend className="w-full">
            <h2 ref={headingRef} tabIndex={-1} className="text-[1.5rem] font-semibold leading-[1.3] tracking-[-.01em] outline-none sm:text-[1.75rem]">{question.prompt}</h2>
            {question.kind === 'multi' && <span className="muted mt-3 block text-sm leading-6">{question.help}</span>}
          </legend>
          <div className="mt-8 grid gap-2.5">
            {question.options.map((option) => {
              const id = `${step.key}-${option.value}`
              const isMulti = question.kind === 'multi'
              return (
                <label key={option.value} htmlFor={id} className="option">
                  <input
                    id={id}
                    type={isMulti ? 'checkbox' : 'radio'}
                    name={step.key}
                    value={option.value}
                    checked={isMulti ? selectedValues.includes(option.value) : selected === option.value}
                    onChange={() => (isMulti ? toggleMulti(option.value) : onAnswer(step.key, option.value))}
                    className={`mt-0.5 h-5 w-5 shrink-0 cursor-pointer appearance-none border border-[var(--control-border)] bg-[var(--surface)] transition-[border-width,background-color] focus:outline-none ${isMulti ? 'checked:border-[var(--mark)] checked:bg-[var(--mark)]' : 'rounded-full checked:border-[5px] checked:border-[var(--mark)]'}`}
                    style={{ borderRadius: isMulti ? 'var(--radius)' : undefined }}
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold leading-6">{option.label}</span>
                    {option.detail && <span className="muted mt-1 block text-sm leading-6">{option.detail}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {question.note && <p className="muted mt-9 border-l border-[var(--gold)] pl-6 text-[15px] leading-7">{question.note}</p>}

        <ActionBar hint={!answered && <p id={hintId} className="muted mt-3 text-center text-sm sm:text-left">{question.kind === 'multi' ? 'Choose at least one to continue.' : 'Choose the answer closest to your experience to continue.'}</p>}>
          <button type="submit" disabled={!answered} aria-describedby={!answered ? hintId : undefined} className="btn w-full sm:w-auto">
            {returnToReview ? 'Save and return to summary' : 'Continue'}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        </ActionBar>
      </form>
    </Screen>
  )
}

export function ReviewScreen({ answers, headingRef, submitting, error, onBack, onEdit, onSubmit }: {
  answers: JourneyAnswers
  headingRef: HeadingRef
  submitting: boolean
  error: string
  onBack: () => void
  onEdit: (key: ActiveAnswerKey) => void
  onSubmit: () => void
}) {
  const steps = activeQuestionSteps(answers)
  const groups: { title: string; keys: ActiveAnswerKey[] }[] = [
    { title: 'What your hair has shown us', keys: steps.map((s) => s.key).filter((key) => !WIDER_CONTEXT_KEYS.includes(key)) },
    { title: 'Wider context — not part of your Hair Need', keys: steps.map((s) => s.key).filter((key) => WIDER_CONTEXT_KEYS.includes(key)) },
  ]
  return (
    <Screen surface="deep">
      <JourneyHeader answers={answers} onBack={onBack} />
      <p className="eyebrow">Everything gathered</p>
      <span aria-hidden className="rule-gold mt-6" />
      <h2 ref={headingRef} tabIndex={-1} className="display mt-8 text-[2.25rem] leading-[1.1] outline-none sm:text-[3rem]">Your observations are ready to be read together.</h2>
      <p className="muted mt-8 max-w-xl text-[1.0625rem] leading-8">
        On its own, each observation tells us only a little. Read together, they show us where your hair may need support — and where it is already doing well.
      </p>
      <blockquote className="display mt-10 max-w-xl border-l border-[var(--gold)] pl-6 text-xl leading-snug sm:text-2xl">
        Your hair is not failing. It is responding logically to the conditions it has been given.
      </blockquote>

      <details className="group plate mt-12 px-6 py-4">
        <summary className="focus-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
          Review or change your answers
          <ChevronDown aria-hidden className="h-5 w-5 shrink-0 transition group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="mt-4 space-y-8 pb-2">
          {groups.filter((group) => group.keys.length > 0).map((group) => (
            <div key={group.title}>
              <h3 className="eyebrow">{group.title}</h3>
              <ul className="mt-3 divide-y divide-[var(--rule)] border-t border-[var(--rule)]">
                {group.keys.map((key) => (
                  <li key={key} className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="muted text-sm">{QUESTIONS[key].reviewLabel}</p>
                      <p className="mt-1 font-medium leading-6">{answerLabel(key, answers) ?? 'Not answered yet'}</p>
                    </div>
                    <button type="button" onClick={() => onEdit(key)} className="focus-ring link-quiet min-h-11 shrink-0 text-sm font-semibold underline underline-offset-4">
                      Change<span className="sr-only"> your answer about {QUESTIONS[key].reviewLabel.toLowerCase()}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <p className="muted mt-10 max-w-xl text-sm leading-6">When you&apos;re ready, we&apos;ll read everything together and prepare your Hair Need and Blend Brief.</p>
      {error && <div role="alert" className="mt-5 border-l-2 border-[var(--gold)] bg-[var(--surface-raised)] p-5 text-sm leading-6">{error}</div>}

      <ActionBar>
        <button type="button" onClick={onSubmit} disabled={submitting} className="btn w-full sm:w-auto">
          {submitting
            ? <><Loader2 aria-hidden className="h-5 w-5 animate-spin motion-reduce:animate-none" />Reading your observations together…</>
            : <>Reveal my Hair Need<ArrowRight aria-hidden className="h-5 w-5" /></>}
        </button>
      </ActionBar>
      <p aria-live="polite" className="sr-only">{submitting ? 'Reading your observations together. Please wait.' : ''}</p>
    </Screen>
  )
}

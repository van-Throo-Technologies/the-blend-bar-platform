'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import {
  JOURNEY_STEPS,
  REVIEW_STEP_INDEX,
  activeAnswers,
  adjacentStepIndex,
  furthestReachableStep,
  isJourneyComplete,
  isStepActive,
  isValidAnswer,
  sanitizeAnswers,
  stepIndexOf,
  type ActiveAnswerKey,
  type JourneyAnswerValue,
  type JourneyAnswers,
} from '@/lib/assessment/journey'
import { clearJourneyDraft, loadJourneyDraft, saveJourneyDraft } from '@/lib/assessment/journey-draft'
import { IntroScreen, JourneySkeleton, QuestionScreen, ReviewScreen } from '@/components/hair-need-journey-screens'
import { StoryScreen } from '@/components/hair-need-journey-story'

/** A recently active journey (e.g. a page refresh) resumes in place; an older one is offered from the intro. */
const RESUME_IN_PLACE_MS = 2 * 60 * 60 * 1000

const subscribeToNothing = () => () => {}

export function HairNeedJourney({ userId }: { userId: string }) {
  // Saved progress lives in localStorage, so the journey mounts once the browser has hydrated.
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false)
  return isClient ? <Journey userId={userId} /> : <JourneySkeleton />
}

type RestoredJourney = { answers: JourneyAnswers; stepIndex: number; resumeIndex: number | null }

function restoreJourney(userId: string): RestoredJourney {
  const draft = loadJourneyDraft(userId)
  if (!draft) return { answers: {}, stepIndex: 0, resumeIndex: null }
  const saved = stepIndexOf(draft.stepId)
  const reachable = furthestReachableStep(draft.answers)
  // Never resume past an unanswered question, or onto a step this participant's answers switched off.
  let target = Math.min(saved === -1 ? reachable : saved, reachable)
  if (target > 0 && !isStepActive(JOURNEY_STEPS[target], draft.answers)) target = reachable
  const hasAnswers = Object.keys(draft.answers).length > 0
  if (target <= 0) return { answers: draft.answers, stepIndex: 0, resumeIndex: hasAnswers ? 1 : null }
  if (Date.now() - draft.updatedAt < RESUME_IN_PLACE_MS) return { answers: draft.answers, stepIndex: target, resumeIndex: null }
  return { answers: draft.answers, stepIndex: 0, resumeIndex: target }
}

function Journey({ userId }: { userId: string }) {
  const router = useRouter()
  const [initial] = useState(() => restoreJourney(userId))
  const [answers, setAnswers] = useState<JourneyAnswers>(initial.answers)
  const [stepIndex, setStepIndex] = useState(initial.stepIndex)
  const [resumeIndex, setResumeIndex] = useState(initial.resumeIndex)
  const [returnToReview, setReturnToReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const navigated = useRef(false)
  const submitted = useRef(false)

  const step = JOURNEY_STEPS[stepIndex]

  useEffect(() => {
    if (submitted.current) return
    // While a resume offer is showing on the intro, keep the saved position rather than overwriting it.
    const position = stepIndex === 0 && resumeIndex !== null ? resumeIndex : stepIndex
    if (position === 0 && Object.keys(answers).length === 0) return
    saveJourneyDraft(userId, { answers, stepId: JOURNEY_STEPS[position].id })
  }, [userId, answers, stepIndex, resumeIndex])

  useEffect(() => {
    if (!navigated.current) return
    navigated.current = false
    // Start each screen at the top and move focus to its heading for keyboard and screen-reader users.
    window.scrollTo({ top: 0, behavior: 'instant' })
    headingRef.current?.focus({ preventScroll: true })
  }, [stepIndex])

  function goTo(index: number) {
    navigated.current = true
    setError('')
    setStepIndex(index)
  }

  function next() {
    if (step.kind === 'question' && !isValidAnswer(step.key, answers[step.key])) return
    if (step.kind === 'question' && returnToReview) {
      setReturnToReview(false)
      goTo(REVIEW_STEP_INDEX)
      return
    }
    goTo(adjacentStepIndex(stepIndex, answers, 1))
  }

  function back() {
    if (returnToReview) {
      setReturnToReview(false)
      goTo(REVIEW_STEP_INDEX)
      return
    }
    goTo(adjacentStepIndex(stepIndex, answers, -1))
  }

  function answer(key: ActiveAnswerKey, value: JourneyAnswerValue) {
    setAnswers((previous) => sanitizeAnswers({ ...previous, [key]: value }))
  }

  function begin() {
    setResumeIndex(null)
    goTo(adjacentStepIndex(0, answers, 1))
  }

  function resume() {
    if (resumeIndex === null) return
    setResumeIndex(null)
    goTo(resumeIndex)
  }

  function startAgain() {
    clearJourneyDraft(userId)
    setAnswers({})
    setResumeIndex(null)
    setReturnToReview(false)
    goTo(adjacentStepIndex(0, {}, 1))
  }

  function editAnswer(key: ActiveAnswerKey) {
    setReturnToReview(true)
    goTo(stepIndexOf(`q:${key}`))
  }

  async function submit() {
    if (submitting) return
    if (!isJourneyComplete(answers)) {
      goTo(furthestReachableStep(answers))
      return
    }
    setSubmitting(true)
    setError('')
    try {
      // Only the answers that apply to this participant are sent; steps their answers
      // switched off are never submitted.
      const response = await fetch('/api/assessment', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(activeAnswers(answers)) })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setError(response.status === 401
          ? 'Your session has ended. Please sign in again — your answers are still saved on this device.'
          : body.error || 'We could not save your assessment. Please try again.')
        setSubmitting(false)
        return
      }
      submitted.current = true
      clearJourneyDraft(userId)
      router.push('/my-blend-bar/results')
      router.refresh()
    } catch {
      setError("We couldn't reach the server. Check your connection and try again — your answers are still saved on this device.")
      setSubmitting(false)
    }
  }

  switch (step.kind) {
    case 'intro':
      return <IntroScreen headingRef={headingRef} hasSavedProgress={resumeIndex !== null} onBegin={begin} onResume={resume} onStartAgain={startAgain} />
    case 'story':
      return <StoryScreen step={step} answers={answers} headingRef={headingRef} onBack={back} onContinue={next} />
    case 'question':
      return <QuestionScreen step={step} answers={answers} headingRef={headingRef} returnToReview={returnToReview} onAnswer={answer} onBack={back} onContinue={next} />
    case 'review':
      return <ReviewScreen answers={answers} headingRef={headingRef} submitting={submitting} error={error} onBack={back} onEdit={editAnswer} onSubmit={submit} />
  }
}

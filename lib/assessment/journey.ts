import type { ActiveAnswerKey, AssessmentInput } from './schema'
import { ACTIVE_ANSWER_KEYS } from './schema'

/**
 * HAIR NEED JOURNEY — participant-facing content and sequencing.
 *
 * CLIENT-SAFE BY DESIGN. Copy, ordering and the answer values already defined by the
 * server contract in ./schema.ts. Never scoring, weights, thresholds or interpretation
 * rules — those stay in the server-only ./engine.ts.
 *
 * The journey reads as one continuous story: no chapters, no counts, no clue taxonomy.
 */

export type { ActiveAnswerKey }
export type JourneyAnswers = Partial<Pick<AssessmentInput, ActiveAnswerKey>>
export type JourneyAnswerValue = string | string[]

type SingleKey = Exclude<ActiveAnswerKey, 'presentingConcerns'>
type SingleValue<K extends SingleKey> = NonNullable<AssessmentInput[K]>
export type ConcernValue = AssessmentInput['presentingConcerns'][number]

export type JourneyOption<V extends string = string> = { value: V; label: string; detail?: string }

/** Narrative shown above a question, chosen by the participant's answer to an earlier question. */
export type JourneyBridge = {
  [K in SingleKey]: { from: K; byAnswer: { readonly [V in SingleValue<K>]: readonly string[] } }
}[SingleKey]

export type SingleQuestion<K extends SingleKey = SingleKey> = {
  kind: 'single'
  key: K
  /** Plain-language label for the answer review. */
  reviewLabel: string
  lead?: string
  bridge?: JourneyBridge
  prompt: string
  experiment?: { title: string; instruction: string; note?: string }
  options: readonly JourneyOption<SingleValue<K>>[]
  /** Short educational note. Used sparingly, never as a repeating box. */
  note?: string
}

export type MultiQuestion = {
  kind: 'multi'
  key: 'presentingConcerns'
  reviewLabel: string
  lead?: string
  prompt: string
  help: string
  options: readonly JourneyOption<ConcernValue>[]
  /** Choosing one of these clears every other selection. */
  exclusive: readonly ConcernValue[]
  note?: string
}

export type JourneyQuestion = SingleQuestion | MultiQuestion
type QuestionMap = { presentingConcerns: MultiQuestion } & { [K in SingleKey]: SingleQuestion<K> }

export const QUESTIONS: QuestionMap = {
  presentingConcerns: {
    kind: 'multi',
    key: 'presentingConcerns',
    reviewLabel: "What you've been noticing",
    lead: "Before we look at anything closely, let's start with you.",
    prompt: 'What have you been noticing about your hair lately?',
    help: 'Choose as many as apply.',
    options: [
      { value: 'dryness', label: 'Dryness or roughness' },
      { value: 'breakage', label: 'Breakage, or difficulty keeping length' },
      { value: 'tangling', label: 'Tangling or friction' },
      { value: 'weighed-down', label: 'It feels easily weighed down, or lacks body' },
      { value: 'shedding', label: 'Increased shedding or hair loss' },
      { value: 'not-itself', label: "It just doesn't feel like it usually does" },
      { value: 'nothing', label: 'Nothing in particular', detail: 'I want to understand my hair better' },
      { value: 'other', label: 'Something else' },
    ],
    exclusive: ['nothing'],
  },
  lossPattern: {
    kind: 'single',
    key: 'lossPattern',
    reviewLabel: 'Broken pieces or shed hairs',
    prompt: "Which is closer to what you're seeing?",
    options: [
      { value: 'breakage', label: 'Mostly shorter broken pieces' },
      { value: 'shedding', label: 'Mostly full-length shed hairs' },
      { value: 'both', label: 'Both' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  dryness: {
    kind: 'single',
    key: 'dryness',
    reviewLabel: 'How your hair feels',
    lead: "Let's start with how your hair feels day to day.",
    prompt: 'When you run your fingers through your hair or handle it, how does it generally feel?',
    options: [
      { value: 'low', label: 'Comfortable', detail: 'It generally feels soft and comfortable.' },
      { value: 'moderate', label: 'A little dry or rough', detail: 'I notice some dryness or roughness at times.' },
      { value: 'high', label: 'Dry or rough most of the time', detail: 'Dryness or roughness is one of the first things I notice.' },
    ],
  },
  tangling: {
    kind: 'single',
    key: 'tangling',
    reviewLabel: 'How the strands move',
    bridge: {
      from: 'dryness',
      byAnswer: {
        high: [
          'Dryness is one of the things your hair is asking you to notice.',
          "That's useful information. But ‘dry’ describes what you're experiencing — it doesn't yet tell us why it's happening or what your formulation should do about it.",
          "So let's look at something else the fibre does.",
        ],
        moderate: [
          'Your hair seems to lose some of its comfortable feel at times.',
          'How much that matters depends partly on what else the fibre is doing.',
        ],
        low: [
          'Your hair seems to hold on to its comfortable feel fairly well.',
          "That's useful too. A Hair Need Journey isn't only about finding problems — it's also about understanding what's already working.",
        ],
      },
    },
    prompt: 'When you handle your hair, how easily do the strands move against one another?',
    options: [
      { value: 'low', label: 'They move easily', detail: 'Very little catching or tangling.' },
      { value: 'moderate', label: 'They catch sometimes', detail: 'Some tangling or catching from time to time.' },
      { value: 'high', label: 'They catch a lot', detail: 'Tangling or friction slows me down.' },
    ],
  },
  breakage: {
    kind: 'single',
    key: 'breakage',
    reviewLabel: 'Short broken pieces',
    bridge: {
      from: 'tangling',
      byAnswer: {
        high: [
          'So the strands are catching on one another more than you would like.',
          "That's another piece of the story.",
          'Now let us look at the fibre itself.',
        ],
        moderate: [
          'So there is some friction between the strands, but it is not taking over.',
          'Now let us look at the fibre itself.',
        ],
        low: [
          'So the strands are moving past one another without much trouble.',
          'Now let us look at the fibre itself.',
        ],
      },
    },
    prompt: 'How often do you notice short broken pieces of hair?',
    options: [
      { value: 'rare', label: 'Rarely', detail: "I don't often see short pieces." },
      { value: 'sometimes', label: 'Sometimes', detail: 'A few now and then.' },
      { value: 'frequent', label: 'Often', detail: 'I see them most times I handle my hair.' },
    ],
    note: 'We are asking about the fibre breaking along its length, rather than full-length hairs released from the scalp.',
  },
  elasticity: {
    kind: 'single',
    key: 'elasticity',
    reviewLabel: 'How the fibre responds to gentle tension',
    experiment: {
      title: 'A gentle mini experiment',
      instruction: "When your hair is wet, take a small section and very gently apply tension. Don't pull hard.",
      note: "Hair not wet right now? Choose “I'm not sure” — that's a perfectly useful answer.",
    },
    prompt: 'What do you notice?',
    options: [
      { value: 'balanced', label: 'It gives slightly, then returns' },
      { value: 'stretches', label: 'It stretches considerably', detail: "Before returning, or it doesn't readily return" },
      { value: 'snaps', label: 'It breaks or snaps with very little tension' },
      { value: 'unsure', label: "I'm not sure", detail: "Or I can't test this right now" },
    ],
  },
  strandFeel: {
    kind: 'single',
    key: 'strandFeel',
    reviewLabel: 'Strand feel',
    lead: "This one isn't about a problem. It simply helps us understand how to formulate for your hair.",
    prompt: 'Take a single strand between your fingers. How does it feel?',
    options: [
      { value: 'fine', label: 'Fine or delicate', detail: 'I can barely feel it.' },
      { value: 'medium', label: 'Medium', detail: 'Noticeable, but not especially thick.' },
      { value: 'substantial', label: 'Substantial', detail: 'I can clearly feel it between my fingers.' },
      { value: 'mixed', label: 'Mixed', detail: 'It varies across my head.' },
    ],
    note: 'Strand feel is a characteristic rather than a problem to solve. It shapes how we formulate, not whether your hair needs support.',
  },
  chemicalOrHeatStress: {
    kind: 'single',
    key: 'chemicalOrHeatStress',
    reviewLabel: 'Colour, chemical or heat exposure',
    lead: 'One more piece of context.',
    prompt: 'How often is your hair exposed to colour, bleach, relaxers, perms or significant heat styling?',
    options: [
      { value: 'none', label: 'Rarely or never' },
      { value: 'occasional', label: 'Occasionally', detail: 'Now and then.' },
      { value: 'regular', label: 'Regularly', detail: "It's a consistent part of my routine." },
    ],
    note: 'Exposure on its own does not mean damage. It simply helps us interpret what the fibre is already showing us, with no judgement about your choices.',
  },
  fluidIntake: {
    kind: 'single',
    key: 'fluidIntake',
    reviewLabel: 'Fluid intake',
    prompt: 'Thinking about a typical day, how regularly are you drinking fluids such as water or unsweetened tea?',
    options: [
      { value: 'regular', label: 'Regularly throughout the day' },
      { value: 'inconsistent', label: 'Some, but probably not consistently' },
      { value: 'low', label: 'Very little', detail: "I often realise I haven't drunk much." },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  stress: {
    kind: 'single',
    key: 'stress',
    reviewLabel: 'Stress lately',
    prompt: 'Has stress been noticeably higher than usual for you recently?',
    options: [
      { value: 'higher', label: 'Yes, higher than usual' },
      { value: 'similar', label: 'About the same as usual' },
      { value: 'lower', label: 'Lower than usual' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  sleep: {
    kind: 'single',
    key: 'sleep',
    reviewLabel: 'Restorative sleep',
    prompt: 'Have you been getting enough restorative sleep for you lately?',
    options: [
      { value: 'enough', label: 'Generally, yes' },
      { value: 'mixed', label: 'Some nights, not others' },
      { value: 'not-enough', label: 'Often not enough' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
}

export type JourneyStoryId = 'breakage-or-shedding' | 'wider-look' | 'emerging-pattern' | 'three-words' | 'what-this-means' | 'beyond-the-fibre'

type StepCondition = (answers: JourneyAnswers) => boolean

export type JourneyStep =
  | { id: string; kind: 'intro' }
  | { id: string; kind: 'question'; key: ActiveAnswerKey; condition?: StepCondition }
  | { id: string; kind: 'story'; story: JourneyStoryId; condition?: StepCondition }
  | { id: string; kind: 'review' }

/** Breakage and shedding look similar; when either is reported we explain the difference first. */
export const needsLossClarification: StepCondition = (answers) => {
  const concerns = answers.presentingConcerns ?? []
  return concerns.includes('breakage') || concerns.includes('shedding')
}

/** Shedding takes us beyond the fibre, so it gets a wider, non-diagnostic acknowledgement. */
export const sheddingSignalled: StepCondition = (answers) => {
  const concerns = answers.presentingConcerns ?? []
  return concerns.includes('shedding') || answers.lossPattern === 'shedding' || answers.lossPattern === 'both'
}

// Step ids are persisted in saved progress, so keep them stable when reordering content.
export const JOURNEY_STEPS: readonly JourneyStep[] = [
  { id: 'intro', kind: 'intro' },
  { id: 'q:presentingConcerns', kind: 'question', key: 'presentingConcerns' },
  { id: 'story:breakage-or-shedding', kind: 'story', story: 'breakage-or-shedding', condition: needsLossClarification },
  { id: 'q:lossPattern', kind: 'question', key: 'lossPattern', condition: needsLossClarification },
  { id: 'story:wider-look', kind: 'story', story: 'wider-look', condition: sheddingSignalled },
  { id: 'q:dryness', kind: 'question', key: 'dryness' },
  { id: 'q:tangling', kind: 'question', key: 'tangling' },
  { id: 'q:breakage', kind: 'question', key: 'breakage' },
  { id: 'story:emerging-pattern', kind: 'story', story: 'emerging-pattern' },
  { id: 'story:three-words', kind: 'story', story: 'three-words' },
  { id: 'story:what-this-means', kind: 'story', story: 'what-this-means' },
  { id: 'q:strandFeel', kind: 'question', key: 'strandFeel' },
  { id: 'q:elasticity', kind: 'question', key: 'elasticity' },
  { id: 'q:chemicalOrHeatStress', kind: 'question', key: 'chemicalOrHeatStress' },
  { id: 'story:beyond-the-fibre', kind: 'story', story: 'beyond-the-fibre' },
  { id: 'q:fluidIntake', kind: 'question', key: 'fluidIntake' },
  { id: 'q:stress', kind: 'question', key: 'stress' },
  { id: 'q:sleep', kind: 'question', key: 'sleep' },
  { id: 'review', kind: 'review' },
]

export const REVIEW_STEP_INDEX = JOURNEY_STEPS.length - 1

export function stepIndexOf(id: string) {
  return JOURNEY_STEPS.findIndex((step) => step.id === id)
}

export function isStepActive(step: JourneyStep, answers: JourneyAnswers) {
  return step.kind === 'intro' || step.kind === 'review' || !step.condition || step.condition(answers)
}

/** Next/previous step that applies to this participant, skipping steps their answers switched off. */
export function adjacentStepIndex(from: number, answers: JourneyAnswers, direction: 1 | -1) {
  for (let i = from + direction; i >= 0 && i < JOURNEY_STEPS.length; i += direction) {
    if (isStepActive(JOURNEY_STEPS[i], answers)) return i
  }
  return direction === 1 ? REVIEW_STEP_INDEX : 0
}

export function activeQuestionSteps(answers: JourneyAnswers) {
  return JOURNEY_STEPS.filter((step): step is Extract<JourneyStep, { kind: 'question' }> => step.kind === 'question' && isStepActive(step, answers))
}

export function isValidAnswer(key: ActiveAnswerKey, value: unknown): boolean {
  const question: JourneyQuestion = QUESTIONS[key]
  if (question.kind === 'multi') {
    return Array.isArray(value)
      && value.length > 0
      && new Set(value).size === value.length
      && value.every((entry) => question.options.some((option) => option.value === entry))
  }
  return typeof value === 'string' && question.options.some((option) => option.value === value)
}

/** Keeps only known keys with values allowed by the answer contract. */
export function sanitizeAnswers(raw: unknown): JourneyAnswers {
  if (!raw || typeof raw !== 'object') return {}
  const source = raw as Record<string, unknown>
  const clean: Record<string, JourneyAnswerValue> = {}
  for (const key of ACTIVE_ANSWER_KEYS) {
    const value = source[key]
    if (isValidAnswer(key, value)) clean[key] = Array.isArray(value) ? [...value] as string[] : value as string
  }
  return clean as JourneyAnswers
}

/** The answers that apply to this participant — steps switched off by earlier answers are dropped. */
export function activeAnswers(answers: JourneyAnswers): JourneyAnswers {
  const clean = sanitizeAnswers(answers)
  const allowed = new Set(activeQuestionSteps(clean).map((step) => step.key))
  const result: Record<string, JourneyAnswerValue> = {}
  for (const [key, value] of Object.entries(clean)) {
    if (allowed.has(key as ActiveAnswerKey)) result[key] = value as JourneyAnswerValue
  }
  return result as JourneyAnswers
}

export function isJourneyComplete(answers: JourneyAnswers) {
  return activeQuestionSteps(answers).every((step) => isValidAnswer(step.key, answers[step.key]))
}

/** The furthest step a participant may be on: the first unanswered question that applies to them. */
export function furthestReachableStep(answers: JourneyAnswers) {
  const index = JOURNEY_STEPS.findIndex((step) => step.kind === 'question' && isStepActive(step, answers) && !isValidAnswer(step.key, answers[step.key]))
  return index === -1 ? REVIEW_STEP_INDEX : index
}

/** The answer-aware narrative for a question, or undefined when the earlier answer isn't known. */
export function bridgeParagraphs(question: JourneyQuestion, answers: JourneyAnswers): readonly string[] | undefined {
  if (question.kind !== 'single' || !question.bridge) return undefined
  const previous = answers[question.bridge.from]
  return typeof previous !== 'string' ? undefined : (question.bridge.byAnswer as Readonly<Record<string, readonly string[]>>)[previous]
}

/** Participant-facing summary of an answer, for the review list. */
export function answerLabel(key: ActiveAnswerKey, answers: JourneyAnswers): string | null {
  const question: JourneyQuestion = QUESTIONS[key]
  const value = answers[key]
  if (question.kind === 'multi') {
    if (!Array.isArray(value) || value.length === 0) return null
    return question.options.filter((option) => (value as string[]).includes(option.value)).map((option) => option.label).join(' · ')
  }
  if (typeof value !== 'string') return null
  return question.options.find((option) => option.value === value)?.label ?? null
}

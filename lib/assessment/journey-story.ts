import type { AssessmentInput } from './schema'
import type { JourneyAnswers } from './journey'

/**
 * STORY COPY — answer-aware, editorial, CLIENT-SAFE.
 *
 * Every sentence mirrors exactly ONE answer the participant has given, from the three
 * fibre observations only (dryness, tangling, breakage). Nothing here is weighted,
 * ranked or combined, and nothing predicts the result: the Hair Need is produced solely
 * by the server-side engine once the journey is complete.
 *
 * FUNCTION BEFORE INGREDIENT: functions and ingredient families only, never individual
 * Blend Bar ingredients. British English throughout.
 */

type ObservationKey = 'dryness' | 'tangling' | 'breakage'
const OBSERVATION_KEYS: readonly ObservationKey[] = ['dryness', 'tangling', 'breakage']

type BaseReflection = {
  area: string
  note: string
  reported: string
  /** Used instead of `reported` when an earlier observation is already worth a closer look. */
  reportedAfterConcern?: string
}
export type ExploreReflection = BaseReflection & { tone: 'explore'; meaning: string }
export type WorkingReflection = BaseReflection & { tone: 'working'; strength: string }
type Reflection = ExploreReflection | WorkingReflection

const REFLECTIONS: { readonly [K in ObservationKey]: { readonly [V in NonNullable<AssessmentInput[K]>]: Reflection } } = {
  dryness: {
    high: {
      tone: 'explore',
      area: 'Moisture & comfort',
      note: 'Dryness or roughness is noticeable day to day.',
      reported: 'You told us your hair feels dry or rough most of the time.',
      meaning: "The dryness you notice means hydration — water and water support — may be worth exploring. But, as you've just seen, feeling dry doesn't on its own tell us whether hydration, moisturising or conditioning will matter most.",
    },
    moderate: {
      tone: 'explore',
      area: 'Moisture & comfort',
      note: 'Some dryness or roughness, some of the time.',
      reported: 'You told us your hair feels a little dry or rough at times.',
      meaning: 'The dryness you notice from time to time may mean hydration — water and water support — is worth exploring, even if it turns out to be only part of the story.',
    },
    low: {
      tone: 'working',
      area: 'Comfort day to day',
      note: 'Your hair generally feels soft and comfortable.',
      reported: 'You told us your hair generally feels soft and comfortable.',
      strength: 'comfort day to day',
    },
  },
  tangling: {
    high: {
      tone: 'explore',
      area: 'Slip & manageability',
      note: 'Strands catch on one another a good deal right now.',
      reported: 'And the strands are catching on one another a good deal right now.',
      reportedAfterConcern: 'And right now, the strands are also catching on one another a good deal.',
      meaning: "The catching and friction you're noticing point toward conditioning — slip and manageability — as something worth exploring.",
    },
    moderate: {
      tone: 'explore',
      area: 'Slip & manageability',
      note: 'Strands catch from time to time.',
      reported: 'And the strands catch from time to time.',
      reportedAfterConcern: 'And the strands are also catching from time to time.',
      meaning: "The friction you're noticing suggests conditioning — slip and manageability — may be worth exploring.",
    },
    low: {
      tone: 'working',
      area: 'Ease of movement',
      note: 'Strands move past one another easily.',
      reported: 'And the strands seem to move past one another easily.',
      reportedAfterConcern: 'At the same time, the strands seem to move past one another easily.',
      strength: 'strands that move past one another easily',
    },
  },
  breakage: {
    frequent: {
      tone: 'explore',
      area: 'Fibre strength',
      note: 'Short broken pieces most times you handle your hair.',
      reported: 'You also see short broken pieces most times you handle your hair.',
      reportedAfterConcern: 'You also see short broken pieces most times you handle your hair.',
      meaning: 'The broken pieces you keep seeing point toward the strength of the fibre itself — less about how your hair feels, and more about how it is holding up to everyday handling.',
    },
    sometimes: {
      tone: 'explore',
      area: 'Fibre strength',
      note: 'Short broken pieces now and then.',
      reported: 'You see short broken pieces now and then.',
      meaning: 'The occasional broken pieces you notice may point toward the strength of the fibre — something to hold alongside everything else, rather than a conclusion on its own.',
    },
    rare: {
      tone: 'working',
      area: 'Fibre holding up',
      note: "You don't often see short broken pieces.",
      reported: "You don't often see short broken pieces.",
      strength: 'a fibre that is holding up to everyday handling',
    },
  },
}

/** When the participant is seeing shed hairs rather than broken pieces, breakage is not read as fibre evidence. */
const SHEDDING_INSTEAD_OF_BREAKAGE = 'And what you are seeing is mostly full-length shed hairs rather than broken pieces, which is a different story from the fibre itself.'
const UNSURE_BREAKAGE = "And you're not yet sure whether you're seeing breakage or shedding, so we'll hold that gently rather than draw a conclusion from it."

function reflectionsFor(answers: JourneyAnswers): Reflection[] {
  const breakageIsFibreEvidence = answers.lossPattern === undefined || answers.lossPattern === 'breakage' || answers.lossPattern === 'both'
  return OBSERVATION_KEYS.flatMap((key) => {
    if (key === 'breakage' && !breakageIsFibreEvidence) return []
    const value = answers[key]
    return value === undefined ? [] : [(REFLECTIONS[key] as Readonly<Record<string, Reflection>>)[value]]
  })
}

function joinList(items: readonly string[]) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export const EMERGING_PATTERN_TITLE = 'Something is beginning to stand out.'

export type EmergingPattern = {
  paragraphs: readonly string[]
  closing: readonly string[]
  explore: readonly ExploreReflection[]
  working: readonly WorkingReflection[]
}

export function emergingPattern(answers: JourneyAnswers): EmergingPattern {
  const reflections = reflectionsFor(answers)
  const explore = reflections.filter((r): r is ExploreReflection => r.tone === 'explore')
  const working = reflections.filter((r): r is WorkingReflection => r.tone === 'working')
  const paragraphs = reflections.map((reflection, i) =>
    reflection.reportedAfterConcern && reflections.slice(0, i).some((earlier) => earlier.tone === 'explore')
      ? reflection.reportedAfterConcern
      : reflection.reported)
  if (answers.lossPattern === 'shedding') paragraphs.push(SHEDDING_INSTEAD_OF_BREAKAGE)
  if (answers.lossPattern === 'unsure') paragraphs.push(UNSURE_BREAKAGE)

  if (explore.length === 0 && reflections.length > 0) {
    return {
      paragraphs,
      closing: ['Nothing here is asking for correction.', 'That is useful information too.'],
      explore,
      working,
    }
  }
  return {
    paragraphs,
    closing: ["Those observations don't give us your Hair Need yet.", 'But they do tell us what deserves a closer look.'],
    explore,
    working,
  }
}

/** Returns to the participant's own observations after the hydration / moisturising / conditioning explanation. */
export function whatThisMeans(answers: JourneyAnswers): readonly string[] {
  const reflections = reflectionsFor(answers)
  const explore = reflections.filter((r): r is ExploreReflection => r.tone === 'explore')
  const working = reflections.filter((r): r is WorkingReflection => r.tone === 'working')
  const notYet = "None of this is your Hair Need yet. It's simply where your observations are beginning to point."
  if (explore.length === 0) {
    return [
      'Your hair appears to be holding on to comfort and manageability fairly well. For you, these three words may be less about fixing something and more about protecting what already works — without unnecessary weight.',
      notYet,
    ]
  }
  return [
    ...explore.map((reflection) => reflection.meaning),
    ...(working.length > 0 ? [`It's also worth holding on to what already appears to be working: ${joinList(working.map((w) => w.strength))}.`] : []),
    notYet,
  ]
}

export const BREAKAGE_OR_SHEDDING = {
  eyebrow: 'Before we go further',
  title: 'Two different things, often confused.',
  body: [
    'Breakage happens when the fibre gives way somewhere along the strand. You tend to see shorter pieces of differing lengths.',
    'Shedding is a full-length strand released from the scalp. A shed hair often has a small club-shaped end.',
    'In the basin or the brush they can look alike, but they tell us very different things — so it helps to separate them before we go on.',
  ],
  cta: 'That makes sense',
} as const

export const WIDER_LOOK = {
  eyebrow: 'Worth acknowledging',
  title: 'This takes us beyond the hair fibre.',
  body: [
    'Increased shedding or hair loss can have many possible contributors, and a conditioner cannot tell us what is causing it.',
    'We can still understand what your hair fibre is showing us, while recognising that this part of the story deserves a wider look.',
  ],
  cta: 'Continue',
} as const

export const THREE_WORDS = {
  title: "Three words you're going to hear differently after today.",
  intro: 'Hydration, moisturising and conditioning are often used as if they mean the same thing. In formulation, they describe different goals — and those goals can overlap.',
  words: [
    {
      word: 'Hydration',
      think: 'water and water support.',
      body: [
        "Getting your hair wet gives it contact with water. That isn't the same as designing a formulation to support hydration.",
        'When a formulation is built with hydration in mind, it often draws on humectants — a family of ingredients used for their ability to attract and bind water, helping to support hydration.',
      ],
    },
    {
      word: 'Moisturising',
      think: 'the broader dry-feel and softness-support story.',
      body: [
        "Moisturising isn't necessarily the job of one ingredient.",
        'A moisturising formulation may bring several functions together — supporting water-related needs, helping to reduce moisture loss, and improving softness and comfort — so your hair can feel less dry and more comfortable.',
      ],
    },
    {
      word: 'Conditioning',
      think: 'feel, slip and manageability.',
      body: [
        'Conditioning systems can help improve slip and manageability, reduce friction between strands, and change how your hair feels and behaves.',
        'They typically draw on functional families such as conditioning agents and conditioning polymers, often alongside emollient or lubricating functions.',
      ],
    },
  ],
  overlap: [
    'These are distinguishable goals — but they are not sealed off from one another.',
    "A single ingredient family can contribute to more than one of them, and one formulation may support several at once. That's why we start with function — what your hair needs a formulation to do — before we talk about individual ingredients.",
  ],
  visual: {
    src: '/images/hair-need/hydration-moisturizing-conditioning.png',
    width: 1312,
    height: 1199,
    alt: 'Illustrated comparison of hydration, moisturising and conditioning showing their different but overlapping roles in hair formulation.',
    caption: 'Hydration, moisturising and conditioning: different roles that overlap.',
  },
  cta: 'What does this mean for my hair?',
} as const

export const WHAT_THIS_MEANS = {
  title: 'So what does this mean for your hair?',
  turn: 'Before we put this together, there are two more things worth knowing.',
  heading: 'The strand itself.',
  body: [
    'One is a characteristic rather than a problem: how an individual strand feels between your fingers, and how the fibre responds to gentle tension.',
    'The other is context: what your hair has been exposed to.',
    'Neither of them decides your Hair Need on its own.',
  ],
  cta: 'Continue',
} as const

export const BEYOND_THE_FIBRE = {
  eyebrow: 'One more part of the picture',
  title: 'Your hair is not separate from you.',
  body: [
    'Three short questions, and they are deliberately kept apart from everything else you have told us.',
    'They do not change your Hair Need, and we will not assume that they explain how your hair feels. They are here because they are worth being aware of.',
  ],
  cta: 'Continue',
} as const

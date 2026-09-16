import { z } from 'zod'

/**
 * SERVER ANSWER CONTRACT — Hair Need V1 (MVP).
 *
 * Active fields are required for new submissions. Retired fields stay OPTIONAL so
 * historical payloads and stored rows remain readable; they are never scored.
 *
 * A Hair Need is a functional area of support suggested by the hair fibre's current
 * condition and observable behaviour, interpreted from multiple relevant observations
 * rather than from a single product response, routine, hair type or isolated proxy.
 */

export const PRESENTING_CONCERN_VALUES = ['dryness', 'breakage', 'tangling', 'weighed-down', 'shedding', 'not-itself', 'nothing', 'other'] as const

export const assessmentSchema = z.object({
  // Non-scoring participant context.
  presentingConcerns: z.array(z.enum(PRESENTING_CONCERN_VALUES)).min(1).max(PRESENTING_CONCERN_VALUES.length),
  // Only asked when breakage and/or shedding is reported.
  lossPattern: z.enum(['breakage', 'shedding', 'both', 'unsure']).optional(),

  // Fibre observations that inform the Hair Need.
  dryness: z.enum(['low', 'moderate', 'high']),
  tangling: z.enum(['low', 'moderate', 'high']),
  breakage: z.enum(['rare', 'sometimes', 'frequent']),
  elasticity: z.enum(['balanced', 'stretches', 'snaps', 'unsure']),
  // Supporting context only. Exposure alone is never treated as damage.
  chemicalOrHeatStress: z.enum(['none', 'occasional', 'regular']),
  // Hair Characteristic. Never creates a Hair Need on its own.
  strandFeel: z.enum(['fine', 'medium', 'substantial', 'mixed']),

  // Whole-person context. Never scores the Hair Need.
  fluidIntake: z.enum(['regular', 'inconsistent', 'low', 'unsure']),
  stress: z.enum(['higher', 'similar', 'lower', 'unsure']),
  sleep: z.enum(['enough', 'mixed', 'not-enough', 'unsure']),

  // RETIRED IN V1 — product-response and water/porosity-proxy inputs.
  // Accepted so older clients and stored rows still parse. Never read by the engine.
  softnessAfterConditioning: z.enum(['lasting', 'temporary', 'minimal']).optional(),
  productBuildup: z.enum(['rare', 'sometimes', 'frequent']).optional(),
  proteinExperience: z.enum(['helpful', 'neutral', 'stiffness', 'unknown']).optional(),
  wettingSpeed: z.enum(['quick', 'moderate', 'slow']).optional(),
  dryingSpeed: z.enum(['quick', 'moderate', 'slow']).optional(),
  waterResponse: z.enum(['absorbs', 'mixed', 'beads']).optional(),
})

export type AssessmentInput = z.infer<typeof assessmentSchema>

export const ACTIVE_ANSWER_KEYS = [
  'presentingConcerns', 'lossPattern', 'dryness', 'tangling', 'breakage', 'elasticity',
  'chemicalOrHeatStress', 'strandFeel', 'fluidIntake', 'stress', 'sleep',
] as const
export type ActiveAnswerKey = (typeof ACTIVE_ANSWER_KEYS)[number]

export const RETIRED_ANSWER_KEYS = ['softnessAfterConditioning', 'productBuildup', 'proteinExperience', 'wettingSpeed', 'dryingSpeed', 'waterResponse'] as const

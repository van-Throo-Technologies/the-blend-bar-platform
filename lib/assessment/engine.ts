import type { AssessmentInput } from './schema'

export type HairNeed = 'Hydration Support' | 'Conditioning & Slip Support' | 'Strength Support' | 'Maintain & Support'

export type WiderSignal = { title: string; body: string }

export type CustomerResult = {
  characteristics: string[]
  currentCondition: string[]
  primaryNeed: HairNeed
  secondaryNeed: string | null
  widerSignals: WiderSignal[]
  blendBrief: { direction: string; priorities: string[]; performanceEdit: string[]; proteinGuidance: string }
}

/**
 * PRIVATE V1 HEURISTIC ENGINE.
 * Server-only. Never return raw scoring, weights or rule matches to the browser.
 *
 * V1 rules, locked:
 *  - No product-response inputs (conditioner response, buildup, protein history).
 *  - No water behaviour inputs. Wetting, beading and drying are not used as proxies for
 *    Hair Need, barrier condition, Cuticle Integrity Level or porosity. CIL is NOT calculated in V1.
 *  - Chemical/heat exposure is supporting evidence only; it can reinforce already-confirmed
 *    fibre evidence but never creates a need on its own.
 *  - The gentle-tension observation is NOT scored. It is participant-performed and uncontrolled
 *    (wetness, force, strand selection and interpretation all vary), so it is kept as a
 *    descriptive observation only. Confirmed fibre breakage is the core evidence for strength.
 *  - Strand feel is a Hair Characteristic and never creates a Hair Need.
 *  - Shedding/hair loss never produces a formulation need; it becomes a Wider Hair Health Signal.
 *  - Whole-person context (fluid intake, stress, sleep) never scores the Hair Need.
 *  - When no area reaches the evidence threshold the result is Maintain & Support. We do not
 *    manufacture a problem, and we never fall back to Hydration Support by tie order.
 *
 * ENVIRONMENT (V2+): Environmental conditions can materially influence hair behaviour and
 * formulation performance. They are recognised as part of the NHT holistic model but are
 * intentionally outside the V1 Hair Need calculation until they can be captured with
 * sufficient reliability. Not participant-facing.
 */

/** A functional area needs this much converging evidence before it is named as a Hair Need. */
const EVIDENCE_THRESHOLD = 3
/** A second area is only kept "in view" with at least this much evidence. */
const SECONDARY_THRESHOLD = 2

export function deriveCustomerResult(input: AssessmentInput): CustomerResult {
  const concerns = input.presentingConcerns ?? []
  const sheddingReported = concerns.includes('shedding') || input.lossPattern === 'shedding' || input.lossPattern === 'both'
  // Breakage counts as fibre evidence only when it was never in doubt, or the participant
  // confirmed broken pieces after the breakage/shedding explanation.
  const breakageConfirmed = input.lossPattern === undefined || input.lossPattern === 'breakage' || input.lossPattern === 'both'

  let moisture = 0
  let slip = 0
  let strength = 0

  if (input.dryness === 'high') moisture += 3
  else if (input.dryness === 'moderate') moisture += 1

  if (input.tangling === 'high') slip += 3
  else if (input.tangling === 'moderate') slip += 1

  if (breakageConfirmed) {
    if (input.breakage === 'frequent') strength += 3
    else if (input.breakage === 'sometimes') strength += 1
  }
  // The gentle-tension answer is deliberately absent from scoring — see the note above.
  // Supporting context: reinforces confirmed fibre evidence, never creates it.
  if (strength > 0 && input.chemicalOrHeatStress === 'regular') strength += 1

  // This order exists ONLY so that an exact tie resolves the same way every time. It is not a
  // clinical hierarchy, it does not mean one need matters more than another, and it is never
  // described that way to participants. A qualifying runner-up is still kept as secondaryNeed.
  const areas: { need: HairNeed; score: number }[] = [
    { need: 'Strength Support', score: strength },
    { need: 'Hydration Support', score: moisture },
    { need: 'Conditioning & Slip Support', score: slip },
  ]
  const ranked = [...areas].sort((a, b) => b.score - a.score)
  const hasNeed = ranked[0].score >= EVIDENCE_THRESHOLD
  const primary: HairNeed = hasNeed ? ranked[0].need : 'Maintain & Support'
  const secondary = hasNeed && ranked[1].score >= SECONDARY_THRESHOLD ? ranked[1].need : null

  const characteristics = [
    input.strandFeel === 'fine' ? 'Finer-feeling strands'
      : input.strandFeel === 'substantial' ? 'More substantial-feeling strands'
        : input.strandFeel === 'mixed' ? 'Mixed strand feel across the head'
          : 'Medium strand feel',
    input.tangling === 'high' ? 'Higher detangling demand' : 'Moderate-to-low detangling demand',
  ]
  // Descriptive only. The gentle-tension observation never contributes to a Hair Need.
  if (input.elasticity === 'balanced') characteristics.push('Under gentle tension: gives slightly, then returns')
  else if (input.elasticity === 'stretches') characteristics.push('Under gentle tension: stretches noticeably')
  else if (input.elasticity === 'snaps') characteristics.push('Under gentle tension: breaks with little tension')

  const currentCondition = [
    input.dryness === 'high' ? 'Dryness or roughness is noticeable day to day'
      : input.dryness === 'moderate' ? 'Some dryness or roughness some of the time'
        : 'Comfort is holding up well at the moment',
    input.lossPattern === 'shedding' ? 'Full-length shed hairs rather than fibre breakage'
      : input.lossPattern === 'unsure' ? 'Not yet clear whether the pieces are breakage or shedding'
        : input.breakage === 'frequent' ? 'Frequent breakage reported'
          : input.breakage === 'sometimes' ? 'Occasional breakage reported'
            : 'Breakage is not a dominant signal',
    input.chemicalOrHeatStress === 'regular' ? 'Regular colour, chemical or heat exposure — context, not damage in itself'
      : input.chemicalOrHeatStress === 'occasional' ? 'Occasional colour, chemical or heat exposure'
        : 'Little to no colour, chemical or heat exposure',
  ]

  const widerSignals: WiderSignal[] = []
  if (sheddingReported) {
    widerSignals.push({
      title: 'Shedding and hair loss',
      body: 'This takes us beyond the hair fibre. Increased shedding or hair loss can have many possible contributors, and a conditioner cannot tell us what is causing it. We can still understand what your hair fibre is showing us, while recognising that this part of the story deserves a wider look.',
    })
  }
  if (input.fluidIntake === 'low') {
    widerSignals.push({
      title: 'Fluid intake',
      body: "Your fluid intake sounds fairly low at the moment. Adequate hydration is important for normal body function, so this is worth supporting as part of your overall wellbeing. We won't assume that this alone explains how your hair feels.",
    })
  }
  if (input.stress === 'higher') {
    widerSignals.push({
      title: 'Stress',
      body: "You mentioned that stress has been higher than usual recently. That is worth acknowledging as part of your overall wellbeing. We won't assume it explains what your hair is doing, and it does not change your formulation.",
    })
  }
  if (input.sleep === 'not-enough') {
    widerSignals.push({
      title: 'Sleep',
      body: "You mentioned that restorative sleep has often been in short supply. That is worth supporting as part of your overall wellbeing. We won't assume it explains what your hair is doing, and it does not change your formulation.",
    })
  }

  const performanceEdit: string[] = []
  if (primary === 'Hydration Support') performanceEdit.push('D-Panthenol', 'Sodium PCA')
  if (primary === 'Conditioning & Slip Support') performanceEdit.push('Polyquaternium-7', 'D-Panthenol')
  if (primary === 'Strength Support') performanceEdit.push('D-Panthenol')

  const direction = primary === 'Maintain & Support'
    ? 'Support what your hair is already doing well, rather than adding corrective weight.'
    : `Build around ${primary.toLowerCase()}${secondary ? `, while keeping ${secondary.toLowerCase()} in view` : ''}.`

  const priorities = primary === 'Maintain & Support'
    ? ['Maintain & Support', 'Keep the conditioner base balanced', 'Avoid unnecessary heaviness']
    : [primary, ...(secondary ? [secondary] : []), 'Maintain a balanced conditioner base']

  const proteinGuidance = primary === 'Strength Support'
    ? 'Protein may be worth considering where the fibre needs more support, but it remains an informed optional choice you make with workshop guidance. This result does not prescribe it.'
    : 'Protein is not indicated by this result. The workshop will explain when a protein edit may or may not be appropriate.'

  return { characteristics, currentCondition, primaryNeed: primary, secondaryNeed: secondary, widerSignals, blendBrief: { direction, priorities, performanceEdit, proteinGuidance } }
}

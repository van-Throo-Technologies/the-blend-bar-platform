import { z } from 'zod'

export const assessmentSchema = z.object({
  wettingSpeed: z.enum(['quick','moderate','slow']),
  dryingSpeed: z.enum(['quick','moderate','slow']),
  waterResponse: z.enum(['absorbs','mixed','beads']),
  strandFeel: z.enum(['fine','medium','substantial','mixed']),
  tangling: z.enum(['low','moderate','high']),
  breakage: z.enum(['rare','sometimes','frequent']),
  dryness: z.enum(['low','moderate','high']),
  softnessAfterConditioning: z.enum(['lasting','temporary','minimal']),
  productBuildup: z.enum(['rare','sometimes','frequent']),
  elasticity: z.enum(['balanced','stretches','snaps','unsure']),
  chemicalOrHeatStress: z.enum(['none','occasional','regular']),
  proteinExperience: z.enum(['helpful','neutral','stiffness','unknown']),
})
export type AssessmentInput=z.infer<typeof assessmentSchema>

import type { AssessmentInput } from './schema'

export type CustomerResult = {
  characteristics: string[]
  currentCondition: string[]
  primaryNeed: 'Hydration Support'|'Conditioning & Slip Support'|'Strength Support'|'Balance & Barrier Support'
  secondaryNeed: string
  blendBrief: { direction:string; priorities:string[]; performanceEdit:string[]; proteinGuidance:string }
}

/**
 * PRIVATE V1 HEURISTIC ENGINE.
 * This module must remain server-only. Never return raw scoring, weights or rule matches to the browser.
 * V1 intentionally uses a modest ruleset that can later be replaced by a versioned NHT decision service.
 */
export function deriveCustomerResult(input:AssessmentInput):CustomerResult{
  let hydration=0, conditioning=0, strength=0, barrier=0
  if(input.dryness==='high') hydration+=3; else if(input.dryness==='moderate') hydration+=1
  if(input.softnessAfterConditioning==='temporary') hydration+=2
  if(input.waterResponse==='beads'||input.wettingSpeed==='slow') barrier+=2
  if(input.productBuildup==='frequent') barrier+=2
  if(input.tangling==='high') conditioning+=3; else if(input.tangling==='moderate') conditioning+=1
  if(input.breakage==='frequent') strength+=3; else if(input.breakage==='sometimes') strength+=1
  if(input.elasticity==='snaps') strength+=2
  if(input.chemicalOrHeatStress==='regular') strength+=2
  if(input.proteinExperience==='stiffness') barrier+=1
  const ranked=[['Hydration Support',hydration],['Conditioning & Slip Support',conditioning],['Strength Support',strength],['Balance & Barrier Support',barrier]] as const
  const sorted=[...ranked].sort((a,b)=>b[1]-a[1]); const primary=sorted[0][0]; const secondary=sorted[1][0]
  const characteristics=[
    input.strandFeel==='fine'?'Finer-feeling strands':input.strandFeel==='substantial'?'More substantial-feeling strands':'Mixed to medium strand feel',
    input.wettingSpeed==='slow'?'Slower wetting response':input.wettingSpeed==='quick'?'Fast wetting response':'Moderate wetting response',
    input.tangling==='high'?'Higher detangling demand':'Moderate-to-low detangling demand'
  ]
  const currentCondition=[input.dryness==='high'?'Noticeable dryness':'Moisture condition is relatively stable',input.breakage==='frequent'?'Frequent breakage reported':'Breakage is not the dominant signal',input.productBuildup==='frequent'?'Frequent buildup reported':'Buildup is not currently dominant']
  const edits:string[]=[]
  if(primary==='Hydration Support'){edits.push('D-Panthenol','Sodium PCA')}
  if(primary==='Conditioning & Slip Support'){edits.push('Polyquaternium-7','D-Panthenol')}
  if(primary==='Balance & Barrier Support'){edits.push('D-Panthenol')}
  if(primary==='Strength Support'){edits.push('D-Panthenol')}
  const proteinCandidate=primary==='Strength Support' && input.proteinExperience!=='stiffness'
  if(proteinCandidate) edits.push('Hydrolyzed Rice Protein or Silk Amino Acids — choose one after workshop guidance')
  return {
    characteristics,currentCondition,primaryNeed:primary,secondaryNeed:secondary,
    blendBrief:{direction:`Build around ${primary.toLowerCase()}, while keeping ${secondary.toLowerCase()} in view.`,priorities:[primary,secondary,'Maintain a balanced conditioner base'],performanceEdit:edits,proteinGuidance: proteinCandidate?'Protein may be worth considering, but it remains an informed optional choice. You will choose one protein option only if the workshop guidance and your history support it.':'Protein is not automatically indicated by this V1 result. The workshop will explain when a protein edit may or may not be appropriate.'}
  }
}

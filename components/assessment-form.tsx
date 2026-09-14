'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const questions=[
 ['wettingSpeed','When fully wetting your hair, how quickly does water seem to saturate it?',[['quick','Quickly'],['moderate','Gradually'],['slow','It takes time']]],
 ['dryingSpeed','Without heavy styling products, how quickly does your hair usually dry?',[['quick','Quickly'],['moderate','Moderately'],['slow','Slowly']]],
 ['waterResponse','At first contact, what do you notice most?',[['absorbs','Water seems to spread/absorb readily'],['mixed','It varies by area'],['beads','Water often sits or beads first']]],
 ['strandFeel','How do individual strands generally feel between your fingers?',[['fine','Fine/delicate'],['medium','Medium'],['substantial','Substantial'],['mixed','Mixed']]],
 ['tangling','How much tangling or friction are you dealing with currently?',[['low','Low'],['moderate','Moderate'],['high','High']]],
 ['breakage','How often are you noticing short broken pieces during handling?',[['rare','Rarely'],['sometimes','Sometimes'],['frequent','Frequently']]],
 ['dryness','How dry does your hair feel before wash day or re-conditioning?',[['low','Not very dry'],['moderate','Moderately dry'],['high','Very dry']]],
 ['softnessAfterConditioning','After conditioning, how long does softness usually last?',[['lasting','It lasts well'],['temporary','Only temporarily'],['minimal','Very little improvement']]],
 ['productBuildup','How often does your hair feel coated, heavy or difficult to re-wet?',[['rare','Rarely'],['sometimes','Sometimes'],['frequent','Frequently']]],
 ['elasticity','When wet, what best describes the hair under gentle tension?',[['balanced','Some give, then returns'],['stretches','Stretches a lot'],['snaps','Snaps easily'],['unsure','Not sure']]],
 ['chemicalOrHeatStress','How often is your hair exposed to chemical processing or substantial heat styling?',[['none','None/minimal'],['occasional','Occasionally'],['regular','Regularly']]],
 ['proteinExperience','If you have used protein-containing treatments before, what happened?',[['helpful','Hair felt supported'],['neutral','No clear difference'],['stiffness','Hair felt stiff/dry'],['unknown','I do not know']]],
] as const

export function AssessmentForm(){const router=useRouter();const [values,setValues]=useState<Record<string,string>>({});const [loading,setLoading]=useState(false);const [error,setError]=useState('');async function submit(e:React.FormEvent){e.preventDefault();if(Object.keys(values).length!==questions.length){setError('Please answer every question before continuing.');return}setLoading(true);setError('');const r=await fetch('/api/assessment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(values)});if(!r.ok){const j=await r.json().catch(()=>({}));setError(j.error||'We could not save your assessment. Please try again.');setLoading(false);return}router.push('/my-blend-bar/results');router.refresh()}
return <form onSubmit={submit} className="space-y-5">{questions.map(([key,q,options],i)=><fieldset key={key} className="card rounded-3xl p-6"><legend className="sr-only">{q}</legend><div className="flex gap-4"><span className="display text-2xl text-[#b9785b]">{String(i+1).padStart(2,'0')}</span><div className="flex-1"><p className="font-semibold leading-6">{q}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{options.map(([v,label])=><label key={v} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${values[key]===v?'border-[#203e33] bg-[#e7ece6]':'border-[#203e33]/10 bg-white/60 hover:border-[#203e33]/30'}`}><input className="mr-2" type="radio" name={key} value={v} checked={values[key]===v} onChange={()=>setValues(x=>({...x,[key]:v}))}/>{label}</label>)}</div></div></div></fieldset>)}{error&&<div className="rounded-2xl bg-[#ead9ce] p-4 text-sm text-[#6e4432]">{error}</div>}<button disabled={loading} className="w-full rounded-full bg-[#203e33] px-6 py-4 font-semibold text-white disabled:opacity-50">{loading?'Creating your result…':'Create my Hair Need result'}</button></form>}

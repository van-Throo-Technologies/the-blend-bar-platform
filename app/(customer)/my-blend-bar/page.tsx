import Link from 'next/link'
import { ArrowRight, ClipboardCheck, FlaskConical, LockKeyhole, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'

export default async function MyBlendBarPage(){
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); const entitlement=user?await getConditionerEntitlement(user.id):null
  const {data:assessment}=user?await supabase.from('assessments').select('status,completed_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle():{data:null}
  return <div className="shell py-12"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><div className="eyebrow">My Blend Bar</div><h1 className="display mt-3 text-4xl sm:text-5xl">Your Conditioner Edition space.</h1><p className="mt-3 max-w-2xl leading-7 text-[#203e33]/65">Assessment, preparation and workshop content—kept together in one guided pathway.</p></div><div className={`rounded-full px-4 py-2 text-sm ${entitlement?'bg-[#dfe9df] text-[#203e33]':'bg-[#ead9ce] text-[#6e4432]'}`}>{entitlement?'Access active':'Workshop access not yet active'}</div></div>
  {!entitlement&&<section className="mt-10 rounded-3xl bg-[#203e33] p-7 text-white sm:p-9"><div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center"><div><div className="text-xs font-bold uppercase tracking-[.16em] text-[#d8bd8a]">Activate your edition</div><h2 className="display mt-3 text-3xl">Unlock Conditioner Edition</h2><p className="mt-3 max-w-2xl leading-7 text-white/65">Secure checkout is handled by Stripe. Once payment is confirmed, your access is granted automatically.</p></div><form action="/api/checkout" method="post"><button className="rounded-full bg-[#f6f0e6] px-6 py-3 font-semibold text-[#203e33]">Continue to secure checkout</button></form></div></section>}
  <div className="mt-10 grid gap-5 md:grid-cols-3">{[
    [ClipboardCheck,'Hair Need Assessment',assessment?.status==='completed'?'Completed · review your result':'Tell us how your hair behaves now.', entitlement?'/my-blend-bar/assessment':'#'],
    [FlaskConical,'Your Blend Brief',assessment?.status==='completed'?'Your guided formulation direction is ready.':'Available after assessment.',assessment?.status==='completed'?'/my-blend-bar/results':'#'],
    [PlayCircle,'Workshop preparation','Prepare your space and understand what to expect.',entitlement?'/my-blend-bar/workshop':'#']
  ].map(([Icon,title,desc,href])=><Link aria-disabled={href==='#'} href={String(href)} key={String(title)} className={`card rounded-3xl p-7 ${href==='#'?'pointer-events-none opacity-55':''}`}><div className="flex items-center justify-between"><Icon className="h-6 w-6 text-[#b9785b]"/>{href==='#'?<LockKeyhole className="h-4 w-4 text-[#203e33]/35"/>:<ArrowRight className="h-4 w-4"/>}</div><h2 className="mt-8 text-lg font-semibold">{String(title)}</h2><p className="mt-3 text-sm leading-6 text-[#203e33]/60">{String(desc)}</p></Link>)}</div>
  </div>
}

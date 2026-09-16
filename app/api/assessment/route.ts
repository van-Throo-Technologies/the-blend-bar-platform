import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assessmentSchema } from '@/lib/assessment/schema'
import { deriveCustomerResult } from '@/lib/assessment/engine'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'

export async function POST(request:Request){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401})
  if(!await getConditionerEntitlement(user.id))return NextResponse.json({error:'Active workshop access is required.'},{status:403})
  const parsed=assessmentSchema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:'Please complete all assessment questions.'},{status:400})
  const result=deriveCustomerResult(parsed.data)
  // answers is jsonb, so participant context (presenting concerns, whole-person answers) persists without a migration.
  const {error}=await supabase.from('assessments').insert({user_id:user.id,edition_key:'conditioner-edition-v1',status:'completed',answers:parsed.data,customer_result:result,method_version:'hair-need-v2.0',completed_at:new Date().toISOString()})
  if(error)return NextResponse.json({error:'Assessment could not be saved.'},{status:500})
  return NextResponse.json({ok:true})
}

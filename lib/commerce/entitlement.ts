import { createClient } from '@/lib/supabase/server'
import { CURRENT_EDITION } from '@/lib/commerce/editions'

export async function getConditionerEntitlement(userId:string){
  const supabase=await createClient()
  const {data}=await supabase.from('entitlements').select('id,status,product_key,granted_at').eq('user_id',userId).eq('product_key',CURRENT_EDITION.key).eq('status','active').maybeSingle()
  return data
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'
import { HairNeedJourney } from '@/components/hair-need-journey'

export const metadata: Metadata = { title: 'Hair Need Journey' }

// The journey renders its own full-width colour blocks, so it is not wrapped in a container here.
export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (!await getConditionerEntitlement(user.id)) redirect('/my-blend-bar')
  return <HairNeedJourney userId={user.id} />
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CustomerNav } from '@/components/customer-nav'
export default async function CustomerLayout({children}:{children:React.ReactNode}){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');return <><CustomerNav/><main>{children}</main></>}

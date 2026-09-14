import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request:Request){
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser()
  if(!user?.email)return NextResponse.redirect(new URL('/login',request.url),303)
  const secret=process.env.STRIPE_SECRET_KEY; const priceId=process.env.STRIPE_CONDITIONER_EDITION_PRICE_ID
  if(!secret||!priceId)return NextResponse.json({error:'Stripe is not configured.'},{status:503})
  const stripe=new Stripe(secret)
  const session=await stripe.checkout.sessions.create({
    mode:'payment', customer_email:user.email, client_reference_id:user.id,
    line_items:[{price:priceId,quantity:1}],
    success_url:`${process.env.NEXT_PUBLIC_APP_URL}/my-blend-bar?purchase=success`,
    cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/my-blend-bar?purchase=cancelled`,
    metadata:{user_id:user.id,product_key:'conditioner-edition-v1',user_email:user.email},
    allow_promotion_codes:true,
  })
  if(!session.url)return NextResponse.json({error:'Checkout session did not return a URL.'},{status:500})
  return NextResponse.redirect(session.url,303)
}

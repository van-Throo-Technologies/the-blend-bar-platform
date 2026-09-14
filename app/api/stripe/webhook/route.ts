import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPurchaseWelcome } from '@/lib/email'

export async function POST(request:Request){
  const secret=process.env.STRIPE_SECRET_KEY, webhookSecret=process.env.STRIPE_WEBHOOK_SECRET
  if(!secret||!webhookSecret)return NextResponse.json({error:'Stripe webhook is not configured.'},{status:503})
  const stripe=new Stripe(secret); const signature=(await headers()).get('stripe-signature'); if(!signature)return NextResponse.json({error:'Missing signature'},{status:400})
  const body=await request.text(); let event:Stripe.Event
  try{event=stripe.webhooks.constructEvent(body,signature,webhookSecret)}catch{return NextResponse.json({error:'Invalid signature'},{status:400})}
  if(event.type==='checkout.session.completed'){
    const session=event.data.object; const userId=session.metadata?.user_id||session.client_reference_id; const productKey=session.metadata?.product_key||'conditioner-edition-v1'; const email=session.customer_details?.email||session.metadata?.user_email
    if(userId){const admin=createAdminClient();await admin.from('purchases').upsert({user_id:userId,product_key:productKey,stripe_checkout_session_id:session.id,stripe_payment_intent_id:typeof session.payment_intent==='string'?session.payment_intent:null,amount_total:session.amount_total,currency:session.currency,status:'paid',purchased_at:new Date().toISOString()},{onConflict:'stripe_checkout_session_id'});await admin.from('entitlements').upsert({user_id:userId,product_key:productKey,status:'active',source:'stripe',source_reference:session.id,granted_at:new Date().toISOString()},{onConflict:'user_id,product_key'});if(email)await sendPurchaseWelcome(email).catch(()=>null)}
  }
  return NextResponse.json({received:true})
}

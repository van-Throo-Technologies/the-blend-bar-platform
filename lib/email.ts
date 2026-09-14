import { Resend } from 'resend'
import { PurchaseWelcomeEmail } from '@/emails/purchase-welcome'

export async function sendPurchaseWelcome(email:string){
  if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM_EMAIL||!process.env.NEXT_PUBLIC_APP_URL)return
  const resend=new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({from:process.env.RESEND_FROM_EMAIL,to:email,subject:'Your Blend Bar is ready',react:PurchaseWelcomeEmail({appUrl:process.env.NEXT_PUBLIC_APP_URL})})
}

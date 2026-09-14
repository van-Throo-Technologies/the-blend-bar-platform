'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthForm({ mode }: { mode: 'login'|'signup' }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false); const [message,setMessage]=useState('')
  async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setMessage('');const supabase=createClient();
    if(mode==='signup'){
      const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}})
      if(error)setMessage(error.message); else setMessage('Check your email to confirm your account. Once confirmed, you can enter My Blend Bar.')
    }else{
      const {error}=await supabase.auth.signInWithPassword({email,password}); if(error)setMessage(error.message); else window.location.href='/my-blend-bar'
    }
    setLoading(false)
  }
  return <form onSubmit={submit} className="card rounded-3xl p-7"><div className="eyebrow">{mode==='login'?'Welcome back':'Begin your experience'}</div><h1 className="display mt-3 text-4xl">{mode==='login'?'Enter My Blend Bar':'Create My Blend Bar'}</h1><p className="mt-3 text-sm leading-6 text-[#203e33]/65">{mode==='login'?'Access your workshop, Hair Need Assessment and Blend Brief.':'Create your secure account. Your workshop entitlement will be linked to this email.'}</p><label className="mt-7 block text-sm font-medium">Email</label><input className="mt-2 w-full rounded-xl border border-[#203e33]/15 bg-white px-4 py-3 outline-none focus:border-[#203e33]/50" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label className="mt-5 block text-sm font-medium">Password</label><input className="mt-2 w-full rounded-xl border border-[#203e33]/15 bg-white px-4 py-3 outline-none focus:border-[#203e33]/50" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/><button disabled={loading} className="mt-6 w-full rounded-full bg-[#203e33] px-5 py-3 font-semibold text-white disabled:opacity-50">{loading?'Please wait…':mode==='login'?'Sign in':'Create account'}</button>{message&&<div className="mt-5 rounded-xl bg-[#e8ddc9] p-4 text-sm leading-6">{message}</div>}<p className="mt-6 text-center text-sm text-[#203e33]/60">{mode==='login'?<>New here? <a className="font-semibold text-[#203e33]" href="/signup">Create an account</a></>:<>Already have an account? <a className="font-semibold text-[#203e33]" href="/login">Sign in</a></>}</p></form>
}

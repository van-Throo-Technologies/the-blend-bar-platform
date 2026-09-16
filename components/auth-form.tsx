'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AuthForm({ mode }: { mode: 'login'|'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage('')
    const supabase = createClient()
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account. Once confirmed, you can enter My Blend Bar.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/my-blend-bar'
    }
    setLoading(false)
  }

  return (
    // The form sits on its own light surface inside the deep-green page.
    <form onSubmit={submit} data-surface="clean" className="surface p-7 sm:p-9" style={{ borderRadius: 'var(--radius)' }}>
      <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Begin your experience'}</p>
      <span aria-hidden className="rule-gold mt-4" />
      <h1 className="display mt-5 text-[2rem] leading-tight">{mode === 'login' ? 'Enter My Blend Bar' : 'Create My Blend Bar'}</h1>
      <p className="muted mt-3 text-sm leading-6">
        {mode === 'login' ? 'Access your workshop, Hair Need Journey and Blend Brief.' : 'Create your secure account. Your workshop entitlement will be linked to this email.'}
      </p>

      <label className="mt-8 block text-sm font-semibold" htmlFor="email">Email</label>
      <input id="email" className="field mt-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

      <label className="mt-5 block text-sm font-semibold" htmlFor="password">Password</label>
      <input id="password" className="field mt-2" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />

      <button disabled={loading} className="btn mt-7 w-full">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>

      {message && <div role="status" className="mt-5 border-l-2 border-[var(--gold)] bg-[var(--cloud)] p-4 text-sm leading-6">{message}</div>}

      <p className="muted mt-7 text-center text-sm">
        {mode === 'login'
          ? <>New here? <a className="focus-ring font-semibold text-[var(--green-deep)] underline underline-offset-4" href="/signup">Create an account</a></>
          : <>Already have an account? <a className="focus-ring font-semibold text-[var(--green-deep)] underline underline-offset-4" href="/login">Sign in</a></>}
      </p>
    </form>
  )
}

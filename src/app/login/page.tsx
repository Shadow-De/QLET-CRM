'use client'

import { Suspense } from 'react'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(
    error ? 'Invalid email or password. Please try again.' : null
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setFormError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <main className="w-full max-w-sm px-6 relative z-10">
      <div className="bg-surface/90 backdrop-blur-md border border-outline-variant/30 rounded-xl p-8 shadow-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(183,109,255,0.08)] hover:border-purple/30 relative overflow-hidden group">
        
        {/* Decorative Tech Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40 rounded-tl-xl transition-colors duration-300 group-hover:border-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/40 rounded-tr-xl transition-colors duration-300 group-hover:border-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/40 rounded-bl-xl transition-colors duration-300 group-hover:border-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40 rounded-br-xl transition-colors duration-300 group-hover:border-primary"></div>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant/50 mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>vpn_key</span>
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tighter text-primary">QLET RENTALS</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline mt-1 font-label">Control Room v1.0 — Auth</p>
        </div>
        
        {formError && (
          <div className="mb-4 px-3 py-2.5 rounded bg-error-container/20 border border-error/30 text-sm text-error">
            {formError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider block ml-1" htmlFor="email">Agent ID / Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline-variant text-sm">badge</span>
              </div>
              <input 
                id="email" 
                name="email" 
                type="email"
                autoComplete="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="agent@qlet.mt" 
                className="block w-full pl-9 pr-3 py-3 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none font-body placeholder-outline-variant/50" 
              />
            </div>
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider block ml-1" htmlFor="password">Access Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline-variant text-sm">lock</span>
              </div>
              <input 
                id="password" 
                name="password" 
                type="password"
                autoComplete="current-password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••" 
                className="block w-full pl-9 pr-3 py-3 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none font-body placeholder-outline-variant/50" 
              />
            </div>
          </div>
          
          {/* Submit Action */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold font-headline text-on-primary-container bg-primary-container hover:bg-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-container-lowest hover:shadow-[0_0_20px_rgba(183,109,255,0.4)] uppercase tracking-wide disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Initialize Session'}
              <span className="material-symbols-outlined ml-2 text-sm">login</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <Suspense fallback={
        <div className="w-full max-w-sm relative z-10">
          <div className="glass-card p-6 text-center text-outline text-sm rounded-xl">Initializing...</div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

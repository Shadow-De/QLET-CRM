'use client'

import { Suspense, useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

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

  const [currentFlow, setCurrentFlow] = useState<'login' | 'reset'>('login')

  async function handleLoginSubmit(e: FormEvent) {
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

  function handleResetSubmit(e: FormEvent) {
    e.preventDefault()
    // In a real app, you would send a password reset email here
    alert('Reset link dispatched')
  }

  return (
    <>
      <header className="w-full border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md px-space-xl py-space-sm flex items-center justify-between z-20 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-space-md">
          <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Valletta Port Relay: 99.98% Synced</span>
          <span className="hidden md:inline-block text-outline-variant">|</span>
          <span className="hidden md:inline-block font-numeric-data text-numeric-data text-tertiary">LAT 35.8989° N, LON 14.5146° E</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-space-base md:p-space-xl relative z-10 min-h-screen pt-20 pb-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-2xl overflow-hidden backdrop-blur-xl">
          <section className="lg:col-span-5 bg-surface-container-lowest/90 p-space-xl lg:p-space-2xl flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant/30 relative">
            <div className="space-y-space-xl relative z-10">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(76,215,246,0.15)]">
                  <span className="material-symbols-outlined text-[28px]">shield</span>
                </div>
                <div>
                  <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">Malta Lettings CRM</h1>
                  <p className="font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase">Valletta Maritime Ops</p>
                </div>
              </div>
              <div className="space-y-space-sm pt-space-md">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-space-xxs rounded-full bg-primary-container/20 border border-primary/30 text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Maritime Agent Gateway v4.8</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Precision Portfolio Execution for the Maltese Coast.</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Centralized listing distribution, tenant escrow clearance, and fast-track lease underwriting across Sliema, St. Julian's, and Valletta waterfront developments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-space-sm pt-space-sm">
                <div className="p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Active Waterfront Leases</span>
                  <div className="font-kpi-metric text-kpi-metric text-on-surface pt-space-xs">42 <span className="text-tertiary text-title-md font-numeric-data">Active</span></div>
                  <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-space-xxs mt-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +14.2% MoM
                  </span>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Avg. Sign Velocity</span>
                  <div className="font-kpi-metric text-kpi-metric text-on-surface pt-space-xs">3.4 <span className="text-primary text-title-md font-numeric-data">Days</span></div>
                  <span className="font-label-sm text-label-sm text-primary flex items-center gap-space-xxs mt-1">
                    <span className="material-symbols-outlined text-[14px]">speed</span> High Tempo
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-space-xl relative z-10 border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm mt-8">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                <span>256-Bit SSL RSA Encryption</span>
              </div>
              <span className="font-numeric-data text-numeric-data">ID: MLA-9904</span>
            </div>
          </section>
          
          <section className="lg:col-span-7 bg-surface-container-low p-space-xl lg:p-space-2xl flex flex-col justify-center relative">
            {currentFlow === 'login' ? (
              <div className="w-full max-w-md mx-auto space-y-space-lg transition-all duration-300">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Authorized Personnel</span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface mt-space-xxs">Agent Portal Sign-In</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Enter your assigned Republic of Malta broker credentials to access active pipeline inventories.
                  </p>
                </div>
                
                {formError && (
                  <div className="p-space-md rounded-lg bg-error-container/25 border border-error/40 flex items-start gap-space-sm transition-all duration-200">
                    <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0 mt-0.5">error</span>
                    <div className="flex-1">
                      <h4 className="font-title-md text-title-md text-error">Access Restricted</h4>
                      <p className="font-body-sm text-body-sm text-on-error-container/90 mt-0.5">
                        {formError}
                      </p>
                    </div>
                    <button type="button" className="text-on-error-container/70 hover:text-error transition-colors" onClick={() => setFormError(null)}>
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleLoginSubmit} className="space-y-space-md">
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface" htmlFor="agentEmail">Agent Email ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </div>
                      <input 
                        id="agentEmail" 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@maltalettings.com.mt" 
                        className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-label-md text-label-md text-on-surface" htmlFor="agentPassword">Security Passcode</label>
                      <button type="button" onClick={() => setCurrentFlow('reset')} className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors duration-150 focus:outline-none focus:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </div>
                      <input 
                        id="agentPassword" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="w-full h-10 pl-10 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-space-xs">
                    <label className="inline-flex items-center gap-space-sm cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant/60 text-primary focus:ring-primary focus:ring-offset-surface-container-low" />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Remember this hardware device for 30 days</span>
                    </label>
                  </div>
                  
                  <div className="pt-space-sm">
                    <button type="submit" disabled={loading} className="w-full h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-title-md font-semibold flex items-center justify-center gap-space-sm shadow-md hover:shadow-cyan-500/25 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface transition-all duration-150 disabled:opacity-50">
                      <span>{loading ? 'Authenticating...' : 'Log In to Dashboard'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
                <div className="p-space-sm rounded bg-surface-container-lowest border border-outline-variant/20 text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Malta Financial Services Authority (MFSA) Real Estate Compliant Session.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto space-y-space-lg transition-all duration-300">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
                  <button type="button" onClick={() => setCurrentFlow('login')} className="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    <span>Back to Agent Sign In</span>
                  </button>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold">Self-Service Reset</span>
                </div>
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">Password Recovery</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Provide your official broker directory email address. If an active credential exists, an authenticated cryptographic token will be dispatched instantly.
                  </p>
                </div>
                <form onSubmit={handleResetSubmit} className="space-y-space-md">
                  <div className="space-y-1.5">
                    <label className="block font-label-md text-label-md text-on-surface" htmlFor="resetEmail">Registered Broker Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <input id="resetEmail" type="email" required placeholder="name@maltalettings.com.mt" className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150" />
                    </div>
                  </div>
                  <div className="pt-space-xs">
                    <button type="submit" className="w-full h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-title-md font-semibold flex items-center justify-center gap-space-sm shadow-md hover:shadow-cyan-500/25 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150">
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Reset Link</span>
                    </button>
                  </div>
                </form>
                <div className="rounded-lg p-space-md bg-surface-container-lowest border border-outline-variant/30 space-y-space-xs">
                  <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Did not receive your clearance key?</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Check internal agency spam filters or contact the Valletta NOC desk directly at <span className="text-on-surface font-numeric-data">+356 2138 4900</span>.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest/90 px-space-xl py-space-sm z-20 absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-lg text-on-surface-variant font-label-sm text-label-sm">
            <div className="flex items-center gap-space-xs text-primary">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              <span>Agent Support Hotline:</span>
              <a className="font-numeric-data text-numeric-data text-on-surface hover:text-primary transition-colors" href="tel:+35621384900">+356 2138 4900 (Valletta Central)</a>
            </div>
            <span className="hidden sm:inline-block text-outline-variant">•</span>
            <div className="hidden sm:flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
              <span>Encrypted 256-bit SSL Active Session</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md text-on-surface-variant font-label-sm text-label-sm">
            <span>ISO/IEC 27001 Certified</span>
            <span className="text-outline-variant">•</span>
            <span>© {new Date().getFullYear()} Malta Lettings CRM</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="p-6 text-center text-outline text-sm rounded-xl">Initializing...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}


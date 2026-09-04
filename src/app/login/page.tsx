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
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple/10 border border-purple/20 mb-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">QLET CRM</h1>
        <p className="text-sm text-text-muted mt-1">Malta Lettings Platform</p>
      </div>

      {/* Login card */}
      <div className="surface p-6">
        <h2 className="text-base font-semibold text-text-primary mb-5">Agent Sign In</h2>

        {formError && (
          <div className="mb-4 px-3 py-2.5 rounded bg-red-900/20 border border-red-500/30 text-sm text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            id="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="agent@yourdomain.mt"
          />
          <Input
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          <Button type="submit" loading={loading} className="w-full mt-1">
            Sign In
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        Contact your administrator to reset your password.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-base-bg bg-grid flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-sm">
          <div className="surface p-6 text-center text-text-muted text-sm">Loading…</div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

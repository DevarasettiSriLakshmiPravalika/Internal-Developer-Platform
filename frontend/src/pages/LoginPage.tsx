import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { login, register } from '../services/api'
import type { AuthResponse } from '../types/auth'

type LoginPageProps = {
  onAuthenticated: (response: AuthResponse) => void
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const response = isRegistering
        ? await register(email, displayName, password)
        : await login(email, password)
      onAuthenticated(response)
    } catch (requestError) {
      if (requestError && typeof requestError === 'object' && 'response' in requestError) {
        const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message
        setError(message ?? 'Authentication failed. Check your details and try again.')
      } else {
        setError('ForgeFlow API is unavailable. Check that the backend is running.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="brand auth-brand"><span className="brand-mark">F</span><span>ForgeFlow</span></div>
        <div className="auth-intro"><p className="eyebrow">INTERNAL DEVELOPER PLATFORM</p><h1>{isRegistering ? 'Create your workspace account' : 'Welcome back'}</h1><p>{isRegistering ? 'Start building and operating services with your team.' : 'Sign in to manage services, deployments, and platform access.'}</p></div>
        <form onSubmit={submit} className="auth-form">
          {isRegistering && <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" /></label>}
          <label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} autoComplete={isRegistering ? 'new-password' : 'current-password'} /><small>{isRegistering ? 'Use at least 12 characters.' : 'Your password is never shown in the platform.'}</small></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Working...' : isRegistering ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setIsRegistering(!isRegistering); setError('') }}>{isRegistering ? 'Already have an account? Sign in' : 'Need an account? Create one'}</button>
        <p className="auth-note"><LockKeyhole size={13} /> Access is secured with signed JWT sessions.</p>
      </section>
    </main>
  )
}

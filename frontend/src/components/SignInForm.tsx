import { type FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InlineError from './InlineError'

interface SignInFormProps {
  onSwitchToSignUp: () => void
  onNeedsConfirmation: (email: string) => void
}

const SignInForm = ({ onSwitchToSignUp, onNeedsConfirmation }: SignInFormProps) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'UserNotConfirmedException') {
        onNeedsConfirmation(email)
      } else {
        setError('Incorrect email or password.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <InlineError message={error} />}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchToSignUp}>
          Create one
        </button>
      </p>
    </form>
  )
}

export default SignInForm

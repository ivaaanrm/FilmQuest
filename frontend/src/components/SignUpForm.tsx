import { type FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InlineError from './InlineError'

interface SignUpFormProps {
  onSwitchToSignIn: () => void
  onNeedsConfirmation: () => void
}

const SignUpForm = ({ onSwitchToSignIn, onNeedsConfirmation }: SignUpFormProps) => {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await signUp(email, password)
      onNeedsConfirmation()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      const message = (err as { message?: string }).message
      if (code === 'UsernameExistsException') {
        setError('An account with this email already exists.')
      } else if (code === 'InvalidPasswordException') {
        setError(message ?? 'Password does not meet requirements.')
      } else {
        setError(message ?? 'Sign-up failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="form-field">
        <label htmlFor="signup-confirm">Confirm password</label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {error && <InlineError message={error} />}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Create account'}
      </button>
      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToSignIn}>
          Sign in
        </button>
      </p>
    </form>
  )
}

export default SignUpForm

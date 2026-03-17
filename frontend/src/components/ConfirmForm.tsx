import { type FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InlineError from './InlineError'

interface ConfirmFormProps {
  email: string
  onConfirmed: () => void
}

const ConfirmForm = ({ email, onConfirmed }: ConfirmFormProps) => {
  const { confirmSignUp, resendCode } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await confirmSignUp(email, code)
      onConfirmed()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'CodeMismatchException') {
        setError('Invalid code. Please try again.')
      } else if (code === 'ExpiredCodeException') {
        setError('Code expired. Please request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendCode(email)
      setResent(true)
      setError(null)
    } catch {
      setError('Could not resend code. Please try again.')
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="auth-hint">
        We sent a verification code to <strong>{email}</strong>
      </p>
      <div className="form-field">
        <label htmlFor="confirm-code">Verification code</label>
        <input
          id="confirm-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          autoComplete="one-time-code"
        />
      </div>
      {error && <InlineError message={error} />}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Verifying...' : 'Verify'}
      </button>
      <p className="auth-switch">
        {resent ? (
          'Code resent. Check your inbox.'
        ) : (
          <>
            Didn&apos;t get the code?{' '}
            <button type="button" onClick={handleResend}>
              Resend
            </button>
          </>
        )}
      </p>
    </form>
  )
}

export default ConfirmForm

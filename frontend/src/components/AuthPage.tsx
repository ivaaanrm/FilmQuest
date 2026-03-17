import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ConfirmForm from './ConfirmForm'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

type AuthMode = 'signIn' | 'signUp' | 'confirm'

const AuthPage = () => {
  const { userEmail } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signIn')
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)

  const emailForConfirm = confirmEmail ?? userEmail ?? ''

  const handleNeedsConfirmation = (email: string) => {
    setConfirmEmail(email)
    setMode('confirm')
  }

  return (
    <div className="questionnaire">
      <header className="brand-header">
        <div className="brand-title">FilmQuest</div>
        <p className="brand-sub">
          Sign in to discover your perfect watchlist.
        </p>
      </header>
      <div className="panel auth-panel">
        {mode === 'signIn' && (
          <SignInForm
            onSwitchToSignUp={() => setMode('signUp')}
            onNeedsConfirmation={handleNeedsConfirmation}
          />
        )}
        {mode === 'signUp' && (
          <SignUpForm
            onSwitchToSignIn={() => setMode('signIn')}
            onNeedsConfirmation={() => setMode('confirm')}
          />
        )}
        {mode === 'confirm' && (
          <ConfirmForm
            email={emailForConfirm}
            onConfirmed={() => setMode('signIn')}
          />
        )}
      </div>
    </div>
  )
}

export default AuthPage

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  confirmSignUp as cognitoConfirm,
  getIdToken,
  isConfigured as isCognitoConfigured,
  resendConfirmationCode,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  signUp as cognitoSignUp,
} from '../lib/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  userEmail: string | null
  signUp: (email: string, password: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  resendCode: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!isCognitoConfigured()) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }
    getIdToken()
      .then((token) => {
        setIsAuthenticated(token !== null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    await cognitoSignUp(email, password)
    setUserEmail(email)
  }, [])

  const confirmSignUp = useCallback(async (email: string, code: string) => {
    await cognitoConfirm(email, code)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await cognitoSignIn(email, password)
    setUserEmail(email)
    setIsAuthenticated(true)
  }, [])

  const signOut = useCallback(() => {
    cognitoSignOut()
    setIsAuthenticated(false)
    setUserEmail(null)
  }, [])

  const resendCode = useCallback(async (email: string) => {
    await resendConfirmationCode(email)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userEmail,
        signUp,
        confirmSignUp,
        signIn,
        signOut,
        resendCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

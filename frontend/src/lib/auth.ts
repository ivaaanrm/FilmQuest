import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
} from 'amazon-cognito-identity-js'

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID as
  | string
  | undefined
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined

export function isConfigured(): boolean {
  return Boolean(USER_POOL_ID && CLIENT_ID)
}

function getUserPool(): CognitoUserPool | null {
  if (!USER_POOL_ID || !CLIENT_ID) return null
  return new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  })
}

function getCognitoUser(email: string): CognitoUser | null {
  const pool = getUserPool()
  if (!pool) return null
  return new CognitoUser({ Username: email, Pool: pool })
}

export async function signUp(
  email: string,
  password: string,
): Promise<void> {
  const pool = getUserPool()
  if (!pool) return

  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
  ]

  return new Promise((resolve, reject) => {
    pool.signUp(email, password, attributes, [], (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export async function confirmSignUp(
  email: string,
  code: string,
): Promise<void> {
  const user = getCognitoUser(email)
  if (!user) return

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

export async function signIn(
  email: string,
  password: string,
): Promise<string> {
  const user = getCognitoUser(email)
  if (!user) return ''

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  })

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        resolve(session.getIdToken().getJwtToken())
      },
      onFailure: (err: Error) => {
        reject(err)
      },
    })
  })
}

export function signOut(): void {
  const pool = getUserPool()
  if (!pool) return

  const user = pool.getCurrentUser()
  if (user) user.signOut()
}

export async function getIdToken(): Promise<string | null> {
  const pool = getUserPool()
  if (!pool) return null

  const user = pool.getCurrentUser()
  if (!user) return null

  return new Promise((resolve) => {
    user.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null)
          return
        }
        resolve(session.getIdToken().getJwtToken())
      },
    )
  })
}

export async function resendConfirmationCode(email: string): Promise<void> {
  const user = getCognitoUser(email)
  if (!user) return

  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

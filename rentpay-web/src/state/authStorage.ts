import type { AuthUser } from './types'

const TOKEN_KEY = 'rentpay.token'
const USER_KEY = 'rentpay.user'

export const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export const readStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const writeAuth = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

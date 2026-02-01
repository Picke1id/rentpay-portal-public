import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../api/client'
import { clearAuth, readStoredToken, readStoredUser, writeAuth } from './authStorage'
import type { AuthUser } from './types'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => readStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    const nextToken = response.data.token as string
    const nextUser = response.data.user as AuthUser
    writeAuth(nextToken, nextUser)
    setToken(nextToken)
    setUser(nextUser)
    return nextUser
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

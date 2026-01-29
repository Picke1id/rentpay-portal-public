import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/AuthContext'

export const RequireAuth = ({ role, children }: { role?: 'admin' | 'tenant'; children: ReactNode }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/tenant'} replace />
  }

  return <>{children}</>
}

import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/AuthContext'
import { Button } from './Button'

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">RP</span>
          <div>
            <h1>RentPay Portal</h1>
            <p>Stripe‑verified rent payments</p>
          </div>
        </div>
        <nav className="nav-links">
          <Link to={user?.role === 'admin' ? '/admin' : '/tenant'}>Dashboard</Link>
          <Link to="/">Home</Link>
        </nav>
        <div className="auth-badge">
          <span>{user?.name}</span>
          <Button onClick={logout} className="btn-ghost">Sign out</Button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

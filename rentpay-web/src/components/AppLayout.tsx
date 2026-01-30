import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/AuthContext'
import { Button } from './Button'

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="flex flex-col gap-6 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-navy font-display text-lg font-bold text-white">RP</span>
          <div>
            <h1 className="font-display text-2xl">RentPay Portal</h1>
            <p className="text-sm text-slate-500">Stripe‑verified rent payments</p>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to={user?.role === 'admin' ? '/admin' : '/tenant'}>Dashboard</Link>
          <Link to="/">Home</Link>
        </nav>
        <div className="flex items-center gap-3 rounded-full bg-white/70 px-3 py-2 shadow-soft">
          <span className="text-sm font-medium">{user?.name}</span>
          <Button onClick={logout} className="btn-ghost text-xs">Sign out</Button>
        </div>
      </header>
      <main className="flex flex-col gap-6 px-8 pb-10">{children}</main>
    </div>
  )
}

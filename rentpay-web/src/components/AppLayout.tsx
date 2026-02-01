import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../state/AuthContext'
import { Button } from './Button'

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const adminLinks = [
    { label: 'Dashboard', href: '/admin#dashboard' },
    { label: 'Properties', href: '/admin#properties' },
    { label: 'Units', href: '/admin#units' },
    { label: 'Leases', href: '/admin#leases' },
    { label: 'Charges', href: '/admin#charges' },
    { label: 'Imports', href: '/admin#imports' },
  ]

  const tenantLinks = [
    { label: 'Dashboard', href: '/tenant#dashboard' },
    { label: 'Charges', href: '/tenant#charges' },
    { label: 'Payments', href: '/tenant#payments' },
  ]

  const links = user?.role === 'admin' ? adminLinks : tenantLinks

  return (
    <div className="min-h-screen bg-sand">
      <header className="flex items-center justify-between border-b border-stone/60 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-10 w-10 place-items-center rounded-2xl bg-navy font-display text-base font-bold text-white">RP</span>
          <div>
            <h1 className="font-display text-lg">RentPay Portal</h1>
            <p className="text-xs text-slate-500">Stripe‑verified rent payments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-soft">
          <span className="text-xs font-semibold text-slate-600">{user?.name}</span>
          <Button onClick={logout} className="btn-ghost text-xs">Sign out</Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-stone/60 bg-gradient-to-b from-navy to-[#1e2f4b] px-4 py-6 text-white lg:block">
          <div className="mb-6 text-xs uppercase tracking-[0.25em] text-white/60">Navigation</div>
          <div className="space-y-2 text-sm font-medium">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${location.hash === `#${link.href.split('#')[1]}` ? 'bg-white/10' : 'hover:bg-white/10'}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-8 rounded-xl bg-white/10 p-3 text-xs text-white/70">
            Logged in as {user?.role === 'admin' ? 'Admin' : 'Tenant'}
          </div>
        </aside>
        <main className="flex flex-col gap-6 px-8 py-8">{children}</main>
      </div>
    </div>
  )
}

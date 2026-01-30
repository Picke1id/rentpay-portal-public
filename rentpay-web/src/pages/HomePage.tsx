import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const HomePage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 items-center gap-12 bg-gradient-to-br from-white via-sand to-stone p-16 lg:grid-cols-2">
      <div className="space-y-6">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-teal">RentPay Portal</p>
        <h1 className="font-display text-4xl leading-tight text-ink">Rent payments, verified by Stripe, designed for trust.</h1>
        <p className="text-slate-600">
          A full‑stack MVP showcasing admin and tenant experiences, automated charges,
          and webhook‑verified payment success.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/login">
            <Button className="btn-primary">Sign in</Button>
          </Link>
          <Link to="/tenant">
            <Button className="btn-ghost">Tenant demo</Button>
          </Link>
        </div>
      </div>
      <div className="card space-y-4 p-8">
        <h3 className="font-display text-2xl">Today</h3>
        <p className="text-slate-500">Stripe events confirm payments before any balance updates.</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Webhook‑verified payment status</li>
          <li>Role‑based access (admin + tenant)</li>
          <li>Laravel + React + TypeScript</li>
        </ul>
      </div>
    </div>
  )
}

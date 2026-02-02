import { useState } from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { Button } from '../components/Button'
import { getErrorMessage } from '../utils/http'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setError('Please enter a valid email and password.')
      return
    }

    try {
      setLoading(true)
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin' : '/tenant')
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Login failed. Check credentials.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f2ee]">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 -translate-y-1/3 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-navy/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-soft">
            <span className="inline-grid h-9 w-9 place-items-center rounded-2xl bg-navy font-display text-sm font-bold text-white">RP</span>
            <div className="leading-tight">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">RentPay Portal</div>
              <div className="text-[10px] text-slate-400">Stripe‑verified rent payments</div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl">
              Rent payments, made simple for landlords and tenants.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Track rent charges, manage leases, and confirm payments with Stripe-powered receipts in one clean dashboard.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Live payment status', body: 'Webhook-confirmed receipts for accurate balances.' },
              { title: 'CSV import ready', body: 'Bring units, leases, and charges from spreadsheets.' },
              { title: 'Role-based access', body: 'Admins manage portfolios, tenants pay fast.' },
              { title: 'Stripe test mode', body: 'Safe demo environment for recruiting and sales.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-soft">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {['Laravel', 'React', 'Stripe'].map((item) => (
              <span key={item} className="rounded-full bg-white/80 px-3 py-1 text-slate-600 shadow-soft">{item}</span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-white/50 blur-xl" />
          <div className="relative rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur">
            <div className="mb-6">
              <h2 className="font-display text-2xl text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to manage rent payments and leases.</p>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="tenant@rentpay.test"
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="password"
                  required
                />
              </label>
              {error ? <div className="rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-800">{error}</div> : null}
              <Button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-6 rounded-2xl border border-stone/70 bg-white/70 p-4 text-xs text-slate-500">
              <p>Demo admin: admin@rentpay.test / password</p>
              <p>Demo tenant: tenant@rentpay.test / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

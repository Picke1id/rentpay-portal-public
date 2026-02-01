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
    <div className="grid min-h-screen grid-cols-1 gap-10 bg-gradient-to-br from-white via-sand to-stone p-10 lg:grid-cols-2">
      <div className="card flex flex-col gap-6 p-10">
        <div>
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="text-slate-500">Sign in to manage rent payments and leases.</p>
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="text-xs text-slate-500">
          <p>Demo admin: admin@rentpay.test / password</p>
          <p>Demo tenant: tenant@rentpay.test / password</p>
          <p>API: {import.meta.env.VITE_API_URL || 'not set'}</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="card max-w-md space-y-4 border border-white/60 bg-white/60 p-8">
          <h2 className="font-display text-2xl">RentPay Portal</h2>
          <p className="text-slate-500">Track rent charges, manage leases, and confirm payments via Stripe webhooks.</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {['Laravel', 'React', 'Stripe'].map((item) => (
              <span key={item} className="rounded-full bg-teal/10 px-3 py-1 text-teal">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

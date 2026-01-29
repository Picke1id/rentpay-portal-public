import { useState } from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { Button } from '../components/Button'

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
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div>
          <h1>Welcome back</h1>
          <p>Sign in to manage rent payments and leases.</p>
        </div>
        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="tenant@rentpay.test"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="password"
              required
            />
          </label>
          {error ? <div className="alert">{error}</div> : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="demo-hints">
          <p>Demo admin: admin@rentpay.test / password</p>
          <p>Demo tenant: tenant@rentpay.test / password</p>
        </div>
      </div>
      <div className="auth-side">
        <div className="glass">
          <h2>RentPay Portal</h2>
          <p>Track rent charges, manage leases, and confirm payments via Stripe webhooks.</p>
          <div className="pill-row">
            <span>Laravel</span>
            <span>React</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}

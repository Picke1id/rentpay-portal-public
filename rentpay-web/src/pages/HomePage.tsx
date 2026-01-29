import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const HomePage = () => {
  return (
    <div className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">RentPay Portal</p>
        <h1>Rent payments, verified by Stripe, designed for trust.</h1>
        <p>
          A full‑stack MVP showcasing admin and tenant experiences, automated charges,
          and webhook‑verified payment success.
        </p>
        <div className="hero-actions">
          <Link to="/login">
            <Button className="btn-primary">Sign in</Button>
          </Link>
          <Link to="/tenant">
            <Button className="btn-ghost">Tenant demo</Button>
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <div className="card">
          <h3>Today</h3>
          <p>Stripe events confirm payments before any balance updates.</p>
          <ul>
            <li>Webhook‑verified payment status</li>
            <li>Role‑based access (admin + tenant)</li>
            <li>Laravel + React + TypeScript</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

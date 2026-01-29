import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const CancelPage = () => {
  return (
    <div className="status-page">
      <h2>Payment canceled</h2>
      <p>No worries. You can retry the payment from your dashboard.</p>
      <Link to="/tenant">
        <Button className="btn-ghost">Return to dashboard</Button>
      </Link>
    </div>
  )
}

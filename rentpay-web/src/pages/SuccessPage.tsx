import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const SuccessPage = () => {
  return (
    <div className="status-page">
      <h2>Payment received</h2>
      <p>Thanks! Your payment is being confirmed via Stripe webhook.</p>
      <Link to="/tenant">
        <Button className="btn-primary">Back to dashboard</Button>
      </Link>
    </div>
  )
}

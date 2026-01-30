import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const CancelPage = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-white via-sand to-stone p-10 text-center">
      <div className="card space-y-4 p-10">
        <h2 className="font-display text-3xl">Payment canceled</h2>
        <p className="text-slate-500">No worries. You can retry the payment from your dashboard.</p>
        <Link to="/tenant">
          <Button className="btn-ghost">Return to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

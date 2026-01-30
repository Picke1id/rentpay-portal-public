import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const NotFoundPage = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-white via-sand to-stone p-10 text-center">
      <div className="card space-y-4 p-10">
        <h2 className="font-display text-3xl">Page not found</h2>
        <p className="text-slate-500">The page you requested does not exist.</p>
        <Link to="/">
          <Button className="btn-ghost">Back home</Button>
        </Link>
      </div>
    </div>
  )
}

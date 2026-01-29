import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

export const NotFoundPage = () => {
  return (
    <div className="status-page">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/">
        <Button className="btn-ghost">Back home</Button>
      </Link>
    </div>
  )
}

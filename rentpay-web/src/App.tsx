import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { TenantDashboard } from './pages/TenantDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { RequireAuth } from './components/RequireAuth'
import { SuccessPage } from './pages/SuccessPage'
import { CancelPage } from './pages/CancelPage'
import { NotFoundPage } from './pages/NotFoundPage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tenant/success" element={<SuccessPage />} />
      <Route path="/tenant/cancel" element={<CancelPage />} />
      <Route
        path="/tenant"
        element={
          <RequireAuth role="tenant">
            <TenantDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App

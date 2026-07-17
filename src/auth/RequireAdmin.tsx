import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAdmin() {
  const { isGroceriesAdmin } = useAuth()

  if (!isGroceriesAdmin) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}

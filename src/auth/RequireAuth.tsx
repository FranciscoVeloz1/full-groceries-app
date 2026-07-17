import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import styles from './RequireAuth.module.css'

export function RequireAuth() {
  const { status } = useAuth()

  if (status === 'bootstrapping') {
    return (
      <div className={styles.loading} role="status">
        Cargando…
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

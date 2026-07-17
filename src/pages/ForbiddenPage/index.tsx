import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import styles from './ForbiddenPage.module.css'

export function ForbiddenPage() {
  const { logout } = useAuth()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Acceso restringido</h1>
      <p className={styles.message}>
        Tu cuenta no tiene permiso para usar la app de mandado. Contacta a un administrador
        si necesitas acceso.
      </p>
      <div className={styles.actions}>
        <Link className={styles.linkBtn} to="/">
          Volver al inicio
        </Link>
        <button
          className={styles.logoutBtn}
          type="button"
          onClick={() => {
            void logout()
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

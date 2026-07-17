import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './AdminNavLink.module.css'

export function AdminNavLink() {
  return (
    <Link
      to="/admin/products"
      className={styles.link}
      aria-label="Administrar productos"
      title="Administrar productos"
    >
      <Package size={22} strokeWidth={2} aria-hidden="true" />
      <span className={styles.label}>Administrar</span>
    </Link>
  )
}

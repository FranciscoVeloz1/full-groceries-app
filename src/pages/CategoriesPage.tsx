import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/useAuth'
import { AdminNavLink } from '../components/AdminNavLink'
import { CategoryCard } from '../components/CategoryCard'
import { CartBadge } from '../components/CartBadge'
import { SearchBar } from '../components/SearchBar'
import { useCart } from '../hooks/useCart'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery'
import styles from './CategoriesPage.module.css'

export function CategoriesPage() {
  const navigate = useNavigate()
  const { canBrowseGroceries, isGroceriesAdmin } = useAuth()
  const { totalItems } = useCart()
  const { data, isLoading, isError, error } = useCategoriesQuery()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const categories = data ?? []
    if (!search) return categories
    const term = search.toLowerCase()
    return categories.filter((category) =>
      category.name.toLowerCase().includes(term)
    )
  }, [data, search])

  if (!canBrowseGroceries) {
    return <Navigate to="/forbidden" replace />
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>Cargando categorías…</p>
      </div>
    )
  }

  if (isError) {
    const message =
      error instanceof ApiError && error.status === 403
        ? 'Necesitas acceso a la app de mandado para ver las categorías.'
        : error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías.'

    return (
      <div className={styles.page}>
        <p className={styles.error}>{message}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        <div className={styles.headerActions}>
          {isGroceriesAdmin ? <AdminNavLink /> : null}
          <CartBadge
            count={totalItems}
            onClick={() => {
              navigate('/cart')
            }}
          />
        </div>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar categoría…"
      />

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          {search ? 'No se encontraron categorías.' : 'No hay categorías disponibles.'}
        </p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              onClick={() => {
                navigate(`/products/${category.id}`)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

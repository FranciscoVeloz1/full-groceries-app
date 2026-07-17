import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { GroceryProduct } from '../api/types'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/useAuth'
import { AdminNavLink } from '../components/AdminNavLink'
import { CartBadge } from '../components/CartBadge'
import { ProductCard } from '../components/ProductCard'
import { SearchBar } from '../components/SearchBar'
import { useCart } from '../hooks/useCart'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery'
import { useProductsQuery } from '../hooks/useProductsQuery'
import type { Product } from '../types'
import styles from './ProductListPage.module.css'

const EXTRAS_CATEGORY_NAME = 'Extras'

function toProduct(product: GroceryProduct): Product {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    categoryId: product.categoryId,
    price: product.price,
  }
}

export function ProductListPage() {
  const { categoryId = '' } = useParams()
  const navigate = useNavigate()
  const { isGroceriesAdmin } = useAuth()
  const { addToCart, addCustomItem, totalItems } = useCart()
  const [search, setSearch] = useState('')

  const categoriesQuery = useCategoriesQuery()
  const productsQuery = useProductsQuery({ categoryId })

  const categoryName =
    categoriesQuery.data?.find((category) => category.id === categoryId)?.name ??
    'Productos'

  const isExtrasCategory = categoryName === EXTRAS_CATEGORY_NAME

  const products = useMemo(() => {
    const items = productsQuery.data ?? []
    if (!search) return items

    const term = search.toLowerCase()
    return items.filter((product) => product.name.toLowerCase().includes(term))
  }, [productsQuery.data, search])

  const [customName, setCustomName] = useState('')
  const [customQty, setCustomQty] = useState('1')
  const [customPrice, setCustomPrice] = useState('')

  const handleAddCustom = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = customName.trim()
    const quantity = Number(customQty)
    const price = Number(customPrice)
    if (
      !trimmed ||
      Number.isNaN(quantity) ||
      quantity < 1 ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return
    }

    addCustomItem({ name: trimmed, quantity, price, categoryId })
    setCustomName('')
    setCustomQty('1')
    setCustomPrice('')
  }

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>Cargando productos…</p>
      </div>
    )
  }

  if (categoriesQuery.isError || productsQuery.isError) {
    const queryError = productsQuery.error ?? categoriesQuery.error
    const message =
      queryError instanceof ApiError && queryError.status === 403
        ? 'Necesitas acceso a la app de mandado para ver los productos.'
        : queryError instanceof Error
          ? queryError.message
          : 'No se pudieron cargar los productos.'

    return (
      <div className={styles.page}>
        <p className={styles.error}>{message}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => {
            navigate('/')
          }}
          aria-label="Volver"
          type="button"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>{categoryName}</h1>
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
        placeholder="Buscar producto…"
      />

      {isExtrasCategory ? (
        <form className={styles.addForm} onSubmit={handleAddCustom}>
          <h2 className={styles.addFormTitle}>Agregar artículo manualmente</h2>
          <div className={styles.addFormFields}>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Nombre</span>
              <input
                className={styles.addInput}
                type="text"
                placeholder="Nombre del producto"
                value={customName}
                onChange={(event) => {
                  setCustomName(event.target.value)
                }}
                required
              />
            </label>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Cantidad</span>
              <input
                className={styles.addInput}
                type="number"
                placeholder="1"
                min={1}
                value={customQty}
                onChange={(event) => {
                  setCustomQty(event.target.value)
                }}
                required
              />
            </label>
            <label className={styles.addField}>
              <span className={styles.addLabel}>Precio unitario</span>
              <input
                className={styles.addInput}
                type="number"
                placeholder="0.00"
                min={0}
                step={0.01}
                value={customPrice}
                onChange={(event) => {
                  setCustomPrice(event.target.value)
                }}
                required
              />
            </label>
          </div>
          <button className={styles.addBtn} type="submit">
            Agregar
          </button>
        </form>
      ) : null}

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={toProduct(product)}
            onAdd={addToCart}
          />
        ))}
        {products.length === 0 ? (
          <p className={styles.empty}>No se encontraron productos.</p>
        ) : null}
      </div>
    </div>
  )
}

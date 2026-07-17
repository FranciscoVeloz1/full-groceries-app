import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery'
import { exportToExcel } from '../utils/exportToExcel'
import { exportToJson } from '../utils/exportToJson'
import { parseGroceryList } from '../utils/groceryList'
import styles from './CartPage.module.css'

export function CartPage() {
  const navigate = useNavigate()
  const {
    items,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    importCart,
  } = useCart()
  const { data: categories = [] } = useCategoriesQuery()
  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const raw = await file.text()
      const parsed = parseGroceryList(raw)
      importCart(parsed)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo importar el archivo.')
    }

    event.target.value = ''
  }

  const grouped = new Map<string, typeof items>()
  for (const item of items) {
    const cat = item.product.categoryId
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => {
            navigate(-1)
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
        <h1 className={styles.title}>Carrito</h1>
        <div className={styles.headerActions}>
          <button className={styles.importBtn} onClick={handleImportClick} type="button">
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            hidden
          />
          {items.length > 0 ? (
            <button className={styles.clearBtn} onClick={clearCart} type="button">
              Vaciar
            </button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Tu carrito está vacío.</p>
      ) : (
        <>
          <div className={styles.list}>
            {Array.from(grouped.entries()).map(([catId, catItems]) => (
              <div key={catId} className={styles.group}>
                <h2 className={styles.categoryName}>
                  {categoryNameById[catId] ?? `Categoría ${catId}`}
                </h2>
                {catItems.map((item) => (
                  <div key={item.product.id} className={styles.item}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.product.name}</span>
                      <span className={styles.itemPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.controls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        aria-label="Disminuir cantidad"
                        type="button"
                      >
                        -
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        aria-label="Aumentar cantidad"
                        type="button"
                      >
                        +
                      </button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label={`Quitar ${item.product.name}`}
                        type="button"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total</span>
              <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.exportActions}>
              <button
                className={styles.exportBtn}
                onClick={() => exportToExcel(items, categoryNameById)}
                type="button"
              >
                Exportar Excel
              </button>
              <button
                className={styles.exportBtnSecondary}
                onClick={() => exportToJson(items)}
                type="button"
              >
                Exportar JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

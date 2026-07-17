import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GroceryProduct } from '../api/types'
import { ApiError } from '../api/http'
import { IconButton } from '../components/IconButton'
import { useCategoriesQuery } from '../hooks/useCategoriesQuery'
import { useProductMutations } from '../hooks/useProductMutations'
import { useProductsQuery } from '../hooks/useProductsQuery'
import styles from './AdminProductsPage.module.css'

type FormMode = 'create' | 'edit' | null

type ProductFormState = {
  name: string
  image: string
  price: string
  categoryId: string
}

const emptyForm: ProductFormState = {
  name: '',
  image: '',
  price: '',
  categoryId: '',
}

function toFormState(product: GroceryProduct): ProductFormState {
  return {
    name: product.name,
    image: product.image,
    price: String(product.price),
    categoryId: product.categoryId,
  }
}

export function AdminProductsPage() {
  const navigate = useNavigate()
  const { data: products, isLoading, isError, error } = useProductsQuery()
  const { data: categories } = useCategoriesQuery()
  const { createProduct, updateProduct, deleteProduct } = useProductMutations()

  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<GroceryProduct | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const sortedProducts = useMemo(() => {
    return [...(products ?? [])].toSorted((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const isSaving = createProduct.isPending || updateProduct.isPending
  const isDeleting = deleteProduct.isPending

  const openCreate = () => {
    setFormMode('create')
    setEditingId(null)
    setForm({
      ...emptyForm,
      categoryId: categories?.[0]?.id ?? '',
    })
    setStatusMessage(null)
  }

  const openEdit = (product: GroceryProduct) => {
    setFormMode('edit')
    setEditingId(product.id)
    setForm(toFormState(product))
    setStatusMessage(null)
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    const name = form.name.trim()
    const price = Number(form.price)
    const categoryId = form.categoryId

    if (!name || Number.isNaN(price) || price < 0 || !categoryId) {
      setStatusMessage('Completa nombre, precio y categoría válidos.')
      return
    }

    const body = {
      name,
      categoryId,
      price,
      ...(form.image.trim() ? { image: form.image.trim() } : {}),
    }

    try {
      if (formMode === 'create') {
        await createProduct.mutateAsync(body)
        setStatusMessage('Producto creado.')
      } else if (formMode === 'edit' && editingId) {
        await updateProduct.mutateAsync({ id: editingId, body })
        setStatusMessage('Producto actualizado.')
      }
      closeForm()
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo guardar el producto.'
      setStatusMessage(message)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteProduct.mutateAsync(deleteTarget.id)
      setStatusMessage('Producto eliminado.')
      setDeleteTarget(null)
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'No se pudo eliminar el producto.'
      setStatusMessage(message)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.status}>Cargando productos…</p>
      </div>
    )
  }

  if (isError) {
    const message =
      error instanceof ApiError && error.status === 403
        ? 'No tienes permiso para administrar productos.'
        : error instanceof Error
          ? error.message
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
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Productos</h1>
        <div className={styles.headerActions}>
          <IconButton label="Agregar producto" onClick={openCreate}>
            <Plus aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}

      {sortedProducts.length === 0 ? (
        <p className={styles.empty}>No hay productos. Usa el botón + para agregar uno.</p>
      ) : (
        <ul className={styles.list}>
          {sortedProducts.map((product) => (
            <li key={product.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <span className={styles.rowName}>{product.name}</span>
                <span className={styles.rowMeta}>
                  ${product.price.toFixed(2)} · {product.category.name}
                </span>
              </div>
              <div className={styles.rowActions}>
                <IconButton
                  label="Editar producto"
                  onClick={() => {
                    openEdit(product)
                  }}
                >
                  <Pencil aria-hidden="true" />
                </IconButton>
                <IconButton
                  label="Eliminar producto"
                  tone="danger"
                  onClick={() => {
                    setDeleteTarget(product)
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formMode ? (
        <div className={styles.overlay} role="presentation">
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <div className={styles.sheetHeader}>
              <h2 id="product-form-title" className={styles.sheetTitle}>
                {formMode === 'create' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <div className={styles.sheetActions}>
                <IconButton label="Cancelar" onClick={closeForm} disabled={isSaving}>
                  <X aria-hidden="true" />
                </IconButton>
                <IconButton
                  label="Guardar producto"
                  onClick={() => {
                    void handleSave()
                  }}
                  disabled={isSaving}
                >
                  <Check aria-hidden="true" />
                </IconButton>
              </div>
            </div>

            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault()
                void handleSave()
              }}
            >
              <label className={styles.field}>
                <span className={styles.label}>Nombre</span>
                <input
                  className={styles.input}
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Imagen (URL)</span>
                <input
                  className={styles.input}
                  type="text"
                  value={form.image}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, image: event.target.value }))
                  }}
                  placeholder="Opcional"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Precio</span>
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Categoría</span>
                <select
                  className={styles.select}
                  value={form.categoryId}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, categoryId: event.target.value }))
                  }}
                  required
                >
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className={styles.overlay} role="presentation">
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <h2 id="delete-dialog-title" className={styles.dialogTitle}>
              ¿Eliminar este producto?
            </h2>
            <p className={styles.dialogText}>{deleteTarget.name}</p>
            <div className={styles.dialogActions}>
              <IconButton
                label="Cancelar"
                onClick={() => {
                  setDeleteTarget(null)
                }}
                disabled={isDeleting}
              >
                <X aria-hidden="true" />
              </IconButton>
              <IconButton
                label="Confirmar eliminar"
                tone="danger"
                onClick={() => {
                  void handleConfirmDelete()
                }}
                disabled={isDeleting}
              >
                <Check aria-hidden="true" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

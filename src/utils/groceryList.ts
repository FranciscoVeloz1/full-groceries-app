import type { CartItem } from '../hooks/useCart'
import type { Product } from '../types'

export const GROCERY_LIST_VERSION = 1
export const FILE_BASENAME = 'lista-de-mandado'

export type GroceryListFile = {
  version: typeof GROCERY_LIST_VERSION
  exportedAt: string
  items: CartItem[]
}

export function serializeGroceryList(items: CartItem[]): GroceryListFile {
  return {
    version: GROCERY_LIST_VERSION,
    exportedAt: new Date().toISOString(),
    items,
  }
}

function parseProductId(value: unknown): string {
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }
  if (typeof value === 'number') {
    return String(value)
  }
  throw new Error('Product id must be a string or number.')
}

function parseCategoryId(product: Record<string, unknown>): string {
  if (typeof product.categoryId === 'string' && product.categoryId.trim() !== '') {
    return product.categoryId
  }
  if (typeof product.category === 'number') {
    return String(product.category)
  }
  throw new Error('Product categoryId must be a string or legacy category number.')
}

export function parseGroceryList(raw: string): CartItem[] {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('The file is not valid JSON.')
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid grocery list file format.')
  }

  const file = data as Record<string, unknown>

  if (file.version !== GROCERY_LIST_VERSION) {
    throw new Error(
      `Unsupported file version: ${file.version}. Expected version ${GROCERY_LIST_VERSION}.`
    )
  }

  if (!Array.isArray(file.items) || file.items.length === 0) {
    throw new Error('The file contains no items.')
  }

  const items: CartItem[] = []

  for (const entry of file.items) {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('Each item must be an object.')
    }

    const { product, quantity } = entry as Record<string, unknown>

    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Each item must have a positive numeric quantity.')
    }

    if (typeof product !== 'object' || product === null) {
      throw new Error('Each item must have a product object.')
    }

    const p = product as Record<string, unknown>

    if (typeof p.name !== 'string' || p.name.trim() === '') {
      throw new Error('Product name must be a non-empty string.')
    }
    if (typeof p.price !== 'number' || p.price < 0) {
      throw new Error('Product price must be a non-negative number.')
    }

    const validProduct: Product = {
      id: parseProductId(p.id),
      name: p.name,
      image: typeof p.image === 'string' ? p.image : '',
      categoryId: parseCategoryId(p),
      price: p.price,
    }

    items.push({ product: validProduct, quantity })
  }

  return items
}

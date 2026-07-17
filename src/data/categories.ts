import type { Category } from '../types'

export const categoryList: Category[] = [
  { id: '1', name: 'Limpieza personal', sortOrder: 1 },
  { id: '2', name: 'Limpieza global', sortOrder: 2 },
  { id: '3', name: 'Mascotas', sortOrder: 3 },
  { id: '4', name: 'Comida', sortOrder: 4 },
  { id: '5', name: 'Extras', sortOrder: 5 },
]

export const categoryNameById = Object.fromEntries(
  categoryList.map((category) => [category.id, category.name])
) as Record<string, string>

/** @deprecated Use categoryList for new code. Kept for static JSON catalog pages. */
export const categories = categoryNameById

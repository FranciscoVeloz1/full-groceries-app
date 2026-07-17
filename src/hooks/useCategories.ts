import { useMemo } from 'react'
import { categoryList } from '../data/categories'

export function useCategories() {
  const entries = useMemo(
    () => categoryList.map(({ id, name }) => ({ id, name })),
    []
  )

  return { categories: categoryList, entries }
}

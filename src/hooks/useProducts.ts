import { useMemo } from 'react'
import productsData from '../../data/products.json'
import type { Product } from '../types'

type LegacyProduct = {
  id: number
  name: string
  image: string
  category: number
  price: number
}

function toProduct(raw: LegacyProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    image: raw.image,
    categoryId: String(raw.category),
    price: raw.price,
  }
}

const products: Product[] = (productsData as LegacyProduct[]).map(toProduct)

export function useProducts(categoryId?: string, search?: string) {
  const filtered = useMemo(() => {
    let result = products

    if (categoryId) {
      result = result.filter((product) => product.categoryId === categoryId)
    }

    if (search) {
      const term = search.toLowerCase()
      result = result.filter((product) => product.name.toLowerCase().includes(term))
    }

    return result
  }, [categoryId, search])

  return filtered
}

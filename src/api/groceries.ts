import type { AuthorizedRequest } from './groceries-session'
import type { GroceryCategory, GroceryProduct } from './types'

type CategoriesResponse = { categories: GroceryCategory[] }
type ProductsResponse = { products: GroceryProduct[] }
type ProductResponse = { product: GroceryProduct }

export async function listCategories(
  request: AuthorizedRequest
): Promise<GroceryCategory[]> {
  const result = await request<CategoriesResponse>('/api/v1/groceries/categories')
  return result.categories
}

export async function listProducts(
  request: AuthorizedRequest,
  opts?: { categoryId?: string }
): Promise<GroceryProduct[]> {
  const params = new URLSearchParams()
  if (opts?.categoryId) {
    params.set('categoryId', opts.categoryId)
  }

  const query = params.toString()
  const path = query
    ? `/api/v1/groceries/products?${query}`
    : '/api/v1/groceries/products'

  const result = await request<ProductsResponse>(path)
  return result.products
}

export async function getProduct(
  request: AuthorizedRequest,
  id: string
): Promise<GroceryProduct> {
  const result = await request<ProductResponse>(`/api/v1/groceries/products/${id}`)
  return result.product
}

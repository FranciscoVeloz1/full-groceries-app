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

export type CreateProductBody = {
  name: string
  image?: string
  categoryId: string
  price: number
}

export type UpdateProductBody = Partial<{
  name: string
  image: string
  categoryId: string
  price: number
}>

export async function createProduct(
  request: AuthorizedRequest,
  body: CreateProductBody
): Promise<GroceryProduct> {
  const result = await request<ProductResponse>('/api/v1/groceries/products', {
    method: 'POST',
    body,
  })
  return result.product
}

export async function updateProduct(
  request: AuthorizedRequest,
  id: string,
  body: UpdateProductBody
): Promise<GroceryProduct> {
  const result = await request<ProductResponse>(`/api/v1/groceries/products/${id}`, {
    method: 'PATCH',
    body,
  })
  return result.product
}

export async function deleteProduct(
  request: AuthorizedRequest,
  id: string
): Promise<void> {
  await request<void>(`/api/v1/groceries/products/${id}`, {
    method: 'DELETE',
  })
}

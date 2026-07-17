import { useQuery } from '@tanstack/react-query'
import { listProducts } from '../api/groceries'
import { requireGroceriesApiSession } from '../api/groceries-session'
import { groceryKeys } from '../api/query-keys'
import { useAuth } from '../auth/useAuth'

type UseProductsQueryOptions = {
  categoryId?: string
}

export function useProductsQuery({ categoryId }: UseProductsQueryOptions = {}) {
  const { status, canBrowseGroceries } = useAuth()

  return useQuery({
    queryKey: groceryKeys.products(categoryId),
    queryFn: () => {
      const { request } = requireGroceriesApiSession()
      return listProducts(request, { categoryId })
    },
    enabled: status === 'authenticated' && canBrowseGroceries,
  })
}

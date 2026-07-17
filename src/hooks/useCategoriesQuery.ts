import { useQuery } from '@tanstack/react-query'
import { listCategories } from '../api/groceries'
import { requireGroceriesApiSession } from '../api/groceries-session'
import { groceryKeys } from '../api/query-keys'
import { useAuth } from '../auth/useAuth'

export function useCategoriesQuery() {
  const { status, canBrowseGroceries } = useAuth()

  return useQuery({
    queryKey: groceryKeys.categories(),
    queryFn: () => {
      const { request } = requireGroceriesApiSession()
      return listCategories(request)
    },
    enabled: status === 'authenticated' && canBrowseGroceries,
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CreateProductBody,
  type UpdateProductBody,
} from '../api/groceries'
import { requireGroceriesApiSession } from '../api/groceries-session'
import { groceryKeys } from '../api/query-keys'

export function useProductMutations() {
  const queryClient = useQueryClient()

  const invalidateProducts = () => {
    void queryClient.invalidateQueries({ queryKey: groceryKeys.all })
  }

  const createMutation = useMutation({
    mutationFn: (body: CreateProductBody) => {
      const { request } = requireGroceriesApiSession()
      return createProduct(request, body)
    },
    onSuccess: invalidateProducts,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductBody }) => {
      const { request } = requireGroceriesApiSession()
      return updateProduct(request, id, body)
    },
    onSuccess: invalidateProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const { request } = requireGroceriesApiSession()
      return deleteProduct(request, id)
    },
    onSuccess: invalidateProducts,
  })

  return {
    createProduct: createMutation,
    updateProduct: updateMutation,
    deleteProduct: deleteMutation,
  }
}

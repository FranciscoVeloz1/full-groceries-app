import { useContext } from 'react'
import { CartContext } from './cart-context'
import type { CartContextValue } from './useCartState'

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) {
    throw new Error('useCart must be used within CartProvider')
  }

  return value
}

export type { CartItem } from './useCartState'

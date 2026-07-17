import { type ReactNode } from 'react'
import { CartContext } from './cart-context'
import { useCartState } from './useCartState'

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const value = useCartState()
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

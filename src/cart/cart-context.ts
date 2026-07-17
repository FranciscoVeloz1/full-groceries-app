import { createContext } from 'react'
import type { CartContextValue } from './useCartState'

export const CartContext = createContext<CartContextValue | null>(null)

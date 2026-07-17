import { useCallback, useMemo, useRef, useState } from 'react'
import type { Product } from '../types'

export type CartItem = {
  product: Product
  quantity: number
}

export type CartContextValue = {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  addCustomItem: (item: {
    name: string
    quantity: number
    price: number
    categoryId: string
  }) => void
  importCart: (items: CartItem[]) => void
  totalItems: number
  totalPrice: number
}

export function useCartState(): CartContextValue {
  const [items, setItems] = useState<Map<string, CartItem>>(new Map())
  const customIdRef = useRef(0)

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const next = new Map(prev)
      const existing = next.get(product.id)

      if (existing) {
        next.set(product.id, { ...existing, quantity: existing.quantity + 1 })
      } else {
        next.set(product.id, { product, quantity: 1 })
      }

      return next
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const next = new Map(prev)
      next.delete(productId)

      return next
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = new Map(prev)

      if (quantity <= 0) {
        next.delete(productId)
      } else {
        const existing = next.get(productId)

        if (existing) {
          next.set(productId, { ...existing, quantity })
        }
      }
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems(new Map())
  }, [])

  const addCustomItem = useCallback(
    ({
      name,
      quantity,
      price,
      categoryId,
    }: {
      name: string
      quantity: number
      price: number
      categoryId: string
    }) => {
      customIdRef.current += 1
      const product: Product = {
        id: `custom-${customIdRef.current}`,
        name,
        image: '',
        categoryId,
        price,
      }
      setItems((prev) => {
        const next = new Map(prev)
        next.set(product.id, { product, quantity })
        return next
      })
    },
    []
  )

  const importCart = useCallback((incoming: CartItem[]) => {
    const next = new Map<string, CartItem>()
    for (const item of incoming) {
      const existing = next.get(item.product.id)
      if (existing) {
        next.set(item.product.id, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        })
      } else {
        next.set(item.product.id, item)
      }
    }
    setItems(next)
  }, [])

  const cartItems = useMemo(() => Array.from(items.values()), [items])

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  )

  return {
    items: cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addCustomItem,
    importCart,
    totalItems,
    totalPrice,
  }
}

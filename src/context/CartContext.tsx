'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, storage: string) => void
  updateQuantity: (productId: string, storage: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'smarttech_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // Ignore parse errors
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === newItem.product_id && i.storage === newItem.storage
      )
      if (existing) {
        return prev.map((i) =>
          i.product_id === newItem.product_id && i.storage === newItem.storage
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...prev, newItem]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, storage: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.storage === storage))
    )
  }, [])

  const updateQuantity = useCallback((productId: string, storage: string, quantity: number) => {
    if (quantity < 1) return
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId && i.storage === storage ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

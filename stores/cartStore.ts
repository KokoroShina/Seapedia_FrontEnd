import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types/order'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  syncWithApi: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (product: Product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.product_id === product.id)

        if (existingItem) {
          // Merge: update quantity
          const updatedItems = items.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
          set({ items: updatedItems, totalItems, totalPrice })
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(), // temporary id
            product_id: product.id,
            quantity,
            product,
          }
          const updatedItems = [...items, newItem]
          const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
          set({ items: updatedItems, totalItems, totalPrice })
        }
      },

      removeItem: (productId: number) => {
        const items = get().items.filter(item => item.product_id !== productId)
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        set({ items, totalItems, totalPrice })
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const items = get().items.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        )
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        set({ items, totalItems, totalPrice })
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 })
      },

      syncWithApi: async () => {
        // TODO: Implement API sync in P4
        // This will sync cart with backend API
      },
    }),
    {
      name: 'seapedia-cart',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
)

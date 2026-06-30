import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'
import type { CartItem } from '@/types/order'
import type { Product } from '@/types/product'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isSyncing: boolean
  currentStoreId: number | null
  currentStoreName: string | null
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  syncWithApi: () => Promise<void>
  hasItemsFromOtherStore: (storeId: number) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isSyncing: false,
      currentStoreId: null,
      currentStoreName: null,

      addItem: async (product: Product, quantity = 1) => {
        // 1. Update local state first (optimistic update)
        const items = get().items
        const existingItem = items.find(item => item.product_id === product.id)
        const currentStoreId = get().currentStoreId

        let updatedItems: CartItem[]

        // Check if item is from different store
        const isFromDifferentStore = currentStoreId && product.store_id && currentStoreId !== product.store_id

        if (existingItem) {
          // Merge: update quantity
          updatedItems = items.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now(), // temporary id, will be replaced by API response
            product_id: product.id,
            quantity,
            product,
          }
          updatedItems = [...items, newItem]
        }

        // Update store info
        set({
          currentStoreId: product.store_id,
          currentStoreName: product.store?.name || null,
        })

        // Calculate totals
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = updatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)

        // 2. Update local state immediately
        set({ items: updatedItems, totalItems, totalPrice, currentStoreId: product.store_id, currentStoreName: product.store?.name || null })

        // 3. Sync to API
        try {
          const response = await api.post('/cart/items', {
            product_id: product.id,
            quantity,
          })

          // Update with real id from API if needed
          if (response.data?.data?.id) {
            const apiItem = response.data.data
            const newItems = updatedItems.map(item =>
              item.product_id === product.id
                ? { ...item, id: apiItem.id }
                : item
            )
            set({ items: newItems })
          }
        } catch (error) {
          console.error('Failed to sync cart to API:', error)
          // Item tetap di localStorage, user tetap bisa lihat
          // TODO: Show toast notification for error
        }
      },

      hasItemsFromOtherStore: (storeId: number) => {
        const currentStore = get().currentStoreId
        return currentStore !== null && currentStore !== storeId && get().items.length > 0
      },

      removeItem: (productId: number) => {
        const items = get().items.filter(item => item.product_id !== productId)
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)

        // Clear store info if cart is empty
        if (items.length === 0) {
          set({ items, totalItems, totalPrice, currentStoreId: null, currentStoreName: null })
        } else {
          set({ items, totalItems, totalPrice })
        }
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
        const totalPrice = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
        set({ items, totalItems, totalPrice })
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0, currentStoreId: null, currentStoreName: null })
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
        currentStoreId: state.currentStoreId,
        currentStoreName: state.currentStoreName,
      }),
    }
  )
)

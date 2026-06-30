export type OrderStatus =
  | 'sedang_dikemas'
  | 'menunggu_pengirim'
  | 'sedang_dikirim'
  | 'pesanan_selesai'
  | 'dikembalikan'

export type DeliveryMethod = 'instant' | 'next_day' | 'regular'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  store_id: number
  status: OrderStatus
  delivery_method: DeliveryMethod
  delivery_fee: number
  subtotal: number
  ppn: number
  discount_amount: number
  total: number
  voucher_code: string | null
  due_at: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
  store?: Store
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: Product
  store_id?: number
}

export interface Cart {
  items: CartItem[]
  store: Store | null
  subtotal: number
}

export interface Delivery {
  id: number
  order_id: number
  driver_id: number | null
  status: string
  due_at: string
  delivery_method: DeliveryMethod
  earning: number
  order?: Order
}

// Re-export Store and Product for convenience
import type { Store } from './product'
import type { Product } from './product'

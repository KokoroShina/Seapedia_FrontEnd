export interface Store {
  id: number
  user_id: number
  name: string
  description: string
  address: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  store_id?: number
  name: string
  description?: string
  price: number | string
  stock: number
  image?: string
  image_url?: string | null
  category_id?: number
  created_at?: string
  updated_at?: string
  store?: Store
  average_rating?: number
  review_count?: number
  sold_count?: number
}

export interface Review {
  id: number
  product_id: number
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

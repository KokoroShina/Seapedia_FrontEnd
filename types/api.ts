export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
  per_page: number
  total: number
}

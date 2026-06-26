import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { PaginatedResponse } from '@/types/api'
import type { Product } from '@/types/product'

export interface UseProductsParams {
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating'
  category?: string
  page?: number
  per_page?: number
}

export function useProducts(params: UseProductsParams = {}) {
  const {
    search,
    sort = 'newest',
    category,
    page = 1,
    per_page = 8,
  } = params

  return useQuery({
    queryKey: ['products', { search, sort, category, page, per_page }],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (search) queryParams.append('search', search)
      if (sort) queryParams.append('sort', sort)
      if (category) queryParams.append('category', category)
      queryParams.append('page', String(page))
      queryParams.append('per_page', String(per_page))

      const res = await api.get<ApiResponse<PaginatedResponse<Product>>>(
        `/products?${queryParams.toString()}`
      )
      return res.data.data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

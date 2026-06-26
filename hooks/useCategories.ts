import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  image?: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories')
      return res.data.data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
}

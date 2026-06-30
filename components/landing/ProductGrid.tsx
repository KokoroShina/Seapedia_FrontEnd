'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Package, SlidersHorizontal } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/shared/ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import type { Product } from '@/types/product'

interface ProductGridProps {
  search?: string
  category?: string
  sort?: string
}

// No mock products - use API data only

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'rating', label: 'Rating Tertinggi' },
]

export default function ProductGrid({ search, category, sort = 'newest' }: ProductGridProps) {
  const [page, setPage] = useState(1)
  const [localSort, setLocalSort] = useState(sort)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const { data, isLoading, error, isFetching } = useProducts({
    search,
    category,
    sort: localSort as 'newest' | 'price_asc' | 'price_desc' | 'rating',
    page,
    per_page: 8,
  })

  const handleSortChange = (newSort: string) => {
    setLocalSort(newSort)
    setPage(1)
    setIsSortOpen(false)
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 bg-white rounded-2xl border border-ocean-100"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-red-400" />
        </div>
        <p className="text-red-500 mb-4 font-medium">Gagal memuat produk. Silakan coba lagi.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
        >
          Refresh
        </button>
      </motion.div>
    )
  }

  // Use API data if available, otherwise use empty array
  const products: Product[] = data?.data && data.data.length > 0 ? data.data : []

  const selectedSortLabel = sortOptions.find(opt => opt.value === localSort)?.label || 'Terbaru'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Enhanced Sort Dropdown */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ocean-500">
          {isLoading ? 'Memuat...' : products.length > 0 ? `${products.length} produk ditemukan` : 'Tidak ada produk'}
        </p>

        {/* Custom Sort Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-ocean-200 rounded-xl text-sm font-medium text-ocean-700 hover:border-ocean-400 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-ocean-500" />
            <span>Urutkan: <span className="font-semibold text-ocean-600">{selectedSortLabel}</span></span>
            <ChevronRight className={`w-4 h-4 text-ocean-400 transition-transform ${isSortOpen ? 'rotate-90' : ''}`} />
          </motion.button>

          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsSortOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-ocean-100 overflow-hidden z-20"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      localSort === option.value
                        ? 'bg-ocean-50 text-ocean-700 font-semibold'
                        : 'text-ocean-600 hover:bg-ocean-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      localSort === option.value
                        ? 'border-ocean-500 bg-ocean-500'
                        : 'border-ocean-300'
                    }`}>
                      {localSort === option.value && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {option.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading || isFetching ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SkeletonCard key={i} />
            </motion.div>
          ))
        ) : products.length > 0 ? (
          // Products
          products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-ocean-100"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-ocean-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-ocean-400" />
            </div>
            <p className="text-ocean-600 text-lg font-semibold mb-2">Tidak ada produk yang ditemukan</p>
            <p className="text-ocean-400 text-sm">Coba ubah kata kunci atau filter lainnya</p>
          </motion.div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {data && data.last_page > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 py-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="p-2.5 rounded-xl border-2 border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50 hover:border-ocean-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-1 px-3">
            {Array.from({ length: Math.min(data.last_page, 5) }).map((_, i) => {
              let pageNum: number
              if (data.last_page <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= data.last_page - 2) {
                pageNum = data.last_page - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-ocean-500 to-cyan-500 text-white shadow-lg shadow-ocean-500/30'
                      : 'bg-white border-2 border-ocean-200 text-ocean-600 hover:border-ocean-400'
                  }`}
                >
                  {pageNum}
                </motion.button>
              )
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
            disabled={page === data.last_page || isFetching}
            className="p-2.5 rounded-xl border-2 border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50 hover:border-ocean-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}
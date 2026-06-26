'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import ProductCard from '@/components/shared/ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import type { Product } from '@/types/product'

interface ProductGridProps {
  search?: string
  category?: string
  sort?: string
}

// Mock products with Unsplash images (fallback when API is empty)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    store_id: 1,
    name: "Premium Cotton White T-Shirt",
    description: "High quality cotton t-shirt",
    price: 89000,
    stock: 50,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    average_rating: 4.8,
    review_count: 124,
    store: { id: 1, user_id: 1, name: "Fashion House", description: "Trusted fashion store", address: "Jakarta", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 2,
    store_id: 2,
    name: "Kakadu Hydrating Face Serum",
    description: "Deep hydration for skin",
    price: 158000,
    stock: 30,
    image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    average_rating: 4.9,
    review_count: 89,
    store: { id: 2, user_id: 2, name: "Beauty Lab", description: "Beauty skincare store", address: "Bandung", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 3,
    store_id: 3,
    name: "Wireless Earbuds Pro X3",
    description: "Premium wireless earbuds",
    price: 389000,
    stock: 25,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    average_rating: 4.7,
    review_count: 203,
    store: { id: 3, user_id: 3, name: "Tech Zone", description: "Gadgets & electronics", address: "Surabaya", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 4,
    store_id: 4,
    name: "Minimalist Ceramic Vase",
    description: "Beautiful ceramic vase",
    price: 125000,
    stock: 15,
    image_url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop",
    average_rating: 4.6,
    review_count: 56,
    store: { id: 4, user_id: 4, name: "Home Decor ID", description: "Home decoration store", address: "Yogyakarta", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 5,
    store_id: 5,
    name: "Smartphone Case Crystal Clear",
    description: "Clear phone case",
    price: 45000,
    stock: 100,
    image_url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop",
    average_rating: 4.5,
    review_count: 312,
    store: { id: 5, user_id: 5, name: "Gadget Store", description: "Phone accessories store", address: "Jakarta", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 6,
    store_id: 6,
    name: "Adjustable Yoga Mat Blue",
    description: "Premium yoga mat",
    price: 175000,
    stock: 40,
    image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    average_rating: 4.8,
    review_count: 78,
    store: { id: 6, user_id: 6, name: "Fit Life", description: "Fitness equipment store", address: "Bali", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 7,
    store_id: 7,
    name: "Electric Coffee Grinder",
    description: "Professional coffee grinder",
    price: 295000,
    stock: 20,
    image_url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop",
    average_rating: 4.7,
    review_count: 145,
    store: { id: 7, user_id: 7, name: "Coffee Masters", description: "Coffee equipment store", address: "Jakarta", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  },
  {
    id: 8,
    store_id: 8,
    name: "Canvas Tote Bag Aesthetic",
    description: "Stylish canvas bag",
    price: 65000,
    stock: 60,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
    average_rating: 4.6,
    review_count: 98,
    store: { id: 8, user_id: 8, name: "Bag House", description: "Bag & accessories store", address: "Semarang", created_at: "", updated_at: "" },
    created_at: "",
    updated_at: ""
  }
]

export default function ProductGrid({ search, category, sort = 'newest' }: ProductGridProps) {
  const [page, setPage] = useState(1)
  const [localSort, setLocalSort] = useState(sort)

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
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Gagal memuat produk. Silakan coba lagi.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-ocean-500 text-white rounded-lg hover:bg-ocean-600"
        >
          Refresh
        </button>
      </div>
    )
  }

  // Use API data if available, otherwise use mock data
  const products: Product[] = data?.data && data.data.length > 0 ? data.data : MOCK_PRODUCTS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Sort Dropdown */}
      <div className="flex justify-end">
        <select
          value={localSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-ocean-200 bg-white text-sm text-ocean-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 cursor-pointer"
        >
          <option value="newest">Terbaru</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading || isFetching ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : products.length > 0 ? (
          // Products
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-16 h-16 text-ocean-200 mb-4" />
            <p className="text-ocean-400 text-lg mb-2">Tidak ada produk yang ditemukan</p>
            <p className="text-ocean-300 text-sm">Coba ubah kata kunci atau filter lainnya</p>
          </div>
        )}
      </div>

      {/* Pagination - only show when using API data */}
      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="p-2 rounded-lg border border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-ocean-600 px-4">
            Halaman {data.current_page} dari {data.last_page}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
            disabled={page === data.last_page || isFetching}
            className="p-2 rounded-lg border border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

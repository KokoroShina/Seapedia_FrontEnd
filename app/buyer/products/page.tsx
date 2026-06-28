'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  Package, Search, ChevronLeft, ChevronRight, Store as StoreIcon
} from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/components/animations/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Check } from 'lucide-react'

interface Product {
  id: number
  store_id: number
  name: string
  description: string
  price: string
  stock: number
  image: string | null
  store?: {
    id: number
    name: string
  }
}

interface ProductsData {
  current_page: number
  data: Product[]
  total: number
  per_page: number
  last_page: number
}

export default function BuyerProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set())

  const { showToast } = useToast()
  const addItem = useCartStore((state) => state.addItem)

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    setTimeout(() => {
      setDebouncedSearch(value)
    }, 500)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['buyer-products', page, debouncedSearch, storeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (storeFilter) params.append('store_id', storeFilter)
      const res = await api.get<ApiResponse<ProductsData>>(`/products?${params.toString()}`)
      return res.data.data
    },
  })

  const { data: stores } = useQuery({
    queryKey: ['stores-list'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: { id: number; name: string }[] }>>('/stores')
      return res.data.data?.data || []
    },
  })

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      store_id: product.store_id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      image_url: product.image,
      created_at: '',
      updated_at: '',
      store: product.store ? {
        id: product.store.id,
        user_id: 0,
        name: product.store.name,
        description: '',
        address: '',
        created_at: '',
        updated_at: ''
      } : undefined
    }, 1)
    showToast('success', 'Ditambahkan!', `${product.name} masuk ke keranjang`)
    setAddedProducts(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedProducts(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2000)
  }

  const products = data?.data || []
  const totalPages = data?.last_page || 1
  const totalProducts = data?.total || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Produk</h1>
          <p className="text-slate-500 mt-1">Temukan produk seafood favorit kamu</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
              />
            </div>

            {/* Store Filter */}
            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-slate-600"
            >
              <option value="">Semua Toko</option>
              {stores?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500">
            {isLoading ? 'Memuat...' : `${totalProducts} produk ditemukan`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="aspect-square bg-slate-100 rounded-xl animate-pulse mb-4" />
                <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse mb-2" />
                <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              {search ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
            </h2>
            <p className="text-slate-500">
              {search
                ? 'Coba kata kunci lain atau filter toko berbeda'
                : 'Saat ini belum ada produk yang tersedia'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const isOutOfStock = product.stock === 0
                const isAdded = addedProducts.has(product.id)

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-ocean-100 hover:border-ocean-200 transition-all duration-300 cursor-pointer"
                  >
                    {/* Product Image */}
                    <Link href={`/buyer/products/${product.id}`}>
                      <div className="relative aspect-square bg-gradient-to-br from-ocean-50 to-cyan-50 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-ocean-200">
                            <Package className="w-16 h-16 mb-2" />
                            <span className="text-sm">No Image</span>
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                            <div className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg">
                              Stok Habis
                            </div>
                          </div>
                        )}

                        {/* Store Badge */}
                        {product.store && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-ocean-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow">
                            {product.store.name}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <Link href={`/buyer/products/${product.id}`}>
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] group-hover:text-ocean-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2">
                        <p className="text-lg font-black bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatRupiah(parseFloat(product.price))}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-500 truncate max-w-[60%]">
                          {product.store?.name || 'Toko'}
                        </span>
                        <span className={`text-xs font-medium ${
                          isOutOfStock ? 'text-red-500' : 'text-green-600'
                        }`}>
                          {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stock}`}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock || isAdded}
                        whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
                        whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : isAdded
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-gradient-to-r from-ocean-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-ocean-500/30'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isAdded ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Ditambahkan!
                            </motion.div>
                          ) : (
                            <motion.div
                              key="add"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {isOutOfStock ? 'Stok Habis' : 'Keranjang'}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-ocean-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

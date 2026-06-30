'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  Plus, Edit2, Trash2, Package, Search,
  ChevronLeft, ChevronRight, AlertTriangle, X
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface Product {
  id: number
  store_id: number
  name: string
  description: string
  price: string
  stock: number
  image?: string
  image_url?: string | null
  created_at: string
  updated_at: string
}

export default function SellerProductsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      const res = await api.get<ApiResponse<{ data: Product[]; total: number; per_page: number }>>(
        `/seller/products?${params.toString()}`
      )
      return res.data.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/seller/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus produk')
    },
  })

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price)
  }

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const products = data?.data || []
  const totalPages = data ? Math.ceil(data.total / data.per_page) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Produk Saya</h1>
            <p className="text-slate-500 mt-1">Kelola produk di toko kamu</p>
          </div>
          <Link
            href="/seller/products/create"
            className="flex items-center gap-2 bg-ocean-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
          >
            <Plus className="w-5 h-5" />
            Tambah Produk
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="aspect-square bg-slate-100 rounded-xl animate-pulse mb-4" />
                <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
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
            <p className="text-slate-500 mb-6">
              {search ? 'Coba kata kunci lain' : 'Mulai tambahkan produk pertama kamu'}
            </p>
            {!search && (
              <Link
                href="/seller/products/create"
                className="inline-flex items-center gap-2 bg-ocean-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah Produk
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-slate-100">
                    {product.image || product.image_url ? (
                      <img
                        src={getImageUrl(product.image || product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Low Stock Badge */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Stok Rendah
                      </div>
                    )}
                    
                    {/* Out of Stock Badge */}
                    {product.stock === 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                        Stok Habis
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                        className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-ocean-600 mb-2">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        product.stock === 0 
                          ? 'text-red-500' 
                          : product.stock <= 5 
                            ? 'text-amber-500' 
                            : 'text-green-600'
                      }`}>
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-slate-600">
                  Halaman {page} dari {totalPages}
                </span>
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

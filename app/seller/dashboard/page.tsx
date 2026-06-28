'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { 
  Store, Package, ShoppingBag, TrendingUp, 
  ChevronRight, Clock, AlertCircle
} from 'lucide-react'

interface StoreData {
  id: number
  name: string
  description: string
  image: string | null
}

interface OrderSummary {
  total_orders: number
  pending_orders: number
  completed_orders: number
}

interface ProductSummary {
  total_products: number
  low_stock: number
}

export default function SellerDashboardPage() {
  // Fetch store data
  const { data: store } = useQuery({
    queryKey: ['seller-store'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<StoreData>>('/seller/store')
      return res.data.data
    },
  })

  // Fetch orders summary
  const { data: ordersSummary } = useQuery({
    queryKey: ['seller-orders-summary'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrderSummary>>('/seller/orders/summary')
      return res.data.data
    },
  })

  // Fetch products summary
  const { data: productsSummary } = useQuery({
    queryKey: ['seller-products-summary'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ProductSummary>>('/seller/products/summary')
      return res.data.data
    },
  })

  const stats = [
    {
      title: 'Total Pesanan',
      value: ordersSummary?.total_orders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      href: '/seller/orders',
    },
    {
      title: 'Pesanan Pending',
      value: ordersSummary?.pending_orders || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      href: '/seller/orders?status=sedang_dikemas',
    },
    {
      title: 'Produk Saya',
      value: productsSummary?.total_products || 0,
      icon: Package,
      color: 'bg-green-500',
      href: '/seller/products',
    },
    {
      title: 'Stok Rendah',
      value: productsSummary?.low_stock || 0,
      icon: AlertCircle,
      color: 'bg-red-500',
      href: '/seller/products',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Seller Dashboard</h1>
          <p className="text-slate-500 mt-1">Selamat datang di dashboard penjual</p>
        </div>

        {/* Store Info Card */}
        {store ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{store.name}</h2>
                <p className="text-slate-500 text-sm">{store.description || 'Tidak ada deskripsi'}</p>
              </div>
              <Link
                href="/seller/store"
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Edit Toko
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-amber-800">Toko Belum Dibuat</h2>
                <p className="text-amber-600 text-sm">Buat toko terlebih dahulu untuk mulai menjual</p>
              </div>
              <Link
                href="/seller/store"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                Buat Toko
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm flex items-center gap-1 group-hover:text-ocean-600">
                  {stat.title}
                  <ChevronRight className="w-4 h-4" />
                </p>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                href="/seller/products/create"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Tambah Produk Baru</p>
                  <p className="text-slate-500 text-sm">Tambahkan produk ke toko</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600" />
              </Link>
              
              <Link
                href="/seller/orders?status=sedang_dikemas"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Proses Pesanan</p>
                  <p className="text-slate-500 text-sm">Kemas & kirim pesanan</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tips Penjual</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💡</span>
                </div>
                <p className="text-slate-600 text-sm">Pastikan selalu update stok produk agar pembeli tidak kecewa</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">📦</span>
                </div>
                <p className="text-slate-600 text-sm">Proses pesanan secepat mungkin untuk rating terbaik</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⭐</span>
                </div>
                <p className="text-slate-600 text-sm">Respon cepat terhadap pertanyaan pembeli</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

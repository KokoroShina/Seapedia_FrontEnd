'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { 
  Bike, Package, Clock, CheckCircle, 
  ChevronRight, Wallet, History
} from 'lucide-react'

interface ActiveDelivery {
  id: number
  order_id: number
  status: string
  taken_at: string
  due_at: string
  order: {
    id: number
    total: string
    delivery_method: string
    buyer: {
      name: string
      phone: string
    }
    address: {
      recipient_name: string
      phone: string
      address: string
    }
  }
}

interface DashboardStats {
  total_deliveries: number
  completed_deliveries: number
  total_earnings: number
}

export default function DriverDashboardPage() {
  // Fetch active delivery
  const { data: activeDelivery, isLoading: activeLoading } = useQuery({
    queryKey: ['driver-active-delivery'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ActiveDelivery | null>>('/driver/jobs/active')
      return res.data.data
    },
  })

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/driver/dashboard')
      return res.data.data
    },
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'instant': return '🚀'
      case 'next_day': return '📦'
      case 'regular': return '🚚'
      default: return '📦'
    }
  }

  const getTimeRemaining = (dueAt: string) => {
    const now = new Date()
    const due = new Date(dueAt)
    const diff = due.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) return 'Terlambat!'
    if (hours > 0) return `${hours}j ${minutes}m tersisa`
    return `${minutes}m tersisa`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Driver Dashboard</h1>
          <p className="text-slate-500 mt-1">Selamat datang, driver! 👋</p>
        </div>

        {/* Active Delivery Card */}
        {activeDelivery ? (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Bike className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Delivery Aktif</p>
                  <p className="text-xl font-bold">Order #{activeDelivery.order_id}</p>
                </div>
              </div>
              <span className="text-3xl">{getDeliveryIcon(activeDelivery.order.delivery_method)}</span>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm">Waktu tersisa</span>
                <span className="font-bold">{getTimeRemaining(activeDelivery.due_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span>📍</span>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Alamat Pengiriman</p>
                  <p className="font-medium">{activeDelivery.order.address.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span>👤</span>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Penerima</p>
                  <p className="font-medium">{activeDelivery.order.address.recipient_name} • {activeDelivery.order.address.phone}</p>
                </div>
              </div>
            </div>

            <Link
              href="/driver/active"
              className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Package className="w-5 h-5" />
              Lihat Detail & Selesaikan
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-green-100 text-sm">Status</p>
                <p className="text-2xl font-bold">Siap Mengantar!</p>
              </div>
            </div>
            <p className="text-green-100 mt-4 mb-6">
              Saat ini tidak ada delivery aktif. Ambil job baru untuk mulai mengantarkan.
            </p>
            <Link
              href="/driver/jobs"
              className="w-full flex items-center justify-center gap-2 bg-white text-green-600 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
            >
              <Package className="w-5 h-5" />
              Cari Job Baru
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.total_deliveries || 0}</p>
            <p className="text-slate-500 text-sm">Total Delivery</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.completed_deliveries || 0}</p>
            <p className="text-slate-500 text-sm">Selesai</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatPrice(stats?.total_earnings || 0)}</p>
            <p className="text-slate-500 text-sm">Total Earning</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/driver/jobs"
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-ocean-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">Job Tersedia</p>
                <p className="text-slate-500 text-sm">Lihat job yang bisa diambil</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-ocean-600" />
            </div>
          </Link>

          <Link
            href="/driver/history"
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">Riwayat</p>
                <p className="text-slate-500 text-sm">Lihat delivery yang sudah selesai</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

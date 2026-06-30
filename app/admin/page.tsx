'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import {
  Users, ShoppingBag, Package, Wallet,
  TrendingUp, Clock, AlertTriangle, CheckCircle,
  Store, Truck, Gift, ArrowRight
} from 'lucide-react'

interface DashboardStats {
  total_users: number
  buyers: number
  sellers: number
  drivers: number
  total_stores: number
  total_products: number
  low_stock_products: number
  out_of_stock_products: number
  total_orders: number
  pending_orders: number
  shipping_orders: number
  completed_orders: number
  available_jobs: number
  active_deliveries: number
  total_wallet_balance: number
  recent_orders: RecentOrder[]
}

interface RecentOrder {
  id: number
  buyer_name: string
  store_name: string
  total: string
  status: string
  created_at: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pesanan_selesai':
      return 'bg-green-100 text-green-700'
    case 'sedang_dikirim':
      return 'bg-blue-100 text-blue-700'
    case 'menunggu_pengirim':
      return 'bg-purple-100 text-purple-700'
    case 'sedang_dikemas':
      return 'bg-yellow-100 text-yellow-700'
    case 'dikembalikan':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pesanan_selesai': return 'Selesai'
    case 'sedang_dikirim': return 'Dikirim'
    case 'menunggu_pengirim': return 'Menunggu Driver'
    case 'sedang_dikemas': return 'Dikemas'
    case 'dikembalikan': return 'Dikembalikan'
    default: return status
  }
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>('/admin/stats')
      return res.data.data
    },
  })

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numPrice)
  }

  const statCards = [
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Stores', value: stats?.total_stores || 0, icon: Store, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'from-purple-500 to-purple-600' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'from-green-500 to-green-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Selamat datang di panel administrator Seapedia</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.title}</p>
                </div>
              )
            })}
          </div>

          {/* Role Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.buyers || 0}</p>
                <p className="text-xs text-slate-500">Buyers</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.sellers || 0}</p>
                <p className="text-xs text-slate-500">Sellers</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats?.drivers || 0}</p>
                <p className="text-xs text-slate-500">Drivers</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{formatPrice(stats?.total_wallet_balance || 0)}</p>
                <p className="text-xs text-slate-500">Total Balance</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {(stats?.low_stock_products || 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Produk Stok Rendah</p>
                <p className="text-sm text-amber-600">{stats?.low_stock_products} produk hampir habis stok</p>
              </div>
              <Link href="/admin/categories" className="text-amber-700 hover:text-amber-800 text-sm font-medium">
                Lihat →
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/vouchers" className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white hover:shadow-lg transition-all">
              <Gift className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Kelola Voucher</h3>
              <p className="text-white/80 text-sm">Buat & edit voucher</p>
            </Link>
            <Link href="/admin/promos" className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all">
              <TrendingUp className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Kelola Promo</h3>
              <p className="text-white/80 text-sm">Promo otomatis checkout</p>
            </Link>
            <Link href="/admin/time-simulation" className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all">
              <Clock className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Time Simulation</h3>
              <p className="text-white/80 text-sm">Test overdue orders</p>
            </Link>
            <Link href="/admin/categories" className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white hover:shadow-lg transition-all">
              <Package className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Kategori</h3>
              <p className="text-white/80 text-sm">Kelola kategori produk</p>
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Pesanan Terbaru</h2>
                <p className="text-slate-500 text-sm">Monitoring pesanan masuk</p>
              </div>
              <Link href="/admin/orders" className="text-ocean-500 hover:text-ocean-600 font-medium text-sm flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stats?.recent_orders && stats.recent_orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Pembeli</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Toko</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.slice(0, 5).map((order: RecentOrder) => (
                      <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-800">#{order.id}</td>
                        <td className="py-3 px-4 text-slate-600">{order.buyer_name}</td>
                        <td className="py-3 px-4 text-slate-600">{order.store_name}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800">{formatPrice(order.total)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Belum ada pesanan</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

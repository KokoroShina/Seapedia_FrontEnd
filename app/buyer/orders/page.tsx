'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck, Store, Star } from 'lucide-react'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_price: string
  quantity: number
  subtotal: string
  image?: string
  product?: { image?: string }
}

interface Order {
  id: number
  status: string
  total: string
  subtotal: string
  discount_amount: string
  delivery_method: string
  created_at: string
  store: {
    name: string
  }
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  menunggu_pembayaran: { label: 'Menunggu Pembayaran', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock },
  sedang_dikemas: { label: 'Sedang Dikemas', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Package },
  menunggu_pengirim: { label: 'Menunggu Pengirim', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Truck },
  sedang_dikirim: { label: 'Sedang Dikirim', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: Truck },
  pesanan_selesai: { label: 'Selesai', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle },
  dikembalikan: { label: 'Dikembalikan', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  dibatalkan: { label: 'Dibatalkan', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: Order[] }>>('/orders')
      return res.data.data?.data || []
    },
  })

  const formatPrice = (price: string | number | null | undefined) => {
    const num = typeof price === 'string' ? parseFloat(price) : typeof price === 'number' ? price : 0
    if (isNaN(num)) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'menunggu_pembayaran', label: 'Menunggu' },
    { id: 'sedang_dikemas', label: 'Dikemas' },
    { id: 'sedang_dikirim', label: 'Dikirim' },
    { id: 'pesanan_selesai', label: 'Selesai' },
    { id: 'dikembalikan', label: 'Dikembalikan' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
          Riwayat Pesanan
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-ocean-600 border-b-2 border-ocean-500 bg-ocean-50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-4" />
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !filteredOrders || filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                {activeTab === 'all' ? 'Belum Ada Pesanan' : 'Tidak Ada Pesanan'}
              </h2>
              <p className="text-slate-500 mb-6">
                {activeTab === 'all'
                  ? 'Kamu belum pernah melakukan pesanan'
                  : 'Tidak ada pesanan dengan status ini'}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            // Orders list
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || {
                  label: order.status,
                  color: 'text-slate-700',
                  bg: 'bg-slate-50',
                  border: 'border-slate-200',
                  icon: Package,
                }
                const StatusIcon = status.icon

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border ${status.border} overflow-hidden hover:shadow-md transition-all`}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{order.store?.name}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-4 space-y-3">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.product?.image ? (
                              <img src={item.product.image} alt={item.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 line-clamp-1">{item.product_name}</p>
                            <p className="text-sm text-slate-500">{item.quantity}x</p>
                            <p className="text-sm font-semibold text-ocean-600">
                              {formatPrice((typeof item.product_price === 'string' ? parseFloat(item.product_price) || 0 : (item.product_price || 0)) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-sm text-slate-500">
                          +{order.items.length - 3} produk lainnya
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-4 bg-slate-50 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                          <p className="font-bold text-lg text-slate-800">
                            {formatPrice(order.total)}
                            {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                              <span className="ml-2 text-sm font-normal text-green-600">
                                (-{formatPrice(order.discount_amount)})
                              </span>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/buyer/orders/${order.id}`}
                          className="flex items-center gap-1 text-slate-500 hover:text-ocean-600 font-medium"
                        >
                          Detail
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Actions for different statuses */}
                    {order.status === 'pesanan_selesai' && order.items?.[0] && (
                      <div className="px-4 pb-4">
                        <Link
                          href={`/buyer/products/${order.items[0].product_id}`}
                          className="w-full py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Beri Ulasan
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </main>

      <Footer />
    </div>
  )
}

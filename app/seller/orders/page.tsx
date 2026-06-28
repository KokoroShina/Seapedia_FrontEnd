'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { 
  ChevronRight, Clock, Package, Truck, CheckCircle, 
  XCircle, ArrowRight, User, MapPin
} from 'lucide-react'

interface Buyer {
  id: number
  name: string
  username: string
}

interface Address {
  id: number
  recipient_name: string
  phone: string
  address: string
}

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_price: string
  quantity: number
  subtotal: string
}

interface StatusHistory {
  id: number
  status: string
  note: string
  created_at: string
}

interface Order {
  id: number
  buyer_id: number
  store_id: number
  address_id: number
  delivery_method: string
  subtotal: string
  discount_amount: string
  delivery_fee: string
  ppn: string
  total: string
  status: string
  created_at: string
  updated_at: string
  buyer: Buyer
  items: OrderItem[]
  address: Address
  status_histories: StatusHistory[]
}

const statusConfig: Record<string, { 
  label: string; 
  color: string; 
  bg: string; 
  border: string;
  icon: any 
}> = {
  sedang_dikemas: { 
    label: 'Sedang Dikemas', 
    color: 'text-orange-700', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200',
    icon: Package 
  },
  menunggu_pengirim: { 
    label: 'Menunggu Pengirim', 
    color: 'text-blue-700', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200',
    icon: Truck 
  },
  sedang_dikirim: { 
    label: 'Sedang Dikirim', 
    color: 'text-indigo-700', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-200',
    icon: Truck 
  },
  pesanan_selesai: { 
    label: 'Selesai', 
    color: 'text-green-700', 
    bg: 'bg-green-50', 
    border: 'border-green-200',
    icon: CheckCircle 
  },
  dikembalikan: { 
    label: 'Dikembalikan', 
    color: 'text-red-700', 
    bg: 'bg-red-50', 
    border: 'border-red-200',
    icon: XCircle 
  },
}

const tabs = [
  { id: 'all', label: 'Semua' },
  { id: 'sedang_dikemas', label: 'Dikemas' },
  { id: 'menunggu_pengirim', label: 'Menunggu Driver' },
  { id: 'sedang_dikirim', label: 'Dikirim' },
  { id: 'pesanan_selesai', label: 'Selesai' },
]

export default function SellerOrdersPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders', activeTab],
    queryFn: async () => {
      const params = activeTab !== 'all' ? `?status=${activeTab}` : ''
      const res = await api.get<ApiResponse<{ data: Order[] }>>(`/seller/orders${params}`)
      return res.data.data?.data || []
    },
  })

  const processMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return api.put(`/seller/orders/${orderId}/process`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
      setSelectedOrder(null)
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memproses pesanan')
    },
  })

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'instant': return '🚀'
      case 'next_day': return '📦'
      case 'regular': return '🚚'
      default: return '📦'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Pesanan Masuk</h1>
          <p className="text-slate-500 mt-1">Kelola pesanan dari pembeli</p>
        </div>

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

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Tidak Ada Pesanan</h2>
            <p className="text-slate-500">
              {activeTab === 'all' 
                ? 'Belum ada pesanan masuk' 
                : `Tidak ada pesanan dengan status "${tabs.find(t => t.id === activeTab)?.label}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
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
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">{order.buyer?.name}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">
                          #{order.id} • {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDeliveryIcon(order.delivery_method)}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 line-clamp-1">{item.product_name}</p>
                              <p className="text-sm text-slate-500">{item.quantity}x • {formatPrice(item.product_price)}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-700">{formatPrice(item.subtotal)}</p>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-sm text-slate-500 pl-15">
                          +{order.items.length - 3} produk lainnya
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                          <MapPin className="w-4 h-4" />
                          {order.address?.recipient_name} • {order.address?.phone}
                        </div>
                        <p className="font-bold text-lg text-slate-800">
                          Total: {formatPrice(order.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.status === 'sedang_dikemas' && (
                          <button
                            onClick={() => processMutation.mutate(order.id)}
                            disabled={processMutation.isPending}
                            className="flex items-center gap-2 bg-ocean-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 shadow-lg shadow-ocean-500/30"
                          >
                            <Package className="w-5 h-5" />
                            Proses & Kirim
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-white transition-colors"
                        >
                          Detail
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detail Pesanan #{selectedOrder.id}</h2>
                <p className="text-slate-500 text-sm">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-xl ${statusConfig[selectedOrder.status]?.bg || 'bg-slate-50'} border ${statusConfig[selectedOrder.status]?.border || 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = statusConfig[selectedOrder.status]?.icon || Package
                    return <Icon className={`w-5 h-5 ${statusConfig[selectedOrder.status]?.color || 'text-slate-700'}`} />
                  })()}
                  <span className={`font-semibold ${statusConfig[selectedOrder.status]?.color || 'text-slate-700'}`}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Buyer Info */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Informasi Pembeli</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">{selectedOrder.buyer?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div className="text-sm text-slate-600">
                      <p>{selectedOrder.address?.recipient_name} • {selectedOrder.address?.phone}</p>
                      <p className="mt-1">{selectedOrder.address?.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{item.product_name}</p>
                          <p className="text-sm text-slate-500">{item.quantity}x • {formatPrice(item.product_price)}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-700">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Ringkasan Pembayaran</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {parseFloat(selectedOrder.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon</span>
                      <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkir ({selectedOrder.delivery_method})</span>
                    <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PPN (12%)</span>
                    <span>{formatPrice(selectedOrder.ppn)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span className="text-ocean-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Riwayat Status</h3>
                <div className="space-y-3">
                  {selectedOrder.status_histories?.map((history, idx) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-ocean-100 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-ocean-600" />
                        </div>
                        {idx < (selectedOrder.status_histories?.length || 0) - 1 && (
                          <div className="w-0.5 h-8 bg-ocean-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-slate-700">{statusConfig[history.status]?.label || history.status}</p>
                        <p className="text-sm text-slate-500">{history.note}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(history.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              {selectedOrder.status === 'sedang_dikemas' && (
                <button
                  onClick={() => {
                    processMutation.mutate(selectedOrder.id)
                  }}
                  disabled={processMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-ocean-500 text-white py-4 rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 shadow-lg shadow-ocean-500/30"
                >
                  <ArrowRight className="w-5 h-5" />
                  {processMutation.isPending ? 'Memproses...' : 'Proses & Kirim ke Driver'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

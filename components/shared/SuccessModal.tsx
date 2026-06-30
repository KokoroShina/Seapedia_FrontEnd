'use client'

import { CheckCircle, X, Package, MapPin, Phone, Clock } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface OrderData {
  id: number
  total: number
  status: string
  delivery_method: string
  address: {
    recipient_name: string
    phone: string
    address: string
  }
  items: Array<{
    product_name: string
    quantity: number
    product_price: number
  }>
  created_at: string
}

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  order?: OrderData | null
}

export default function SuccessModal({ isOpen, onClose, order }: SuccessModalProps) {
  if (!isOpen) return null

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'instant': return 'Instant (30-60 menit)'
      case 'next_day': return 'Next Day (1x24 jam)'
      case 'regular': return 'Regular (2-3 hari)'
      default: return method
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center rounded-t-3xl">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold">Checkout Berhasil!</h2>
          <p className="text-green-100 mt-1">Pesananmu sedang diproses</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {order && (
            <>
              {/* Order ID */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-ocean-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="font-bold text-slate-800">#{order.id}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                    Sedang Dikemas
                  </span>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Metode Pengiriman</p>
                  <p className="font-medium text-slate-800">{getMethodLabel(order.delivery_method)}</p>
                </div>
              </div>

              {/* Address */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">Alamat Pengiriman</p>
                    <p className="font-medium text-slate-800">{order.address.recipient_name}</p>
                    <p className="text-sm text-slate-600">{order.address.phone}</p>
                    <p className="text-sm text-slate-600 mt-1">{order.address.address}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <p className="text-sm text-slate-500 mb-3">Item Pesanan</p>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-200 rounded text-xs flex items-center justify-center text-slate-600">
                          {item.quantity}x
                        </span>
                        <span className="text-sm text-slate-700">{item.product_name}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {formatRupiah(item.product_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4 border-t border-slate-200">
                <span className="text-lg font-bold text-slate-800">Total Pembayaran</span>
                <span className="text-xl font-bold text-ocean-600">{formatRupiah(order.total)}</span>
              </div>
            </>
          )}

          {!order && (
            <div className="text-center py-8">
              <p className="text-slate-600">Pesananmu sedang diproses oleh penjual.</p>
              <p className="text-slate-500 text-sm mt-2">Kamu akan mendapat notifikasi ketika pesanan siap dikirim.</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
            >
              Lihat Detail Pesanan
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

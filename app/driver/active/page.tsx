'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  Bike, Package, MapPin, Phone, Clock, CheckCircle,
  AlertTriangle, Navigation, ChevronRight
} from 'lucide-react'

interface Address {
  recipient_name: string
  phone: string
  address: string
}

interface Order {
  id: number
  total: string
  delivery_method: string
  address: Address
}

interface DeliveryJob {
  id: number
  order_id: number
  status: string
  due_at: string
  taken_at: string | null
  order: Order
}

export default function DriverActiveDeliveryPage() {
  const { data: activeDelivery, isLoading } = useQuery({
    queryKey: ['driver-active-delivery'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: DeliveryJob | null }>>('/driver/jobs/active')
      return res.data.data?.data
    },
  })

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price)
  }

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'instant': return '🚀'
      case 'next_day': return '📦'
      case 'regular': return '🚚'
      default: return '📦'
    }
  }

  const getDeliveryLabel = (method: string) => {
    switch (method) {
      case 'instant': return 'Instant'
      case 'next_day': return 'Next Day'
      case 'regular': return 'Regular'
      default: return method
    }
  }

  const getTimeRemaining = (dueAt: string) => {
    const now = new Date()
    const due = new Date(dueAt)
    const diff = due.getTime() - now.getTime()

    if (diff < 0) {
      return { text: 'Sudah overdue!', urgent: true, hours: 0, minutes: 0 }
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return {
      text: hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`,
      urgent: hours < 1,
      hours,
      minutes
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="w-full h-48 bg-slate-100 rounded-xl animate-pulse mb-6" />
            <div className="space-y-4">
              <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!activeDelivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Delivery Aktif</h1>
            <p className="text-slate-500 mt-1">Tidak ada delivery yang sedang aktif</p>
          </div>

          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bike className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Tidak Ada Job Aktif</h2>
            <p className="text-slate-500 mb-6">
              Saat ini kamu tidak sedang mengantarkan pesanan. Cek job yang tersedia ya!
            </p>
            <Link
              href="/driver/jobs"
              className="inline-flex items-center gap-2 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
            >
              <Navigation className="w-5 h-5" />
              Lihat Job Tersedia
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const timeRemaining = getTimeRemaining(activeDelivery.due_at)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Delivery Aktif</h1>
          <p className="text-slate-500 mt-1">Order #{activeDelivery.order_id}</p>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-4 mb-6 ${
          timeRemaining.urgent ? 'bg-red-50 border-2 border-red-200' : 'bg-blue-50 border-2 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                timeRemaining.urgent ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                <Clock className={`w-6 h-6 ${timeRemaining.urgent ? 'text-red-500' : 'text-blue-500'}`} />
              </div>
              <div>
                <p className={`font-bold text-lg ${timeRemaining.urgent ? 'text-red-600' : 'text-blue-700'}`}>
                  {timeRemaining.text}
                </p>
                <p className="text-sm text-slate-500">Sisa waktu</p>
              </div>
            </div>
            <span className="text-3xl">{getDeliveryIcon(activeDelivery.order.delivery_method)}</span>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">Info Order</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Order ID</span>
              <span className="font-semibold text-slate-800">#{activeDelivery.order_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Metode</span>
              <span className="font-semibold text-slate-800">
                {getDeliveryIcon(activeDelivery.order.delivery_method)} {getDeliveryLabel(activeDelivery.order.delivery_method)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-xl text-ocean-600">
                {formatPrice(activeDelivery.order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">Alamat Pengiriman</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{activeDelivery.order.address.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{activeDelivery.order.address.recipient_name}</p>
                <p className="text-slate-500">{activeDelivery.order.address.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`tel:${activeDelivery.order.address.phone}`}
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:from-emerald-600 hover:to-green-600 transition-all mb-4"
        >
          <Phone className="w-6 h-6" />
          Hubungi Pembeli
        </Link>

        <Link
          href="/driver/jobs"
          className="flex items-center justify-center gap-2 text-slate-500 hover:text-ocean-600 transition-colors py-2"
        >
          Lihat Job Lain
          <ChevronRight className="w-5 h-5" />
        </Link>
      </main>

      <Footer />
    </div>
  )
}

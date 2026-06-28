'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  Bike, Package, MapPin, CheckCircle, History,
  ChevronRight, ChevronLeft
} from 'lucide-react'

interface Address {
  recipient_name: string
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
  taken_at: string
  completed_at: string
  order: Order
}

export default function DriverHistoryPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['driver-history', page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: DeliveryJob[]; total: number; per_page: number; last_page: number }>>(
        `/driver/jobs/history?page=${page}`
      )
      return res.data.data
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
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
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

  const jobs = data?.data || []
  const totalPages = data?.last_page || 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Riwayat Delivery</h1>
            <p className="text-slate-500">Histori pekerjaan delivery kamu</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800">{data?.total || 0}</p>
              <p className="text-sm text-slate-500">Total Delivery</p>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(jobs.reduce((sum, job) => sum + (parseFloat(job.order.total) * 0.8), 0))}
              </p>
              <p className="text-sm text-slate-500">Total Earning</p>
            </div>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="h-6 w-32 bg-slate-100 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Riwayat</h2>
            <p className="text-slate-500">
              Kamu belum menyelesaikan delivery apapun. Yuk mulai ambil job!
            </p>
            <Link
              href="/driver/jobs"
              className="inline-flex items-center gap-2 mt-6 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
            >
              <Bike className="w-5 h-5" />
              Ambil Job
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDeliveryIcon(job.order.delivery_method)}</span>
                      <div>
                        <p className="font-bold text-slate-800">Order #{job.order_id}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(job.completed_at || job.taken_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">Selesai</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600 line-clamp-1">
                        {job.order.address.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">
                        {formatDate(job.taken_at)} • {formatTime(job.taken_at)}
                      </span>
                      <span className="font-bold text-emerald-600">
                        +{formatPrice(parseFloat(job.order.total) * 0.8)} earning
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { 
  Package, MapPin, Phone, Clock, 
  CheckCircle, Bike, ChevronRight, Navigation
} from 'lucide-react'

interface Address {
  id: number
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
  created_at: string
  order: Order
}

export default function DriverJobsPage() {
  const queryClient = useQueryClient()
  const [selectedJob, setSelectedJob] = useState<DeliveryJob | null>(null)

  // Fetch available jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['driver-available-jobs'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: DeliveryJob[] }>>('/driver/jobs')
      return res.data.data?.data || []
    },
  })

  const takeJobMutation = useMutation({
    mutationFn: async (deliveryId: number) => {
      return api.post(`/driver/jobs/${deliveryId}/take`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-available-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['driver-active-delivery'] })
      setSelectedJob(null)
      alert('Job berhasil diambil! Selamat mengantarkan 📦')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal mengambil job')
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

  const getDueTime = (dueAt: string) => {
    const now = new Date()
    const due = new Date(dueAt)
    const diff = due.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) return 'Sudah overdue'
    if (hours > 0) return `${hours}j ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Job Tersedia</h1>
          <p className="text-slate-500 mt-1">Ambil job delivery dan mulai earn 💰</p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bike className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">Tips Driver</p>
              <p className="text-sm text-blue-600">Pilih job dengan estimasi waktu yang sesuai agar tidak overdue</p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
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
        ) : !jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Tidak Ada Job</h2>
            <p className="text-slate-500">
              Saat ini belum ada job delivery yang tersedia. Cek lagi nanti ya!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getDeliveryIcon(job.order.delivery_method)}</span>
                      <div>
                        <p className="font-bold text-slate-800">Order #{job.order_id}</p>
                        <p className="text-sm text-slate-500">{getDeliveryLabel(job.order.delivery_method)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-ocean-600">{formatPrice(job.order.total)}</p>
                      <p className="text-sm text-slate-500">Total Order</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Alamat Pengiriman</p>
                      <p className="font-medium text-slate-800">{job.order.address.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Penerima</p>
                      <p className="font-medium text-slate-800">
                        {job.order.address.recipient_name} • {job.order.address.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Estimasi Waktu</p>
                      <p className="font-medium text-amber-600">{getDueTime(job.due_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="w-full flex items-center justify-center gap-2 bg-ocean-500 text-white py-3 rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
                  >
                    <Bike className="w-5 h-5" />
                    Ambil Job Ini
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Confirm Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8 text-ocean-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Ambil Job Ini?</h2>
              <p className="text-slate-500 mt-2">Order #{selectedJob.order_id}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Metode</span>
                <span className="font-medium">{getDeliveryLabel(selectedJob.order.delivery_method)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estimasi</span>
                <span className="font-medium">{getDueTime(selectedJob.due_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Order</span>
                <span className="font-bold text-ocean-600">{formatPrice(selectedJob.order.total)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => takeJobMutation.mutate(selectedJob.id)}
                disabled={takeJobMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-ocean-500 text-white py-4 rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50"
              >
                {takeJobMutation.isPending ? 'Memproses...' : 'Ya, Ambil Job'}
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="w-full py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

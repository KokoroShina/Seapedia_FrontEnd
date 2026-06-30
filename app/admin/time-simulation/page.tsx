'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import {
  Clock, Play, RotateCcw, AlertTriangle, CheckCircle, RefreshCw,
  Package, Truck, User, Store, AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeSimulation {
  time_offset_hours: number
  simulated_time: string
  real_time: string
  is_simulating: boolean
  has_snapshot: boolean
}

interface OverdueOrder {
  delivery_id: number
  order_id: number
  buyer_name: string
  store_name: string
  driver_name: string
  total: number
  status: string
  delivery_status: string
  due_at: string
  hours_overdue: number
  delivery_method: string
}

export default function AdminTimeSimulationPage() {
  const queryClient = useQueryClient()
  const [hoursToAdvance, setHoursToAdvance] = useState(24)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [showOverdue, setShowOverdue] = useState(false)

  // Real-time clock
  useEffect(() => {
    setCurrentTime(new Date())
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: timeData } = useQuery({
    queryKey: ['admin-time-simulation'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<TimeSimulation>>('/admin/time-simulation')
      return res.data.data
    },
    refetchInterval: 5000,
  })

  const { data: overdueData, refetch: refetchOverdue } = useQuery({
    queryKey: ['admin-overdue-orders'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ count: number; overdue_orders: OverdueOrder[] }>>('/admin/orders/overdue')
      return res.data.data
    },
    enabled: showOverdue,
  })

  const advanceMutation = useMutation({
    mutationFn: async (hours: number) => {
      return api.post('/admin/time-simulation/advance', { hours })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-time-simulation'] })
      const processedCount = response.data.data?.processed_overdue_count || 0
      if (processedCount > 0) {
        alert(`Waktu dimajukan! ${processedCount} pesanan overdue telah diproses dan di-refund.`)
      } else {
        alert('Waktu berhasil dimajukan!')
      }
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memajukan waktu')
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      return api.post('/admin/time-simulation/reset')
    },
    onSuccess: (response) => {
      const data = response.data.data
      const restoredCount = data.restored_orders_count || 0
      if (restoredCount > 0) {
        alert(`Berhasil reset! ${restoredCount} pesanan dikembalikan ke state semula.`)
      } else {
        alert('Reset berhasil!')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-time-simulation'] })
      refetchOverdue()
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal reset waktu')
    },
  })

  const checkOverdueMutation = useMutation({
    mutationFn: async () => {
      return api.post('/admin/orders/check-overdue')
    },
    onSuccess: (response) => {
      const count = response.data.data?.processed_count || 0
      if (count > 0) {
        alert(`${count} pesanan overdue telah diproses dan di-refund!`)
      } else {
        alert('Tidak ada pesanan overdue.')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-time-simulation'] })
      refetchOverdue()
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal proses overdue')
    },
  })

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatLiveTime = (date: Date, offsetHours: number = 0) => {
    const d = new Date(date.getTime() + offsetHours * 60 * 60 * 1000)
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu_pengirim':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Menunggu Driver</span>
      case 'sedang_dikirim':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Dikirim</span>
      case 'sedang_dikemas':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Dikemas</span>
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">{status}</span>
    }
  }

  const getDeliveryMethodBadge = (method: string) => {
    switch (method) {
      case 'instant':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Instant</span>
      case 'next_day':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Next Day</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">Regular</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Time Simulation</h1>
        <p className="text-slate-500 mt-1">Atur waktu sistem untuk testing overdue orders</p>
      </div>

      {/* Warning Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 mb-1">Perhatian</h3>
            <p className="text-amber-700 text-sm">
              Time simulation mempengaruhi seluruh sistem. Pesanan yang overdue akan otomatis dikembalikan dan di-refund.
              Reset akan mengembalikan pesanan ke state semula.
            </p>
          </div>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Simulated Time */}
        <div className={`bg-white rounded-2xl p-6 border ${timeData?.is_simulating ? 'border-indigo-300 shadow-lg shadow-indigo-100' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${timeData?.is_simulating ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <Clock className={`w-6 h-6 ${timeData?.is_simulating ? 'text-indigo-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Waktu Sistem</h3>
              <p className="text-sm text-slate-500">
                {timeData?.is_simulating ? (
                  <span className="flex items-center gap-1">
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full inline-block"
                    />
                    Simulation Active (+{timeData.time_offset_hours}h)
                  </span>
                ) : 'Waktu Sebenarnya'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">
                {timeData?.is_simulating ? 'Waktu Simulasi' : 'Waktu Sekarang'}
              </p>
              <p className="text-3xl font-bold font-mono text-indigo-600">
                {currentTime ? formatLiveTime(currentTime, timeData?.time_offset_hours || 0) : '--:--:--'}
              </p>
            </div>

            {timeData?.is_simulating && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Waktu Sebenarnya</p>
                <p className="text-lg text-slate-600 font-mono">
                  {currentTime ? formatLiveTime(currentTime, 0) : '--:--:--'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Kontrol Waktu</h3>

          <div className="space-y-4">
            {/* Advance Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Majukan Waktu (jam)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={hoursToAdvance}
                  onChange={(e) => setHoursToAdvance(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="720"
                />
                <button
                  onClick={() => advanceMutation.mutate(hoursToAdvance)}
                  disabled={advanceMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  Majukan
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Max 720 jam (30 hari)</p>
            </div>

            {/* Reset Time */}
            <button
              onClick={() => {
                if (confirm('Reset waktu ke kondisi semula? Pesanan yang sudah diproses akan dikembalikan.')) {
                  resetMutation.mutate()
                }
              }}
              disabled={resetMutation.isPending || !timeData?.is_simulating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetMutation.isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
              Reset & Restore
            </button>

            {timeData?.has_snapshot && (
              <p className="text-xs text-center text-amber-600">
                Snapshot tersedia - reset akan mengembalikan pesanan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Quick Time Jump</h3>
          <button
            onClick={() => {
              setShowOverdue(!showOverdue)
              if (!showOverdue) refetchOverdue()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            {showOverdue ? 'Sembunyikan' : 'Lihat'} Overdue ({overdueData?.count || 0})
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { hours: 3, label: 'Instant overdue', desc: '3 jam' },
            { hours: 6, label: 'Next day', desc: '6 jam' },
            { hours: 12, label: 'Next day overdue', desc: '12 jam' },
            { hours: 24, label: 'Regular overdue', desc: '24 jam' },
            { hours: 48, label: '2 hari', desc: '48 jam' },
          ].map((item) => (
            <button
              key={item.hours}
              onClick={() => advanceMutation.mutate(item.hours)}
              disabled={advanceMutation.isPending}
              className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl hover:from-indigo-50 hover:to-indigo-100 transition-all group disabled:opacity-50"
            >
              <p className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600">+{item.hours}h</p>
              <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{item.label}</p>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Orders List */}
      <AnimatePresence>
        {showOverdue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Pesanan Overdue</h3>
                    <p className="text-sm text-slate-500">
                      {overdueData?.count || 0} pesanan yang sudah melewati batas waktu
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => checkOverdueMutation.mutate()}
                  disabled={checkOverdueMutation.isPending || !timeData?.is_simulating}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Proses Overdue
                </button>
              </div>
            </div>

            {overdueData?.overdue_orders && overdueData.overdue_orders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {overdueData.overdue_orders.map((order) => (
                  <div key={order.delivery_id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-800">Order #{order.order_id}</span>
                            {getDeliveryMethodBadge(order.delivery_method)}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Store className="w-4 h-4 text-slate-400" />
                            <span>{order.store_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{order.buyer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span className={order.driver_name === 'Belum ada driver' ? 'text-amber-600' : ''}>
                              {order.driver_name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(order.total)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-red-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {order.hours_overdue}h overdue
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Due: {formatDateTime(order.due_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-800">Tidak Ada Pesanan Overdue</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Semua pesanan masih dalam batas waktu yang ditentukan
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">Detail Informasi</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Waktu Simulasi</p>
            <p className="font-medium text-slate-700">
              {timeData?.simulated_time ? formatDateTime(timeData.simulated_time) : '-'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Waktu Sebenarnya</p>
            <p className="font-medium text-slate-700">
              {timeData?.real_time ? formatDateTime(timeData.real_time) : '-'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Offset</p>
            <p className="font-medium text-slate-700">
              {timeData?.is_simulating ? `+${timeData.time_offset_hours} jam` : '0 jam'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className={`font-medium ${timeData?.is_simulating ? 'text-indigo-600' : 'text-slate-600'}`}>
              {timeData?.is_simulating ? 'Simulation Active' : 'Normal'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

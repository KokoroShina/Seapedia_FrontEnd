'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  Plus, Edit2, Trash2, Tag, Search, X, CheckCircle, AlertCircle
} from 'lucide-react'

interface Voucher {
  id: number
  code: string
  type: string
  value: number
  expired_at: string
  max_usage: number
  used_count: number
  created_at: string
}

export default function AdminVouchersPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    expired_at: '',
    max_usage: 100,
  })

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: Voucher[] }>>('/admin/vouchers')
      return res.data.data?.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.post('/admin/vouchers', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      closeModal()
      alert('Voucher berhasil dibuat!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat voucher')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return api.put(`/admin/vouchers/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      closeModal()
      alert('Voucher berhasil diupdate!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal update voucher')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/vouchers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] })
      alert('Voucher berhasil dihapus!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus voucher')
    },
  })

  const openCreateModal = () => {
    setEditingVoucher(null)
    setFormData({ code: '', type: 'percentage', value: 10, expired_at: '', max_usage: 100 })
    setShowModal(true)
  }

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      expired_at: voucher.expired_at.split('T')[0],
      max_usage: voucher.max_usage,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingVoucher(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const filteredVouchers = vouchers?.filter(v =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (date: string) => new Date(date) < new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kelola Voucher</h1>
          <p className="text-slate-500 mt-1">Buat dan kelola voucher diskon</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Voucher
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari voucher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Vouchers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredVouchers && filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.expired_at)
            return (
              <div
                key={voucher.id}
                className={`bg-white rounded-2xl p-6 border ${expired ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expired ? 'bg-red-100' : 'bg-pink-100'}`}>
                      <Tag className={`w-6 h-6 ${expired ? 'text-red-500' : 'text-pink-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{voucher.code}</h3>
                      <p className={`text-sm ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                        {expired ? 'Expired' : 'Aktif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(voucher)}
                      className="p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Yakin hapus voucher ini?')) {
                          deleteMutation.mutate(voucher.id)
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm">Diskon</span>
                    <span className="font-bold text-2xl text-pink-500">{voucher.value}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Expired</span>
                    <span className={expired ? 'text-red-500' : 'text-slate-700'}>
                      {formatDate(voucher.expired_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Usage</span>
                    <span className="text-slate-700">
                      {voucher.used_count} / {voucher.max_usage}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${expired ? 'bg-red-400' : 'bg-pink-500'}`}
                      style={{ width: `${Math.min((voucher.used_count / voucher.max_usage) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Tag className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Voucher</h3>
          <p className="text-slate-500 mb-6">Buat voucher pertama untuk mulai memberi diskon</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Voucher
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Voucher</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder=" contoh: DISKON20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (%)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kadaluarsa</label>
                <input
                  type="date"
                  value={formData.expired_at}
                  onChange={(e) => setFormData({ ...formData, expired_at: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maksimum Penggunaan</label>
                <input
                  type="number"
                  value={formData.max_usage}
                  onChange={(e) => setFormData({ ...formData, max_usage: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
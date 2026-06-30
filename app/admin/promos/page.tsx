'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import { formatRupiah, formatDate } from '@/lib/utils'
import {
  Plus, Edit2, Trash2, Gift, Search, X, Percent
} from 'lucide-react'

interface Promo {
  id: number
  type: string
  value: number
  min_purchase: number
  expired_at: string
  created_at: string
}

export default function AdminPromosPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    type: 'percentage',
    value: 5,
    min_purchase: 100000,
    expired_at: '',
  })

  const { data: promos, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: Promo[] }>>('/admin/promos')
      return res.data.data?.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.post('/admin/promos', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
      closeModal()
      alert('Promo berhasil dibuat!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat promo')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return api.put(`/admin/promos/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
      closeModal()
      alert('Promo berhasil diupdate!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal update promo')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/promos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
      alert('Promo berhasil dihapus!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus promo')
    },
  })

  const openCreateModal = () => {
    setEditingPromo(null)
    setFormData({ type: 'percentage', value: 5, min_purchase: 100000, expired_at: '' })
    setShowModal(true)
  }

  const openEditModal = (promo: Promo) => {
    setEditingPromo(promo)
    setFormData({
      type: promo.type,
      value: promo.value,
      min_purchase: promo.min_purchase,
      expired_at: promo.expired_at.split('T')[0],
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPromo(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const filteredPromos = promos?.filter((_, idx) => idx < 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kelola Promo</h1>
          <p className="text-slate-500 mt-1">Promo otomatis yang berlaku untuk semua checkout</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Promo
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-800 mb-1">Tentang Promo</h3>
            <p className="text-indigo-700 text-sm">
              Promo otomatis diterapkan pada checkout berdasarkan minimum purchase.
              Tidak perlu input kode, langsung potong harga!
            </p>
          </div>
        </div>
      </div>

      {/* Promos List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : filteredPromos && filteredPromos.length > 0 ? (
        <div className="space-y-4">
          {filteredPromos.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Percent className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{promo.value}% Diskon</h3>
                    <p className="text-slate-500">Min. purchase {formatRupiah(promo.min_purchase)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Berlaku sampai</p>
                    <p className="font-semibold text-slate-700">{formatDate(promo.expired_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(promo)}
                      className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Yakin hapus promo ini?')) {
                          deleteMutation.mutate(promo.id)
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Gift className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Promo</h3>
          <p className="text-slate-500 mb-6">Buat promo untuk memberikan diskon otomatis</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Promo
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diskon (%)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Purchase (IDR)</label>
                <input
                  type="number"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({ ...formData, min_purchase: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Berlaku Sampai</label>
                <input
                  type="date"
                  value={formData.expired_at}
                  onChange={(e) => setFormData({ ...formData, expired_at: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { MapPin, Plus, Trash2, Edit2, CheckCircle, X, Phone, User } from 'lucide-react'

interface Address {
  id: number
  label: string
  recipient_name: string
  phone: string
  address: string
  is_default: boolean
}

export default function AddressesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    phone: '',
    address: '',
    is_default: false,
  })

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Address[]>>('/addresses')
      return res.data.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.post('/addresses', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      closeModal()
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menyimpan alamat')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return api.put(`/addresses/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      closeModal()
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui alamat')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/addresses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus alamat')
    },
  })

  const openAddModal = () => {
    setEditingAddress(null)
    setFormData({
      label: '',
      recipient_name: '',
      phone: '',
      address: '',
      is_default: addresses?.length === 0 || false,
    })
    setShowModal(true)
  }

  const openEditModal = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      is_default: address.is_default,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAddress(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Hapus alamat ini?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-ocean-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-ocean-800">
              Alamat Pengiriman
            </h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-ocean-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah
            </button>
          </div>

          {isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4">
                  <div className="h-6 w-32 bg-ocean-100 rounded animate-pulse mb-4" />
                  <div className="h-4 bg-ocean-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-ocean-100 rounded w-1/2 animate-pulse mt-2" />
                </div>
              ))}
            </div>
          ) : !addresses || addresses.length === 0 ? (
            // Empty state
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-24 h-24 bg-ocean-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-ocean-400" />
              </div>
              <h2 className="text-xl font-semibold text-ocean-700 mb-2">
                Belum Ada Alamat
              </h2>
              <p className="text-ocean-500 mb-6">
                Tambahkan alamat pengiriman untuk checkout lebih cepat
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah Alamat
              </button>
            </div>
          ) : (
            // Addresses list
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                    address.is_default ? 'border-ocean-500' : 'border-ocean-100 hover:border-ocean-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        address.is_default ? 'bg-ocean-500 text-white' : 'bg-ocean-100 text-ocean-600'
                      }`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-ocean-800">{address.label}</span>
                          {address.is_default && (
                            <span className="text-xs bg-ocean-500 text-white px-2 py-0.5 rounded-full">
                              Utama
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-ocean-600 mb-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{address.recipient_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ocean-500 mb-2">
                          <Phone className="w-4 h-4" />
                          <span>{address.phone}</span>
                        </div>
                        <p className="text-ocean-600 text-sm leading-relaxed">
                          {address.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2 text-ocean-500 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ocean-800">
                {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-ocean-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">
                  Label Alamat
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Contoh: Rumah, Kantor"
                  required
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  placeholder="Nama lengkap"
                  required
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  required
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ocean-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. xxx No. x, Kel. xxx, Kec. xxx, Kota xxx, xxx xxxxx"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-5 h-5 rounded border-ocean-300 text-ocean-500 focus:ring-ocean-500"
                />
                <span className="text-ocean-700">Jadikan alamat utama</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-ocean-200 text-ocean-600 font-semibold rounded-xl hover:bg-ocean-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-ocean-500 text-white font-semibold rounded-xl hover:bg-ocean-600 transition-colors disabled:opacity-50"
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

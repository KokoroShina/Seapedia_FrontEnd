'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import {
  Plus, Edit2, Trash2, FolderTree, Search, X, CheckCircle
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  is_active: boolean
  products_count?: number
  created_at: string
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    is_active: true,
  })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: Category[] }>>('/admin/categories')
      return res.data.data?.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.post('/admin/categories', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      closeModal()
      alert('Kategori berhasil dibuat!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat kategori')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return api.put(`/admin/categories/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      closeModal()
      alert('Kategori berhasil diupdate!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal update kategori')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      alert('Kategori berhasil dihapus!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal menghapus kategori')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      return api.put(`/admin/categories/${id}`, { is_active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal update status')
    },
  })

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', icon: '', is_active: true })
    setShowModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      is_active: category.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleNameChange = (name: string) => {
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setFormData({ ...formData, name, slug })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...formData, icon: formData.icon || '' }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredCategories = categories?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Kelola Kategori</h1>
          <p className="text-slate-500 mt-1">Atur kategori produk seafood</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : filteredCategories && filteredCategories.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Kategori</th>
                <th className="text-left px-6 py-4 font-semibold text-slate-700">Slug</th>
                <th className="text-center px-6 py-4 font-semibold text-slate-700">Produk</th>
                <th className="text-center px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="text-right px-6 py-4 font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{category.icon || '📁'}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{category.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-600">
                      {category.products_count || 0} produk
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: category.id, is_active: !category.is_active })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {category.is_active ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Nonaktif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin hapus kategori "${category.name}"?`)) {
                          deleteMutation.mutate(category.id)
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FolderTree className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Kategori</h3>
          <p className="text-slate-500 mb-6">Buat kategori untuk mengorganisir produk</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-teal-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Kategori
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder=" contoh: Ikan Segar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="contoh: ikan-segar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji opsional)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder=" contoh: 🐟"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Aktif (tampil di halaman utama)
                </label>
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
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
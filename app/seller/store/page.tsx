'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  Store, Camera, Save, X, CheckCircle, Loader2
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface StoreData {
  id: number
  name: string
  description: string
  image: string | null
  user_id: number
  created_at: string
  updated_at: string
}

export default function SellerStorePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch store data
  const { data: store, isLoading, error, isError } = useQuery({
    queryKey: ['seller-store'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<StoreData>>('/seller/store')
      return res.data.data
    },
    retry: false,
    throwOnError: false,
  })

  // If 404 error, treat as no store (show create form)
  const hasNoStore = isError && (error as any)?.response?.status === 404

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return api.post('/seller/store', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-store'] })
      setIsEditing(false)
      alert('Toko berhasil dibuat!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat toko')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      return api.post(`/seller/store?_method=PUT`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-store'] })
      setIsEditing(false)
      alert('Toko berhasil diperbarui!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal memperbarui toko')
    },
  })

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
      })
    }
  }, [store])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    if (imageFile) {
      data.append('image', imageFile)
    }

    if (store) {
      updateMutation.mutate({ id: store.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <div className="w-full h-48 bg-slate-100 rounded-xl animate-pulse mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded animate-pulse" />
              <div className="h-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // If store exists, show store info with edit option
  if ((store || hasNoStore) && !isEditing && !hasNoStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Pengaturan Toko</h1>
            <p className="text-slate-500 mt-1">Kelola informasi toko kamu</p>
          </div>

          {/* Store Preview Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="relative h-40 bg-gradient-to-br from-ocean-500 to-ocean-600">
              {store && store.image && (
                <img
                  src={getImageUrl(store.image)}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Store Info */}
            <div className="p-6">
              <div className="flex items-start gap-4 -mt-16 mb-4">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg overflow-hidden flex items-center justify-center">
                  {store && store.image ? (
                    <img
                      src={getImageUrl(store.image)}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 pt-14">
                  <h2 className="text-2xl font-bold text-slate-800">{store?.name || 'Toko Saya'}</h2>
                  <p className="text-slate-500">Toko Terverifikasi</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-slate-700 mb-2">Deskripsi Toko</h3>
                <p className="text-slate-600">
                  {store?.description || 'Belum ada deskripsi'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
          >
            Edit Toko
          </button>
        </main>

        <Footer />
      </div>
    )
  }

  // Show form for create or edit
  if (hasNoStore || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Buat Toko Baru</h1>
            <p className="text-slate-500 mt-1">Mulai berjualan dengan membuat toko</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Foto Toko</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {(imagePreview || store?.image) ? (
                  <img
                    src={imagePreview || store?.image || ''}
                    alt="Store preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                    <Store className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-ocean-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-ocean-600 transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500">Klik untuk upload foto</p>
            </div>
          </div>

          {/* Store Name */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Nama Toko</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Toko Ikan Segar Jakarta"
              required
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>

          {/* Store Description */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Deskripsi Toko</h3>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan tentang toko kamu..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-ocean-500/30"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            {isPending ? 'Membuat Toko...' : 'Buat Toko'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  )
}

// Show edit form when store exists
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <Navbar onSearch={() => {}} />
    
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Edit Toko</h1>
        <p className="text-slate-500 mt-1">Perbarui informasi toko kamu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Foto Toko</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {(imagePreview || store?.image) ? (
                <Image
                  src={imagePreview || store?.image || ''}
                  alt="Store preview"
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                  <Store className="w-12 h-12 text-slate-300" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-ocean-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-ocean-600 transition-colors shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-slate-500">Klik untuk upload foto</p>
          </div>
        </div>

        {/* Store Name */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Nama Toko</h3>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Toko Ikan Segar Jakarta"
            required
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
          />
        </div>

        {/* Store Description */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">Deskripsi Toko</h3>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Jelaskan tentang toko kamu..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 py-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-ocean-500/30"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </main>

    <Footer />
  </div>
)
}

'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import {
  ArrowLeft, Camera, Loader2, Check, X, AlertTriangle, ChevronDown
} from 'lucide-react'

interface Product {
  id: number
  store_id: number
  name: string
  description: string
  price: string
  stock: number
  image: string | null
  category_id: number | null
}

interface Category {
  id: number
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories')
      return res.data.data || []
    },
  })

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['seller-product', productId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Product>>(`/seller/products/${productId}`)
      return res.data.data
    },
    retry: false,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.replace(/\.00$/, '') : '',
        stock: product.stock?.toString() || '0',
        category_id: product.category_id?.toString() || '',
      })
      setOriginalImage(product.image)
    }
  }, [product])

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formDataToSend = new FormData()
      formDataToSend.append('name', data.name.trim())
      formDataToSend.append('description', data.description.trim())
      formDataToSend.append('price', data.price)
      formDataToSend.append('stock', data.stock)
      formDataToSend.append('category_id', data.category_id)
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }
      return api.post(`/seller/products/${productId}?_method=PUT`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      alert('Produk berhasil diperbarui!')
      router.push('/seller/products')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui produk'
      const fieldErrors = error.response?.data?.errors

      if (fieldErrors) {
        setErrors(fieldErrors)
        alert(Object.values(fieldErrors).flat().join('\n'))
      } else {
        alert(errorMessage)
      }
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Ukuran file maksimal 5MB' })
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setErrors({ ...errors, image: '' })
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const restoreOriginalImage = () => {
    setImageFile(null)
    setImagePreview(originalImage)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk harus diisi'
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori harus dipilih'
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Harga harus lebih dari 0'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stok tidak boleh negatif'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    updateMutation.mutate(formData)
  }

  const formatPrice = (value: string) => {
    const num = value.replace(/[^\d]/g, '')
    return new Intl.NumberFormat('id-ID').format(parseInt(num || '0'))
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '')
    if (rawValue === '' || parseInt(rawValue) >= 0) {
      setFormData({ ...formData, price: rawValue })
    }
  }

  const currentImage = imagePreview || originalImage

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar onSearch={() => {}} />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-red-800">Produk Tidak Ditemukan</h2>
                <p className="text-red-600 text-sm">Produk yang Anda cari tidak ada atau sudah dihapus.</p>
              </div>
            </div>
          </div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 bg-ocean-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Produk
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar onSearch={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/seller/products"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Edit Produk
            </h1>
            <p className="text-slate-500">#{product.id} - {product.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Foto Produk</h3>
            <div className="flex flex-col items-center gap-4">
              {currentImage ? (
                <div className="relative w-full max-w-xs">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={currentImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-square border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-ocean-400 hover:bg-ocean-50/50 transition-all">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Klik untuk upload</p>
                    <p className="text-xs text-slate-400">JPG, PNG (maks. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {!currentImage && (
                <label className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-200 transition-colors">
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {imageFile && (
                <button
                  type="button"
                  onClick={restoreOriginalImage}
                  className="text-sm text-slate-500 hover:text-ocean-500 transition-colors"
                >
                  Kembalikan foto asli
                </button>
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm text-center mt-2">{errors.image}</p>
            )}
          </motion.div>

          {/* Product Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Nama Produk</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              placeholder="Contoh: Ikan Salmon Segar"
              className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${
                errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-ocean-500'
              } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Kategori Produk</h3>
            <div className="relative">
              <select
                value={formData.category_id}
                onChange={(e) => {
                  setFormData({ ...formData, category_id: e.target.value })
                  if (errors.category_id) setErrors({ ...errors, category_id: '' })
                }}
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border appearance-none cursor-pointer ${
                  errors.category_id ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-ocean-500'
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-10`}
              >
                <option value="">Pilih Kategori</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            {errors.category_id && (
              <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
            )}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Deskripsi Produk</h3>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan produk kamu..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent resize-none transition-all"
            />
          </motion.div>

          {/* Price & Stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
          >
            <h3 className="font-semibold text-slate-800 mb-4">Harga & Stok</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Harga (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                  <input
                    type="text"
                    value={formatPrice(formData.price)}
                    onChange={handlePriceChange}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border ${
                      errors.price ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-ocean-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Stok
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    setFormData({ ...formData, stock: e.target.value })
                    if (errors.stock) setErrors({ ...errors, stock: '' })
                  }}
                  placeholder="0"
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${
                    errors.stock ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-ocean-500'
                  } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex gap-4"
          >
            <Link
              href="/seller/products"
              className="flex-1 py-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-ocean-500/30"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </motion.div>
        </form>
      </main>

      <Footer />
    </div>
  )
}

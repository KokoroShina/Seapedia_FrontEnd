'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Star, ShoppingCart, Heart, Minus, Plus, ChevronLeft, Store } from 'lucide-react'
import Link from 'next/link'

interface ProductDetail {
  id: number
  store_id: number
  name: string
  description: string
  price: string
  stock: number
  image: string
  store: {
    id: number
    name: string
  }
  average_rating?: number
  sold_count?: number
}

interface Review {
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ProductDetail>>(`/products/${productId}`)
      return res.data.data
    },
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ data: Review[] }>>(`/reviews?product_id=${productId}`)
      return res.data.data?.data || []
    },
    enabled: !!productId,
  })

  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    try {
      await api.post('/cart/items', {
        product_id: product.id,
        quantity,
      })
      alert('Produk berhasil ditambahkan ke keranjang!')
      router.push('/buyer/cart')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseFloat(price))
  }

  if (productLoading) {
    return (
      <div className="min-h-screen bg-ocean-50">
        <Navbar onSearch={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-ocean-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-ocean-100 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-ocean-100 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-ocean-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ocean-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ocean-700 mb-4">Produk tidak ditemukan</h2>
          <Link href="/" className="text-ocean-500 hover:text-ocean-600">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  // Generate placeholder images
  const images = [
    product.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop`,
    `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop`,
  ]

  return (
    <div className="min-h-screen bg-ocean-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          {/* Product Section */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-ocean-100">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-ocean-500 shadow-md' 
                        : 'border-ocean-100 hover:border-ocean-200'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-ocean-600">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-ocean-500">
                    Stok: {product.stock}
                  </span>
                </div>
              </div>

              {/* Store Info */}
              <Link 
                href={`/stores/${product.store?.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-ocean-100 hover:border-ocean-200 transition-colors"
              >
                <div className="w-12 h-12 bg-ocean-100 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-ocean-600" />
                </div>
                <div>
                  <p className="font-semibold text-ocean-700">{product.store?.name}</p>
                  <p className="text-sm text-ocean-500">Kunjungi Toko</p>
                </div>
              </Link>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-ocean-700 font-medium">Jumlah:</span>
                <div className="flex items-center border border-ocean-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-ocean-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5 text-ocean-600" />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-ocean-50 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5 text-ocean-600" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-ocean-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-ocean-500/30"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
                <button className="p-4 border border-ocean-200 rounded-xl hover:bg-ocean-50 transition-colors">
                  <Heart className="w-6 h-6 text-ocean-400 hover:text-red-500 transition-colors" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-xl border border-ocean-100">
                  <div className="flex items-center justify-center gap-1 text-ocean-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{product.average_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <p className="text-xs text-ocean-500 mt-1">Rating</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-ocean-100">
                  <p className="font-semibold text-ocean-600">{product.stock}</p>
                  <p className="text-xs text-ocean-500 mt-1">Stok</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-ocean-100">
                  <p className="font-semibold text-ocean-600">{product.sold_count || 0}</p>
                  <p className="text-xs text-ocean-500 mt-1">Terjual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description & Reviews */}
          <div className="mt-12">
            <div className="flex border-b border-ocean-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-ocean-600 border-b-2 border-ocean-500'
                    : 'text-ocean-500 hover:text-ocean-600'
                }`}
              >
                Deskripsi
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-ocean-600 border-b-2 border-ocean-500'
                    : 'text-ocean-500 hover:text-ocean-600'
                }`}
              >
                Ulasan ({reviews?.length || 0})
              </button>
            </div>

            <div className="bg-white rounded-b-2xl border border-t-0 border-ocean-100 p-6">
              {activeTab === 'description' ? (
                <div className="prose prose-ocean max-w-none">
                  <p className="text-ocean-700 leading-relaxed whitespace-pre-wrap">
                    {product.description || 'Tidak ada deskripsi produk.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                      <div key={idx} className="border-b border-ocean-100 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-ocean-600">
                              {review.reviewer_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-ocean-700">{review.reviewer_name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-ocean-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-ocean-400 ml-auto">
                            {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-ocean-600">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-ocean-500 text-center py-8">
                      Belum ada ulasan untuk produk ini.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

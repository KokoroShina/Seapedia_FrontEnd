'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, Sparkles } from 'lucide-react'

interface CartItem {
  id: number
  product_id: number
  name: string
  price: string
  quantity: number
  subtotal: number
  image?: string
}

interface CartData {
  store: {
    id: number
    name: string
  }
  items: CartItem[]
  total: number
}

export default function CartPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const { data: cart, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CartData | null>>('/cart')
      return res.data.data
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    retry: 1,
  })

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return api.put(`/cart/items/${itemId}`, { quantity })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return api.delete(`/cart/items/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const handleQuantityChange = (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty < 1) return
    updateQuantityMutation.mutate({ itemId, quantity: newQty })
  }

  const handleRemove = (itemId: number) => {
    setShowDeleteConfirm(itemId)
  }

  const confirmRemove = () => {
    if (showDeleteConfirm) {
      setRemovingId(showDeleteConfirm)
      setTimeout(() => {
        removeItemMutation.mutate(showDeleteConfirm)
        setRemovingId(null)
        setShowDeleteConfirm(null)
      }, 300)
    }
  }

  const cancelRemove = () => {
    setShowDeleteConfirm(null)
  }

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price)
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-cyan-50 flex flex-col">
      <Navbar onSearch={() => {}} />

      <main className="flex-1 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-black text-ocean-800 mb-2">
              <span className="bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
                Keranjang
              </span>
              <span className="text-ocean-800"> Belanja</span>
            </h1>
            <p className="text-ocean-500">Pastikan produk yang kamu pilih sudah benar</p>
          </motion.div>

          {isError ? (
            // Error state
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center"
            >
              <p className="text-red-600 font-semibold mb-2">Gagal memuat keranjang</p>
              <p className="text-red-400 text-sm mb-4">{String(error)}</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Coba Lagi
              </button>
            </motion.div>
          ) : isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-md"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-ocean-100 to-cyan-100 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-ocean-100 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-ocean-100 rounded w-1/4 animate-pulse" />
                    <div className="h-8 bg-ocean-100 rounded w-1/3 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : isEmpty ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-12 text-center shadow-xl border border-ocean-100"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 bg-gradient-to-br from-ocean-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <ShoppingBag className="w-16 h-16 text-ocean-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-ocean-800 mb-3">
                Keranjang Kosong
              </h2>
              <p className="text-ocean-500 mb-8 max-w-md mx-auto">
                Sepertinya kamu belum menambahkan produk apapun. Ayo mulai belanja dan temukan seafood favoritmu!
              </p>
              <Link href="/buyer">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(28, 138, 196, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-ocean-500 to-cyan-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-ocean-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Mulai Belanja
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            // Cart items
            <div className="space-y-6">
              {/* Store Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-ocean-500 to-cyan-500 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-ocean-500/20"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-lg">{cart.store?.name}</p>
                  <p className="text-ocean-100 text-sm">
                    {cart.items.length} item{cart.items.length > 1 ? 's' : ''} • {formatPrice(cart.total)}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-ocean-100 text-sm">
                  <span className="px-3 py-1 bg-white/20 rounded-full">Single Store Checkout</span>
                </div>
              </motion.div>

              {/* Cart Items */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{
                        opacity: removingId === item.id ? 0 : 1,
                        x: removingId === item.id ? 30 : 0,
                        scale: removingId === item.id ? 0.95 : 1
                      }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`bg-white rounded-2xl p-4 border border-ocean-100 hover:border-ocean-200 transition-all shadow-md hover:shadow-lg ${
                        removingId === item.id ? 'pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link href={`/products/${item.product_id}`}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative w-24 h-24 bg-gradient-to-br from-ocean-50 to-cyan-50 rounded-xl overflow-hidden flex-shrink-0 shadow-md"
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-ocean-200" />
                              </div>
                            )}
                          </motion.div>
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product_id}`}
                            className="font-bold text-ocean-800 hover:text-ocean-600 transition-colors line-clamp-2 text-lg"
                          >
                            {item.name}
                          </Link>
                          <p className="text-ocean-500 font-semibold mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity & Actions */}
                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center border-2 border-ocean-200 rounded-xl overflow-hidden shadow-sm"
                            >
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                                className="p-2.5 hover:bg-ocean-50 transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4 text-ocean-600" />
                              </motion.button>
                              <span className="px-4 py-1.5 font-bold text-ocean-800 min-w-[50px] text-center">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                disabled={updateQuantityMutation.isPending}
                                className="p-2.5 hover:bg-ocean-50 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4 text-ocean-600" />
                              </motion.button>
                            </motion.div>

                            {/* Subtotal & Remove */}
                            <div className="flex items-center gap-3">
                              <p className="font-black text-lg bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
                                {formatPrice(item.subtotal)}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemove(item.id)}
                                disabled={removeItemMutation.isPending}
                                className="p-2.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delete Confirmation Overlay */}
                      <AnimatePresence>
                        {showDeleteConfirm === item.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
                          >
                            <div className="text-center p-4">
                              <p className="font-bold text-ocean-800 mb-4">Hapus item ini?</p>
                              <div className="flex gap-3 justify-center">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={cancelRemove}
                                  className="px-6 py-2 bg-ocean-100 text-ocean-700 rounded-xl font-semibold hover:bg-ocean-200 transition-colors"
                                >
                                  Batal
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={confirmRemove}
                                  className="px-6 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                                >
                                  Hapus
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 border border-ocean-100 shadow-xl sticky bottom-6"
              >
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-ocean-600">Subtotal ({cart.items.length} item)</span>
                    <span className="font-semibold text-ocean-800">
                      {formatPrice(cart.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-ocean-500">
                    <span>Pengiriman</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Sparkles className="w-3 h-3" />
                      Dihitung saat checkout
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-ocean-500">
                    <span>PPN (12%)</span>
                    <span>Termasuk</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 pt-4 border-t-2 border-dashed border-ocean-200">
                  <div>
                    <span className="text-lg font-bold text-ocean-800">Total</span>
                    <p className="text-xs text-ocean-400">Termasuk PPN</p>
                  </div>
                  <span className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
                    {formatPrice(cart.total)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(28, 138, 196, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/buyer/checkout')}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-ocean-500 to-cyan-500 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-ocean-500/30 transition-all"
                >
                  Lanjutkan ke Checkout
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

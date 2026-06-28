'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Star, ShoppingCart, Package, Check } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/components/animations/Toast'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const queryClient = useQueryClient()
  const addItem = useCartStore((state) => state.addItem)
  const { showToast } = useToast()
  const isOutOfStock = product.stock === 0
  const [isAdding, setIsAdding] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const [flyingImage, setFlyingImage] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock && !isAdding) {
      // Get image position for flying animation
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        setFlyingImage({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          visible: true,
        })
      }

      // Start animation
      setIsAdding(true)

      // Trigger flying animation
      setTimeout(() => {
        setFlyingImage(prev => ({ ...prev, visible: false }))
      }, 700)

      // Add to cart
      try {
        await addItem(product)
        // Invalidate cart query so cart page gets fresh data
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      } catch (error) {
        console.error('Failed to add to cart:', error)
      }

      // Show success toast
      showToast('success', 'Ditambahkan!', `${product.name} masuk ke keranjang`)

      // Show success state
      setTimeout(() => {
        setIsAdding(false)
        setShowAdded(true)

        // Reset after showing
        setTimeout(() => {
          setShowAdded(false)
        }, 1500)
      }, 700)
    }
  }, [isOutOfStock, isAdding, product, addItem, showToast, queryClient])

  // Generate star rating
  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
        {rating > 0 && (
          <span className="text-xs text-ocean-400 ml-1">({product.review_count || 0})</span>
        )}
      </div>
    )
  }

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-ocean-100 hover:border-ocean-200 transition-all duration-300 cursor-pointer relative"
      >
        {/* Flying Product Image Animation */}
        <AnimatePresence>
          {flyingImage.visible && (
            <motion.div
              initial={{
                position: 'fixed',
                left: flyingImage.x - 30,
                top: flyingImage.y - 30,
                width: 60,
                height: 60,
                opacity: 1,
                scale: 1,
                zIndex: 9999,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(28, 138, 196, 0.5)',
              }}
              animate={{
                left: window.innerWidth - 100,
                top: 100,
                opacity: 0,
                scale: 0.2,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{
                position: 'fixed',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-ocean-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-ocean-300" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Image */}
        <div ref={imageRef} className="relative aspect-square bg-gradient-to-br from-ocean-50 to-cyan-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-ocean-200">
              <Package className="w-16 h-16 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center"
            >
              <div className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg">
                Stok Habis
              </div>
            </motion.div>
          )}

          {/* Store Badge */}
          {product.store && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-ocean-700 text-xs font-medium px-2.5 py-1 rounded-lg shadow">
              {product.store.name}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[2.5rem] group-hover:text-ocean-600 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <p className="text-lg font-black bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
              {formatRupiah(product.price)}
            </p>
          </div>

          {/* Store Name & Rating */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-xs text-slate-500 truncate max-w-[60%]">
              {product.store?.name || 'Toko'}
            </span>
            {renderStars(product.average_rating || 0)}
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : showAdded
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-r from-ocean-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-ocean-500/30'
            }`}
          >
            <AnimatePresence mode="wait">
              {showAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Ditambahkan!
                </motion.div>
              ) : isAdding ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.div>
                  Menambahkan...
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isOutOfStock ? 'Stok Habis' : 'Keranjang'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-ocean-500/10 to-cyan-500/10" />
        </div>
      </motion.div>
    </Link>
  )
}

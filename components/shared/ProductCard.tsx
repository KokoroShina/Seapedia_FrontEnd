'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOutOfStock) {
      addItem(product)
    }
  }

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
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
        {/* Product Image */}
        <div className="relative aspect-square bg-ocean-50 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ocean-200">
              <span className="text-sm">No Image</span>
            </div>
          )}
          
          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
              Stok Habis
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-ocean-700 truncate">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-base font-bold text-ocean-700">
            {formatRupiah(product.price)}
          </p>

          {/* Store Name & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-ocean-400 truncate max-w-[60%]">
              {product.store?.name || 'Toko'}
            </span>
            {renderStars(product.average_rating || 0)}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-ocean-500 text-white hover:bg-ocean-600'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? 'Stok Habis' : 'Keranjang'}
          </button>
        </div>
      </div>
    </Link>
  )
}

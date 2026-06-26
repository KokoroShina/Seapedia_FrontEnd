'use client'

import { motion } from 'framer-motion'

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-[480px] flex items-center py-12 md:py-16 bg-gradient-to-br from-ocean-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ocean-700 leading-tight mb-4">
              Belanja lebih mudah, lebih terpercaya
            </h1>
            <p className="text-lg md:text-xl text-ocean-400 mb-8">
              Temukan produk pilihan dari seller terpercaya di seluruh Indonesia
            </p>
            <button
              onClick={scrollToProducts}
              className="bg-ocean-500 text-white rounded-xl px-8 py-3 text-lg font-medium hover:bg-ocean-600 transition-colors shadow-lg shadow-ocean-500/30"
            >
              Mulai Belanja
            </button>
          </motion.div>

          {/* Right - Hero Image from Unsplash */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-1 w-full"
          >
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
                alt="Shopping lifestyle"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

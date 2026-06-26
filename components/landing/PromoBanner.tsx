'use client'

import { motion } from 'framer-motion'

export default function PromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-ocean-700 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      {/* Left Content */}
      <div className="text-center md:text-left">
        <h3 className="text-2xl font-bold text-white mb-2">
          Dapatkan diskon hingga 50% untuk pembelian pertama!
        </h3>
        <p className="text-ocean-100">
          Gunakan kode promo <span className="font-bold text-white">WELCOME50</span>
        </p>
      </div>

      {/* Right Button */}
      <button className="bg-white text-ocean-700 rounded-xl px-6 py-3 font-medium hover:bg-ocean-50 transition-colors whitespace-nowrap">
        Lihat Promo
      </button>
    </motion.div>
  )
}

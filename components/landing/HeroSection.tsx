'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react'

export default function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    { icon: Shield, text: 'Produk Terjamin', color: 'from-emerald-400 to-teal-500' },
    { icon: Truck, text: 'Pengiriman Cepat', color: 'from-blue-400 to-cyan-500' },
    { icon: Sparkles, text: 'Kualitas Premium', color: 'from-purple-400 to-pink-500' },
  ]

  return (
    <section className="min-h-[600px] flex items-center py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-ocean-50 via-white to-cyan-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Circles */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-ocean-200/30 to-cyan-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, -15, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-ocean-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-40 right-1/4 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-blue-200/20 rounded-full blur-2xl"
        />

        {/* Animated Wave Pattern */}
        <svg
          className="absolute bottom-0 left-0 w-full h-32 opacity-30"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            fill="url(#waveGradient)"
            animate={{
              d: [
                "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
                "M0,30 C240,90 480,120 720,30 C960,90 1200,120 1440,30 L1440,120 L0,120 Z",
                "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-ocean-400 rounded-full opacity-40"
            initial={{
              x: `${10 + i * 15}%`,
              y: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [`${20 + (i % 3) * 25}%`, `${10 + (i % 3) * 25}%`, `${20 + (i % 3) * 25}%`],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ocean-100 to-cyan-100 rounded-full mb-6"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌊
              </motion.span>
              <span className="text-sm font-semibold text-ocean-700">
                Marketplace Laut Terpercaya
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block"
              >
                Belanja
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block bg-gradient-to-r from-ocean-600 via-cyan-500 to-ocean-600 bg-clip-text text-transparent"
              >
                Seafood Segar
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="block"
              >
                Lebih Mudah
              </motion.span>
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-ocean-500 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Temukan berbagai jenis ikan, udang, dan hasil laut premium dari seller terpercaya di seluruh Indonesia
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <motion.button
                onClick={scrollToProducts}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(28, 138, 196, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-ocean-500 via-cyan-500 to-ocean-500 bg-size-200 text-white rounded-2xl font-bold text-lg shadow-xl shadow-ocean-500/30 transition-all duration-300"
              >
                <span>Jelajahi Sekarang</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-ocean-100"
                  >
                    <div className={`w-6 h-6 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-ocean-700">{feature.text}</span>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full"
          >
            <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-lg mx-auto">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-ocean-400/20 to-cyan-400/20 rounded-[2rem] blur-3xl" />

              {/* Main Image Container */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop"
                  alt="Shopping lifestyle"
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/30 to-transparent" />
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-4 lg:-left-8 top-1/4 bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-ocean-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🐟</span>
                  </div>
                  <div>
                    <p className="text-xs text-ocean-500">Produk Terjual</p>
                    <p className="font-bold text-ocean-800">12.5K+</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute -right-4 lg:-right-8 bottom-1/4 bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-ocean-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-xs text-ocean-500">Rating Aplikasi</p>
                    <p className="font-bold text-ocean-800">4.9/5.0</p>
                  </div>
                </div>
              </motion.div>

              {/* Dots Pattern */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className={`w-2 h-2 rounded-full ${
                      i === 2 ? 'bg-ocean-500' : 'bg-ocean-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

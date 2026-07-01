'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Hubungi Kami', href: '/contact' },
    { label: 'Karir', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ]

  const supportLinks = [
    { label: 'Pusat Bantuan', href: '/help' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
  ]

  // Diverse categories - NOT just seafood!
  const categoryLinks = [
    { label: 'Makanan', href: '/category/makanan' },
    { label: 'Minuman', href: '/category/minuman' },
    { label: 'Fashion', href: '/category/fashion' },
    { label: 'Elektronik', href: '/category/elektronik' },
  ]

  return (
    <footer className="relative bg-gradient-to-b from-ocean-50 to-white pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-ocean-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-black">
                <span className="bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
                  Sea
                </span>
                <span className="bg-gradient-to-r from-ocean-500 to-cyan-400 bg-clip-text text-transparent">
                  pedia
                </span>
              </span>
            </Link>
            <p className="text-ocean-600 text-sm mb-6 leading-relaxed">
              Marketplace terpercaya di Indonesia. Menyediakan berbagai produk berkualitas dari ribuan seller terpercaya - makanan, fashion, elektronik, dan kebutuhan rumah tangga.
            </p>

            <div className="flex items-center gap-3">
              <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20 hover:shadow-xl hover:shadow-ocean-500/30 transition-shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20 hover:shadow-xl hover:shadow-ocean-500/30 transition-shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20 hover:shadow-xl hover:shadow-ocean-500/30 transition-shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/20 hover:shadow-xl hover:shadow-ocean-500/30 transition-shadow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg>
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-ocean-500 to-cyan-500 rounded-full" />
              Tautan Cepat
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ocean-600 hover:text-ocean-500 text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ocean-400 rounded-full group-hover:bg-ocean-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-ocean-500 to-cyan-500 rounded-full" />
              Dukungan
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ocean-600 hover:text-ocean-500 text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ocean-400 rounded-full group-hover:bg-ocean-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ocean-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-ocean-500 to-cyan-500 rounded-full" />
              Kategori
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ocean-600 hover:text-ocean-500 text-sm flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-ocean-400 rounded-full group-hover:bg-ocean-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-ocean-600 via-cyan-600 to-ocean-600 rounded-3xl p-6 lg:p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Tetap Terhubung dengan Kami
              </h3>
              <p className="text-ocean-100 text-sm">
                Dapatkan update promo dan produk terbaru langsung ke emailmu
              </p>
            </div>

            <div className="flex w-full lg:w-auto gap-3">
              <div className="flex-1 lg:flex-none relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                <input
                  type="email"
                  placeholder="Masukkan email kamu"
                  className="w-full lg:w-72 pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-xl text-ocean-800 placeholder:text-ocean-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3.5 bg-white text-ocean-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                Berlangganan
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 mb-8 pb-8 border-b border-ocean-100">
          <div className="flex items-center gap-2 text-ocean-600">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-ocean-500" />
            </div>
            <span className="text-sm">info@seapedia.com</span>
          </div>
          <div className="flex items-center gap-2 text-ocean-600">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-ocean-500" />
            </div>
            <span className="text-sm">+62 812 3456 7890</span>
          </div>
          <div className="flex items-center gap-2 text-ocean-600">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-ocean-500" />
            </div>
            <span className="text-sm">Jakarta, Indonesia</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ocean-500 text-sm text-center md:text-left">
            © {currentYear} Seapedia. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors">
              Privasi
            </Link>
            <Link href="/terms" className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors">
              Syarat
            </Link>
            <Link href="/cookies" className="text-sm text-ocean-500 hover:text-ocean-700 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

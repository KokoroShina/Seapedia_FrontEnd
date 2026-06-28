"use client";

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export default function BuyerHomePage() {
  const router = useRouter()
  const { isAuthenticated, activeRole } = useAuthStore()

  useEffect(() => {
    // Redirect if not logged in as buyer
    if (!isAuthenticated || activeRole !== 'buyer') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, activeRole, router])

  if (!isAuthenticated || activeRole !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-seapedia-bg">
        <div className="animate-pulse">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-seapedia-bg">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-seapedia-navy">SEAPEDIA</h1>
          <nav className="flex items-center gap-6">
            <a href="/buyer/products" className="text-gray-600 hover:text-seapedia-navy">
              Produk
            </a>
            <a href="/buyer/cart" className="text-gray-600 hover:text-seapedia-navy">
              Keranjang
            </a>
            <a href="/buyer/orders" className="text-gray-600 hover:text-seapedia-navy">
              Pesanan
            </a>
            <a href="/buyer/wallet" className="text-gray-600 hover:text-seapedia-navy">
              Wallet
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-seapedia-navy mb-6">
            Selamat Datang di SEAPEDIA
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Temukan berbagai produk seafood berkualitas dari toko-toko terpercaya
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/buyer/products"
              className="px-8 py-3 bg-seapedia-navy text-white rounded-lg hover:bg-seapedia-navy/90 transition font-semibold"
            >
              Jelajahi Produk
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl font-bold text-seapedia-navy text-center mb-12">
            Mengapa SEAPEDIA?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-seapedia-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">Aman & Terpercaya</h4>
              <p className="text-gray-600">Transaksi terjamin dengan sistem pembayaran yang aman</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-seapedia-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">Pengiriman Cepat</h4>
              <p className="text-gray-600">Pilihan pengiriman instan, same day, dan reguler</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-seapedia-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h4 className="font-semibold text-lg text-gray-900 mb-2">Harga Terbaik</h4>
              <p className="text-gray-600">Dapatkan promo dan diskon menarik setiap hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-seapedia-navy text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg font-semibold mb-2">SEAPEDIA</p>
          <p className="text-seapedia-teal text-sm">Platform Belanja Terpercaya © 2026</p>
        </div>
      </footer>
    </div>
  );
}

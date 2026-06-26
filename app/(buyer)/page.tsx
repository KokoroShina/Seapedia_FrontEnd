"use client";

export default function BuyerHomePage() {
  return (
    <div className="min-h-screen bg-seapedia-bg">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-seapedia-navy">SEAPEDIA</h1>
          <nav className="flex items-center gap-6">
            <a href="/products" className="text-gray-600 hover:text-seapedia-navy">
              Produk
            </a>
            <a href="/stores" className="text-gray-600 hover:text-seapedia-navy">
              Toko
            </a>
            <a href="/cart" className="text-gray-600 hover:text-seapedia-navy">
              Cart
            </a>
            <a href="/login" className="px-4 py-2 text-seapedia-navy border border-seapedia-navy rounded-lg hover:bg-seapedia-navy hover:text-white transition">
              Masuk
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-seapedia-navy mb-6">
            Belanja Mudah & Terpercaya
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Temukan berbagai produk berkualitas dari toko-toko terpercaya di SEAPEDIA
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/products" 
              className="px-8 py-3 bg-seapedia-navy text-white rounded-lg hover:bg-seapedia-navy/90 transition font-semibold"
            >
              Jelajahi Produk
            </a>
            <a 
              href="/register" 
              className="px-8 py-3 bg-white text-seapedia-navy border border-seapedia-navy rounded-lg hover:bg-seapedia-bg transition font-semibold"
            >
              Daftar Sekarang
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

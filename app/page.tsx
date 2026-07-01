'use client'

import { useState, useCallback } from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import HeroSection from '@/components/landing/HeroSection'
import CategoryBar from '@/components/landing/CategoryBar'
import ProductGrid from '@/components/landing/ProductGrid'
import ReviewsGrid from '@/components/landing/ReviewsGrid'

export default function HomePage() {
  const [search, setSearch] = useState<string>('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [sort, setSort] = useState<string>('newest')

  const handleSearch = useCallback((searchValue: string) => {
    setSearch(searchValue)
  }, [])

  const handleCategoryChange = useCallback((categoryValue: string | undefined) => {
    setCategory(categoryValue)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-cyan-50 flex flex-col">
      {/* Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Main Content */}
      <main className="flex-1 pt-20 lg:pt-24">
        {/* Hero Section */}
        <HeroSection />

        {/* Category Bar */}
        <section className="bg-white/60 backdrop-blur-sm border-y border-ocean-100">
          <div className="max-w-7xl mx-auto">
            <CategoryBar
              selectedCategory={category}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </section>

        {/* Products Section */}
        <section id="products-section" className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-ocean-500 to-cyan-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-bold text-ocean-800">
                Produk untuk Kamu
              </h2>
              <span className="text-sm text-ocean-400 hidden md:inline">— Makanan, Fashion, Elektronik & lainnya</span>
            </div>
            <ProductGrid
              search={search}
              category={category}
              sort={sort}
            />
          </div>
        </section>

        {/* App Reviews Section */}
        <section className="py-12 bg-white border-t border-ocean-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewsGrid />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

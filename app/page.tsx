'use client'

import { useState, useCallback } from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import HeroSection from '@/components/landing/HeroSection'
import CategoryBar from '@/components/landing/CategoryBar'
import ProductGrid from '@/components/landing/ProductGrid'

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
    <div className="min-h-screen bg-ocean-50 flex flex-col">
      {/* Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Category Bar */}
        <section className="bg-white border-y border-ocean-100">
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
            <h2 className="text-xl md:text-2xl font-bold text-ocean-700 mb-6">
              Produk untuk Kamu
            </h2>
            <ProductGrid
              search={search}
              category={category}
              sort={sort}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

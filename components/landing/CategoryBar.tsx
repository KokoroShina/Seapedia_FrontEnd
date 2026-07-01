"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories, Category } from "@/hooks/useCategories";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface CategoryBarProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
}

// Default placeholder images by category slug
const categoryImages: Record<string, string> = {
  makanan: "/images/categories/food.svg",
  minuman: "/images/categories/drink.svg",
  snack: "/images/categories/snack.svg",
  buah: "/images/categories/fruit.svg",
  sayuran: "/images/categories/vegetable.svg",
  fashion: "/images/categories/fashion.svg",
  elektronik: "/images/categories/electronics.svg",
  rumah: "/images/categories/home.svg",
  default: "/images/categories/default.svg",
};

// Category emojis for fallback
const categoryEmojis: Record<string, string> = {
  makanan: "🍜",
  minuman: "🥤",
  snack: "🍿",
  buah: "🍎",
  sayuran: "🥬",
  fashion: "👕",
  elektronik: "📱",
  rumah: "🏠",
  beauty: "💄",
  olahraga: "⚽",
  grocery: "🛒",
  default: "📦",
};

function getCategoryImage(slug: string): string {
  return categoryImages[slug.toLowerCase()] || categoryImages.default;
}

function getCategoryEmoji(slug: string): string {
  const lowerSlug = slug.toLowerCase();
  for (const [key, emoji] of Object.entries(categoryEmojis)) {
    if (lowerSlug.includes(key)) {
      return emoji;
    }
  }
  return categoryEmojis.default;
}

// Demo categories for when API is empty - DIVERSE, not just seafood
const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: "Makanan", slug: "makanan", icon: "🍜", image: "" },
  { id: 2, name: "Minuman", slug: "minuman", icon: "🥤", image: "" },
  { id: 3, name: "Fashion", slug: "fashion", icon: "👕", image: "" },
  { id: 4, name: "Elektronik", slug: "elektronik", icon: "📱", image: "" },
  { id: 5, name: "Rumah Tangga", slug: "rumah", icon: "🏠", image: "" },
  { id: 6, name: "Beauty", slug: "beauty", icon: "💄", image: "" },
  { id: 7, name: "Snack", slug: "snack", icon: "🍿", image: "" },
  { id: 8, name: "Buah & Sayur", slug: "buah-sayur", icon: "🍎", image: "" },
];

export default function CategoryBar({
  selectedCategory,
  onCategoryChange,
}: CategoryBarProps) {
  const { data: categories, isLoading, error } = useCategories();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use demo categories if API returns empty
  const displayCategories = categories && categories.length > 0 ? categories : DEMO_CATEGORIES;

  // Handle responsive visible count
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 640) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(4);
      } else {
        setVisibleCount(6);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  if (error) {
    return null; // Hide category bar on error
  }

  const totalCategories = displayCategories.length;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(totalCategories - visibleCount, prev + visibleCount)
    );
  };

  const visibleCategories =
    displayCategories.slice(startIndex, startIndex + visibleCount) || [];
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < totalCategories;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-ocean-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-ocean-800">
              Kategori Produk
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                canGoPrev
                  ? "bg-white shadow-lg shadow-ocean-200/50 text-ocean-600 hover:bg-ocean-50 hover:shadow-xl"
                  : "bg-ocean-50 text-ocean-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={!canGoNext}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                canGoNext
                  ? "bg-white shadow-lg shadow-ocean-200/50 text-ocean-600 hover:bg-ocean-50 hover:shadow-xl"
                  : "bg-ocean-50 text-ocean-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={scrollRef}
            className="flex gap-4 justify-center overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isLoading
                ? // Loading skeleton
                  Array.from({ length: visibleCount }).map((_, i) => (
                    <motion.div
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="w-28 lg:w-32 flex-shrink-0"
                    >
                      <div className="bg-white rounded-2xl border border-ocean-100 shadow-md overflow-hidden">
                        <div className="h-20 lg:h-24 bg-gradient-to-br from-ocean-50 to-cyan-50 animate-pulse" />
                        <div className="p-3 text-center">
                          <div className="h-4 w-20 mx-auto bg-ocean-100 rounded animate-pulse" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                : // Categories from API
                  visibleCategories.map((category: Category, index: number) => {
                    const isSelected = selectedCategory === category.slug;
                    const imageUrl =
                      category.image || getCategoryImage(category.slug);
                    const emoji = category.icon || getCategoryEmoji(category.slug);

                    return (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          onCategoryChange(isSelected ? undefined : category.slug)
                        }
                        className={`w-28 lg:w-32 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? "shadow-xl shadow-ocean-500/30 ring-2 ring-ocean-500"
                            : "shadow-lg shadow-ocean-200/30 hover:shadow-xl"
                        }`}
                      >
                        {/* Image Area with Gradient */}
                        <div
                          className={`relative h-20 lg:h-24 overflow-hidden ${
                            isSelected
                              ? "bg-gradient-to-br from-ocean-500 to-cyan-500"
                              : "bg-gradient-to-br from-ocean-50 to-cyan-50"
                          }`}
                        >
                          {/* Animated Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,transparent_0%,currentColor_100%)] bg-[length:20px_20px]" />
                          </div>

                          <AnimatePresence>
                            {imageUrl && !isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <Image
                                  src={imageUrl}
                                  alt={category.name}
                                  fill
                                  className="object-contain p-3"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Emoji Display */}
                          <motion.div
                            animate={
                              isSelected
                                ? { scale: [1, 1.2, 1] }
                                : { y: [0, -3, 0] }
                            }
                            transition={{
                              duration: isSelected ? 0.5 : 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className={`absolute inset-0 flex items-center justify-center text-3xl lg:text-4xl ${
                              isSelected ? "text-white drop-shadow-lg" : ""
                            }`}
                          >
                            {emoji}
                          </motion.div>

                          {/* Glow Effect when Selected */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"
                            />
                          )}
                        </div>

                        {/* Label Area */}
                        <div
                          className={`p-3 text-center transition-colors duration-200 ${
                            isSelected
                              ? "bg-gradient-to-r from-ocean-500 to-cyan-500"
                              : "bg-white"
                          }`}
                        >
                          <span
                            className={`text-sm font-bold block truncate transition-colors duration-200 ${
                              isSelected
                                ? "text-white"
                                : "text-ocean-700 group-hover:text-ocean-600"
                            }`}
                          >
                            {category.name}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
            </AnimatePresence>
          </div>
        </div>

        {/* Gradient Fades on Edges */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-ocean-50/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-ocean-50/80 to-transparent pointer-events-none" />
      </div>

      {/* Pagination Dots */}
      {!isLoading && totalCategories > visibleCount && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(totalCategories / visibleCount) }).map(
            (_, pageIndex) => {
              const isActive =
                startIndex >= pageIndex * visibleCount &&
                startIndex < (pageIndex + 1) * visibleCount;
              return (
                <motion.button
                  key={pageIndex}
                  onClick={() => setStartIndex(pageIndex * visibleCount)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-gradient-to-r from-ocean-500 to-cyan-500 shadow-lg shadow-ocean-500/30"
                      : "w-2.5 bg-ocean-200 hover:bg-ocean-300"
                  }`}
                />
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

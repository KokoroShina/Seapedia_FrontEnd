"use client";

import { useState, useRef, useEffect } from "react";
import { useCategories, Category } from "@/hooks/useCategories";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  default: "/images/categories/default.svg",
};

function getCategoryImage(slug: string): string {
  return categoryImages[slug.toLowerCase()] || categoryImages.default;
}

export default function CategoryBar({
  selectedCategory,
  onCategoryChange,
}: CategoryBarProps) {
  const { data: categories, isLoading, error } = useCategories();
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle responsive visible count
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(5);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  if (error) {
    return (
      <div className="py-4 text-center text-red-500 text-sm">
        Gagal memuat kategori
      </div>
    );
  }

  const totalCategories = categories?.length || 0;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min(totalCategories - visibleCount, prev + visibleCount),
    );
  };

  const visibleCategories =
    categories?.slice(startIndex, startIndex + visibleCount) || [];
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < totalCategories;

  // Calculate current page for dots (page-based, not item-based)
  const totalPages = Math.ceil(totalCategories / visibleCount);
  const currentPage = Math.floor(startIndex / visibleCount);

  return (
    <div className="py-6">
      <h2 className="text-lg font-semibold text-ocean-700 mb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        Kategori Populer
      </h2>

      {/* Carousel Container */}
      <div className="relative max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-ocean-200 
              flex items-center justify-center shadow-md transition-all duration-200 z-10
              ${
                canGoPrev
                  ? "hover:bg-ocean-500 hover:border-ocean-500 hover:shadow-lg cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }
              ${canGoPrev ? "text-ocean-600 hover:text-white" : "text-ocean-300"}`}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className="flex-1 flex gap-2 sm:gap-3 lg:gap-4 justify-center overflow-hidden"
          >
            {isLoading
              ? // Loading skeleton
                Array.from({ length: visibleCount }).map((_, i) => (
                  <div key={i} className="w-20 sm:w-28 lg:w-32 flex-shrink-0">
                    <div className="bg-white rounded-xl border border-ocean-100 shadow-sm overflow-hidden">
                      <div className="h-16 sm:h-20 lg:h-24 bg-ocean-50 animate-pulse" />
                      <div className="p-2 sm:p-3 text-center">
                        <div className="h-3 sm:h-4 w-16 sm:w-20 mx-auto bg-ocean-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              : // Categories from API
                visibleCategories.map((category: Category) => {
                  const isSelected = selectedCategory === category.slug;
                  const imageUrl =
                    category.image || getCategoryImage(category.slug);

                  return (
                    <button
                      key={category.id}
                      onClick={() =>
                        onCategoryChange(isSelected ? undefined : category.slug)
                      }
                      className={`w-20 sm:w-28 lg:w-32 flex-shrink-0 rounded-xl border-2 transition-all duration-300 overflow-hidden group
                      ${
                        isSelected
                          ? "border-ocean-500 shadow-xl ring-2 ring-ocean-100"
                          : "border-ocean-100 hover:border-ocean-200 hover:shadow-lg"
                      }`}
                    >
                      {/* Image Area with Gradient */}
                      <div className="relative h-16 sm:h-20 lg:h-24 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-ocean-50 via-white to-ocean-100" />
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className="object-contain p-2 sm:p-3 transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        {/* Emoji fallback overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className="text-2xl sm:text-3xl lg:text-4xl"
                            role="img"
                            aria-label={category.name}
                          >
                            {category.icon || "📦"}
                          </span>
                        </div>
                      </div>

                      {/* Label Area */}
                      <div
                        className={`p-2 sm:p-3 text-center transition-colors duration-200 ${
                          isSelected ? "bg-ocean-500" : "bg-white"
                        }`}
                      >
                        <span
                          className={`text-xs sm:text-sm font-semibold block truncate transition-colors duration-200 ${
                            isSelected
                              ? "text-white"
                              : "text-ocean-700 group-hover:text-ocean-600"
                          }`}
                        >
                          {category.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-ocean-200 
              flex items-center justify-center shadow-md transition-all duration-200 z-10
              ${
                canGoNext
                  ? "hover:bg-ocean-500 hover:border-ocean-500 hover:shadow-lg cursor-pointer"
                  : "opacity-30 cursor-not-allowed"
              }
              ${canGoNext ? "text-ocean-600 hover:text-white" : "text-ocean-300"}`}
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Pagination Dots - Page based, synced with prev/next */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const isActive = pageIndex === currentPage;
              return (
                <button
                  key={pageIndex}
                  onClick={() => setStartIndex(pageIndex * visibleCount)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 bg-ocean-500"
                      : "w-2 bg-ocean-200 hover:bg-ocean-300 cursor-pointer"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

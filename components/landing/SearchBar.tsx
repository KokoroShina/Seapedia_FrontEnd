'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (search: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md"
    >
      {/* Search Input Container */}
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused
            ? "0 0 0 3px rgba(28, 138, 196, 0.2)"
            : "0 0 0 0px rgba(28, 138, 196, 0)"
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center rounded-xl overflow-hidden bg-white border-2 transition-colors ${
          isFocused ? 'border-ocean-500' : 'border-ocean-100 hover:border-ocean-200'
        }`}
      >
        {/* Search Icon */}
        <div className="pl-4">
          <motion.div
            animate={{ scale: isFocused ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="w-5 h-5 text-ocean-400" />
          </motion.div>
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Cari produk seafood favorit..."
          className="w-full px-4 py-3 bg-transparent text-ocean-700 placeholder-ocean-300 focus:outline-none text-sm font-medium"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setValue('')}
              className="p-2 mr-2 text-ocean-400 hover:text-ocean-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Focus Border Animation */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : 0 }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-ocean-500 to-cyan-500"
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Search Suggestions Dropdown (optional enhancement) */}
      <AnimatePresence>
        {isFocused && !value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-ocean-100 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-ocean-50">
              <p className="text-xs text-ocean-400 font-medium uppercase tracking-wide">
                Pencarian Populer
              </p>
            </div>
            <div className="p-2">
              {['Ikan Segar', 'Udang Windu', 'Kepiting', 'Cumi-cumi', 'Kerang'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setValue(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-ocean-300" />
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

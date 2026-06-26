'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (search: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ocean-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari produk..."
        className="w-full max-w-md px-4 py-2 pl-10 rounded-xl border border-ocean-200 bg-ocean-50 text-sm text-ocean-700 placeholder-ocean-300 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ocean-400 hover:text-ocean-600"
        >
          ×
        </button>
      )}
    </div>
  )
}

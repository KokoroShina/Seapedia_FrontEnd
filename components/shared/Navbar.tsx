'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Wallet, ChevronDown, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useAuth } from '@/hooks/useAuth'
import SearchBar from '@/components/landing/SearchBar'

interface NavbarProps {
  onSearch: (search: string) => void
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { user, activeRole, isLoggedIn } = useAuthStore()
  const totalItems = useCartStore((state) => state.totalItems)
  const { logout, switchRole } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitchRole = async (role: string) => {
    try {
      await switchRole({ role: role as 'buyer' | 'seller' | 'driver' })
    } catch {
      // Error handled by useAuth
    }
    setIsDropdownOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
  }

  return (
    <nav className="h-16 bg-white border-b border-ocean-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="text-ocean-700">Sea</span>
            <span className="text-ocean-500">pedia</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Cart Badge */}
          <Link
            href="/cart"
            className="relative p-2 text-ocean-700 hover:text-ocean-500 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth Section */}
          {isLoggedIn ? (
            <>
              {/* Wallet Balance */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-ocean-50 rounded-lg">
                <Wallet className="w-4 h-4 text-ocean-500" />
                <span className="text-sm font-medium text-ocean-700">Rp 0</span>
              </div>

              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-ocean-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-ocean-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-ocean-600" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-ocean-100 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-ocean-100">
                      <p className="font-medium text-ocean-700">{user?.username}</p>
                      <p className="text-xs text-ocean-400">{user?.email}</p>
                    </div>

                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-ocean-700 hover:bg-ocean-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profil</span>
                    </Link>

                    {/* Switch Role (if multiple roles) */}
                    {user && (
                      <div className="border-t border-ocean-100 mt-2 pt-2">
                        <p className="px-4 py-1 text-xs text-ocean-400 font-medium uppercase">
                          Ganti Role
                        </p>
                        {['buyer', 'seller', 'driver'].map((role) => (
                          <button
                            key={role}
                            onClick={() => handleSwitchRole(role)}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              activeRole === role
                                ? 'bg-ocean-50 text-ocean-700 font-medium'
                                : 'text-ocean-600 hover:bg-ocean-50'
                            }`}
                          >
                            {role === 'buyer' ? 'Pembeli' : role === 'seller' ? 'Penjual' : 'Driver'}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Logout */}
                    <div className="border-t border-ocean-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-ocean-700 hover:text-ocean-500 transition-colors"
              >
                Masuk
              </Link>
              {/* Register Button */}
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium bg-ocean-500 text-white rounded-lg hover:bg-ocean-600 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search Bar - Mobile */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar onSearch={onSearch} />
      </div>
    </nav>
  )
}

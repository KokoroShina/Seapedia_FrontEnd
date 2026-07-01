'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const { login, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
    } catch {
      // Error handled by useAuth hook
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">
          <span className="text-[#0A2E4A]">Sea</span>
          <span className="text-[#1B8AC4]">pedia</span>
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">Marketplace Terpercaya Indonesia</p>
      </div>

      {/* Heading */}
      <h2 className="text-[22px] font-medium text-[#0A2E4A] mb-1">
        Masuk ke akun
      </h2>
      <p className="text-sm text-[#6B7280] mb-6">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="text-[#1B8AC4] font-medium hover:underline">
          Daftar di sini
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            placeholder="nama@email.com"
            className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Masukkan password"
              className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#4A7A9B] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-[13px] text-[#1B8AC4] hover:underline"
          >
            Lupa password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-[#E24B4A] bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0A2E4A] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#0d3a5c] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>
    </div>
  )
}

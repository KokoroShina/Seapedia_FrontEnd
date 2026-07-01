'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterForm() {
  const { register, loading, error, setError } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<'buyer' | 'seller' | 'driver'>('buyer')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Client-side validation
    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'Konfirmasi password tidak cocok' })
      return
    }

    try {
      await register({
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { errors?: Record<string, string[]> } } }
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors
        const fieldErrs: Record<string, string> = {}
        Object.keys(errors).forEach((key) => {
          fieldErrs[key] = errors[key][0]
        })
        setFieldErrors(fieldErrs)
      }
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
        Buat akun baru
      </h2>
      <p className="text-sm text-[#6B7280] mb-6">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="text-[#1B8AC4] font-medium hover:underline">
          Masuk di sini
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: '' }))
            }}
            placeholder="Masukkan username"
            className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
            required
            disabled={loading}
          />
          {fieldErrors.username && (
            <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }))
            }}
            placeholder="nama@email.com"
            className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
            required
            disabled={loading}
          />
          {fieldErrors.email && (
            <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password & Konfirmasi Password - 2 kolom */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#4A7A9B] mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }))
                }}
                placeholder="Min. 8 karakter"
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-[#4A7A9B] mb-1 block">Konfirmasi</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value)
                  if (fieldErrors.password_confirmation) setFieldErrors((p) => ({ ...p, password_confirmation: '' }))
                }}
                placeholder="Ulangi password"
                className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#4A7A9B] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password_confirmation && (
              <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.password_confirmation}</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Daftar sebagai</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'buyer' | 'seller' | 'driver')}
            className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
            required
            disabled={loading}
          >
            <option value="buyer">Pembeli</option>
            <option value="seller">Penjual</option>
            <option value="driver">Driver</option>
          </select>
          {fieldErrors.role && (
            <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.role}</p>
          )}
        </div>

        {/* Error Message */}
        {error && !Object.keys(fieldErrors).length && (
          <p className="text-xs text-[#E24B4A] bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B8AC4] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#1572A8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            'Daftar sekarang'
          )}
        </button>
      </form>
    </div>
  )
}

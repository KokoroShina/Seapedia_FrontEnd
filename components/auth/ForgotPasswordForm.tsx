'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Lock } from 'lucide-react'

export default function ForgotPasswordForm() {
  const { forgotPassword, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch {
      // Error handled by useAuth hook
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">
          <span className="text-[#0A2E4A]">Sea</span>
          <span className="text-[#1B8AC4]">pedia</span>
        </h1>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#EBF5FC] flex items-center justify-center">
          <Lock className="w-8 h-8 text-[#1B8AC4]" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-[22px] font-medium text-[#0A2E4A] text-center mb-2">
        Lupa password?
      </h2>
      <p className="text-sm text-[#6B7280] text-center mb-6">
        Masukkan email kamu dan kami akan mengirimkan kode OTP untuk reset password.
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
            disabled={loading || success}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-[#E24B4A] bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-xs text-[#0F6E56] bg-green-50 rounded-lg px-3 py-2">
            Kode OTP telah dikirim ke email kamu. Silakan cek inbox.
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-[#1B8AC4] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#1572A8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengirim OTP...
            </>
          ) : success ? (
            'OTP Terkirim'
          ) : (
            'Kirim OTP'
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-[13px] text-[#4A7A9B] hover:text-[#1B8AC4] transition-colors"
          >
            ← Kembali ke login
          </Link>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Mail } from 'lucide-react'

export default function VerifyOtpForm() {
  const { verifyOtp, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Ambil email dari sessionStorage saat komponen mount
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('reset_email')
      if (storedEmail) {
        setEmail(storedEmail)
      }
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Hanya terima angka
    const char = value.replace(/[^0-9]/g, '')
    if (char.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = char
    setOtp(newOtp)

    // Auto-focus ke input berikutnya
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (error) setError(null)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - mundur ke input sebelumnya
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    
    for (let i = 0; i < 6 && i < pastedData.length; i++) {
      const newOtp = [...otp]
      newOtp[i] = pastedData[i]
      setOtp(newOtp)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP')
      return
    }

    try {
      await verifyOtp(email, otpCode)
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
          <Mail className="w-8 h-8 text-[#1B8AC4]" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-[22px] font-medium text-[#0A2E4A] text-center mb-2">
        Cek email kamu
      </h2>
      <p className="text-sm text-[#6B7280] text-center mb-6">
        Kami telah mengirim kode OTP ke <span className="font-medium text-[#0A2E4A]">{email || '...'}</span>. Masukkan kode 6 digit di bawah.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input - 6 boxes */}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 border border-[#D6E8F5] rounded-[10px] text-center text-[20px] font-medium text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
              disabled={loading}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-[#E24B4A] bg-red-50 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-[#0A2E4A] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#0d3a5c] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            'Verifikasi'
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center">
          <button
            type="button"
            className="text-[13px] text-[#1B8AC4] hover:underline"
            onClick={() => {
              // TODO: Implement resend OTP functionality
            }}
          >
            Kirim ulang kode
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-[13px] text-[#4A7A9B] hover:text-[#1B8AC4] transition-colors"
          >
            ← Kembali ke login
          </Link>
        </div>
      </form>
    </div>
  )
}

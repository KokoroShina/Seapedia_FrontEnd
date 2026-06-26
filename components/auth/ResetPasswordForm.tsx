'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, ShieldCheck } from 'lucide-react'

export default function ResetPasswordForm() {
  const { resetPassword, loading, error, setError } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Ambil email dan OTP dari sessionStorage saat komponen mount
    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('reset_email')
      const storedOtp = sessionStorage.getItem('reset_otp')
      if (storedEmail) setEmail(storedEmail)
      if (storedOtp) setOtp(storedOtp)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Client-side validation
    if (password.length < 8) {
      setFieldErrors({ password: 'Password minimal 8 karakter' })
      return
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'Konfirmasi password tidak cocok' })
      return
    }

    try {
      await resetPassword(email, otp, password, passwordConfirmation)
      setSuccess(true)
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold">
          <span className="text-[#0A2E4A]">Sea</span>
          <span className="text-[#1B8AC4]">pedia</span>
        </h1>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#EBF5FC] flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-[#1B8AC4]" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-[22px] font-medium text-[#0A2E4A] text-center mb-2">
        Buat password baru
      </h2>
      <p className="text-sm text-[#6B7280] text-center mb-6">
        Password baru harus berbeda dari password sebelumnya.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Baru */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Password baru</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }))
                if (error) setError(null)
              }}
              placeholder="Min. 8 karakter"
              className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
              required
              disabled={loading || success}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#4A7A9B] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <span className="text-xs">Hide</span>
              ) : (
                <span className="text-xs">Show</span>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Konfirmasi Password Baru */}
        <div>
          <label className="text-xs text-[#4A7A9B] mb-1 block">Konfirmasi password baru</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value)
                if (fieldErrors.password_confirmation) setFieldErrors((p) => ({ ...p, password_confirmation: '' }))
                if (error) setError(null)
              }}
              placeholder="Ulangi password baru"
              className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
              required
              disabled={loading || success}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#4A7A9B] transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <span className="text-xs">Hide</span>
              ) : (
                <span className="text-xs">Show</span>
              )}
            </button>
          </div>
          {fieldErrors.password_confirmation && (
            <p className="text-xs text-[#E24B4A] mt-1">{fieldErrors.password_confirmation}</p>
          )}
        </div>

        {/* Error Message */}
        {error && !Object.keys(fieldErrors).length && (
          <p className="text-xs text-[#E24B4A] bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
            <p className="text-sm text-[#0F6E56] font-medium">
              Password berhasil direset!
            </p>
            <p className="text-xs text-[#0F6E56]/80 mt-1">
              Mengalihkan ke halaman login...
            </p>
          </div>
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
              Menyimpan...
            </>
          ) : success ? (
            'Berhasil!'
          ) : (
            'Simpan password'
          )}
        </button>
      </form>
    </div>
  )
}

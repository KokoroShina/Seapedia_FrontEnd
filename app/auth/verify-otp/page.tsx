'use client'
import AuthCard from '@/components/auth/AuthCard'
import VerifyOtpForm from '@/components/auth/VerifyOtpForm'

export default function VerifyOtpPage() {
  return (
    <AuthCard
      illustrationSide="right"
      illustrationSrc="/illustrations/auth-otp.svg"
      illustrationAlt="Verifikasi OTP"
      illustrationCaption="Masukkan kode OTP yang telah dikirim ke email kamu."
    >
      <VerifyOtpForm />
    </AuthCard>
  )
}

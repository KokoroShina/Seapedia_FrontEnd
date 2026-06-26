'use client'
import AuthCard from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <AuthCard
      illustrationSide="right"
      illustrationSrc="/illustrations/auth-reset.svg"
      illustrationAlt="Reset password berhasil"
      illustrationCaption="Password baru kamu sudah tersimpan dengan aman."
    >
      <ResetPasswordForm />
    </AuthCard>
  )
}

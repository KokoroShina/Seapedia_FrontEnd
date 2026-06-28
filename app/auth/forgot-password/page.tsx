'use client'
import AuthCard from '@/components/auth/AuthCard'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      illustrationSide="right"
      illustrationSrc="/illustrations/auth-forgot.svg"
      illustrationAlt="Reset password"
      illustrationCaption="Kami akan membantu Anda mengatur ulang password dengan aman."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}

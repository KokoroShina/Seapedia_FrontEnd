'use client'
import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthCard
      illustrationSide="left"
      illustrationSrc="/illustrations/auth-register.svg"
      illustrationAlt="Bergabung dengan Seapedia"
      illustrationCaption="Bergabung dan temukan ribuan produk dari seller terpercaya!"
    >
      <RegisterForm />
    </AuthCard>
  )
}

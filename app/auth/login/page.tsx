'use client'
import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthCard
      illustrationSide="right"
      illustrationSrc="/illustrations/auth-login.svg"
      illustrationAlt="Selamat datang di Seapedia"
      illustrationCaption="Selamat datang kembali! Masuk dan mulai belanja di Seapedia."
    >
      <LoginForm />
    </AuthCard>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirmation: string
  role: 'buyer' | 'seller' | 'driver'
}

interface SwitchRolePayload {
  role: string
}

interface AuthData {
  user: {
    id: number
    username: string
    email: string
    roles?: { id: number; name: string }[]
    created_at?: string
    updated_at?: string
  }
  active_role: string
  roles?: string[]
  token: string
}

interface SwitchRoleResponse {
  active_role: string
  token: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export function useAuth() {
  const router = useRouter()
  const { setAuth, setToken, clearAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login
  const login = async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<ApiResponse<AuthData>>('/auth/login', payload)
      const { user, active_role, token, roles } = res.data.data
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role: active_role }),
      })
      setToken(token)
      setAuth(user as any, active_role as any, roles)
      setLoading(false)
      router.push('/')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Login gagal. Silakan periksa email dan password Anda.')
      throw err
    }
  }

  // Register
  const register = async (payload: RegisterPayload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<ApiResponse<AuthData>>('/auth/register', payload)
      const { user, active_role, token } = res.data.data
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role: active_role }),
      })
      setToken(token)
      setAuth(user as any, active_role as any, [active_role])
      setLoading(false)
      router.push('/')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.')
      throw err
    }
  }

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout API errors
    }
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  // Switch Role
  const switchRole = async (payload: SwitchRolePayload) => {
    setLoading(true)
    try {
      const res = await api.post<ApiResponse<SwitchRoleResponse>>('/auth/switch-role', payload)
      const { active_role, token } = res.data.data
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role: active_role }),
      })
      setToken(token)
      const state = useAuthStore.getState()
      if (state.user) {
        setAuth(state.user, active_role as any, state.roles)
      }
      setLoading(false)
      const redirectMap: Record<string, string> = {
        buyer: '/',
        seller: '/seller/dashboard',
        driver: '/driver/dashboard',
        admin: '/admin/dashboard',
      }
      router.push(redirectMap[active_role] ?? '/')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Gagal mengganti role.')
      throw err
    }
  }

  // Forgot Password — kirim OTP ke email
  const forgotPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/forgot-password', { email })
      setLoading(false)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('reset_email', email)
      }
      router.push('/verify-otp')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Gagal mengirim OTP. Silakan coba lagi.')
      throw err
    }
  }

  // Verify OTP
  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      setLoading(false)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('reset_otp', otp)
      }
      router.push('/reset-password')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Kode OTP tidak valid.')
      throw err
    }
  }

  // Reset Password
  const resetPassword = async (
    email: string,
    otp: string,
    password: string,
    password_confirmation: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/reset-password', { email, otp, password, password_confirmation })
      setLoading(false)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('reset_email')
        sessionStorage.removeItem('reset_otp')
      }
      router.push('/login')
    } catch (err: unknown) {
      setLoading(false)
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Gagal reset password. Silakan coba lagi.')
      throw err
    }
  }

  return {
    login,
    register,
    logout,
    switchRole,
    forgotPassword,
    verifyOtp,
    resetPassword,
    loading,
    error,
    setError,
  }
}

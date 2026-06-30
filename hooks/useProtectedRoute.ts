import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function useProtectedRoute(allowedRoles?: string[]) {
  const router = useRouter()
  const { isAuthenticated, activeRole } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
      // Redirect to appropriate dashboard based on role
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        seller: '/seller/dashboard',
        driver: '/driver/dashboard',
        buyer: '/',
      }
      const redirectPath = redirectMap[activeRole] || '/'
      router.push(redirectPath)
    }
  }, [isAuthenticated, activeRole, allowedRoles, router])
}

export function useRoleRedirect() {
  const router = useRouter()
  const { isAuthenticated, activeRole } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Redirect to appropriate dashboard based on role after login
    if (activeRole) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        seller: '/seller/dashboard',
        driver: '/driver/dashboard',
        buyer: '/',
      }
      const redirectPath = redirectMap[activeRole] || '/'

      // Only redirect if currently on login page or root
      const currentPath = window.location.pathname
      if (currentPath === '/auth/login' || currentPath === '/') {
        router.push(redirectPath)
      }
    }
  }, [isAuthenticated, activeRole, router])
}

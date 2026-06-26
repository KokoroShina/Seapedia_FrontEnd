import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '@/types/auth'

interface AuthState {
  user: User | null
  activeRole: Role | null
  roles: string[]
  token: string | null
  isLoggedIn: boolean
  isAuthenticated: boolean
  setAuth: (user: User, role: Role, roles?: string[]) => void
  setToken: (token: string) => void
  setRole: (role: Role) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      roles: [],
      token: null,
      isLoggedIn: false,
      isAuthenticated: false,

      setAuth: (user, role, roles = []) =>
        set({ 
          user, 
          activeRole: role, 
          roles,
          isLoggedIn: true,
          isAuthenticated: true 
        }),

      setToken: (token) => set({ token }),

      setRole: (role) => set({ activeRole: role }),

      clearAuth: () =>
        set({ 
          user: null, 
          activeRole: null,
          roles: [],
          token: null,
          isLoggedIn: false,
          isAuthenticated: false 
        }),
    }),
    {
      name: 'seapedia-auth',
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
        roles: state.roles,
        isLoggedIn: state.isLoggedIn,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

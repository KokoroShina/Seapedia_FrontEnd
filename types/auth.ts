export interface User {
  id: number
  username: string
  email: string
  roles: { id: number; name: string }[]
  created_at: string
  updated_at: string
}

export type Role = 'buyer' | 'seller' | 'driver' | 'admin'

export interface AuthData {
  user: User
  active_role: Role
  roles?: string[]
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password_confirmation: string
  role: Role
}

export interface SwitchRolePayload {
  role: Role
}

export interface SwitchRoleResponse {
  active_role: Role
  token: string
}

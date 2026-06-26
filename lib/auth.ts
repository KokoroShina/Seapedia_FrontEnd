'use server'
import { cookies } from 'next/headers'
import type { Role } from '@/types/auth'

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get('seapedia_token')?.value
}

export async function getActiveRole(): Promise<Role | undefined> {
  return (await cookies()).get('seapedia_role')?.value as Role | undefined
}

export async function setAuthCookies(token: string, role: Role) {
  const cookieStore = await cookies()
  cookieStore.set('seapedia_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })
  cookieStore.set('seapedia_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('seapedia_token')
  cookieStore.delete('seapedia_role')
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getToken())
}

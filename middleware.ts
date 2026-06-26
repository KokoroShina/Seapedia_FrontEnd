import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/verify-otp', '/reset-password']

// Halaman auth: redirect ke home kalau sudah login
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password']

const ROLE_PATHS: Record<string, string> = {
  '/seller': 'seller',
  '/driver': 'driver',
  '/admin': 'admin',
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('seapedia_token')?.value
  const role = req.cookies.get('seapedia_role')?.value
  const { pathname } = req.nextUrl

  // Kalau sudah login dan akses halaman auth, redirect ke home
  if (token && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Kalau belum login dan akses halaman protected, redirect ke login
  if (!token && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Cek role untuk halaman khusus role
  for (const [path, requiredRole] of Object.entries(ROLE_PATHS)) {
    if (pathname.startsWith(path) && role !== requiredRole) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}

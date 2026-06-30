import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
]

const ROLE_PATHS: Record<string, string> = {
  '/seller': 'seller',
  '/driver': 'driver',
  '/admin': 'admin',
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get('seapedia_token')?.value
  const role = req.cookies.get('seapedia_role')?.value
  const { pathname } = req.nextUrl

  const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:80";
  const LARAVEL_URL_CLEAN = LARAVEL_API_URL.replace(/^https?:\/\//, '');

  // Proxy /storage requests to backend Laravel
  if (pathname.startsWith('/storage/')) {
    const backendUrl = new URL(req.url)
    backendUrl.port = ''
    backendUrl.hostname = LARAVEL_URL_CLEAN
    backendUrl.pathname = `/storage${pathname.replace('/storage', '')}`
    return NextResponse.rewrite(backendUrl)
  }

  // Cek apakah path termasuk public path secara presisi
  const isPublicPath = PUBLIC_PATHS.some((p) => {
    if (p === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(p)
  })

  // Kalau belum login dan akses halaman protected, redirect ke login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
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
  // Matcher for proxy middleware
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|illustrations/).*)',
  ],
}

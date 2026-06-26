import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_URL = process.env.LARAVEL_API_URL ?? 'http://localhost:8000'

async function handler(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('seapedia_token')?.value

  // Ambil path setelah /api/
  const pathname = req.nextUrl.pathname.replace(/^\/api\//, '')
  const search = req.nextUrl.search
  const targetUrl = `${LARAVEL_URL}/api/${pathname}${search}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const body = ['POST', 'PUT', 'PATCH'].includes(req.method)
    ? await req.text()
    : undefined

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler

# SEAPEDIA FRONTEND — P1: Fondasi & Setup

## Konteks Project

Kamu sedang membangun frontend **Seapedia**, sebuah marketplace e-commerce Indonesia menggunakan **Next.js 14 App Router** dengan TypeScript penuh.

Backend sudah selesai (Laravel 11 API). Tugas kamu sekarang adalah menyiapkan seluruh fondasi frontend sebelum mulai membuat halaman.

---

## Tech Stack

| Aspek | Teknologi |
|---|---|
| Framework | Next.js 14 App Router |
| Bahasa | TypeScript (strict) |
| UI | Shadcn/ui + Tailwind CSS |
| State management | Zustand |
| Data fetching | TanStack Query (React Query) v5 + Axios |
| Token storage | httpOnly cookie (dikelola server-side) |
| API communication | Next.js API Route sebagai proxy ke Laravel |

---

## Yang Harus Dibuat

### 1. Konfigurasi Tailwind & Warna Custom

Edit `tailwind.config.ts`, tambahkan warna custom Seapedia:

```ts
colors: {
  ocean: {
    50:  '#F7FAFD',
    100: '#EBF5FC',
    200: '#C8E2F5',
    300: '#8AAEC8',
    400: '#4A7A9B',
    500: '#1B8AC4',  // primary accent
    600: '#1572A8',
    700: '#0A2E4A',  // deep navy (text, sidebar)
  }
}
```

---

### 2. File Types

Buat folder `src/types/` dengan file-file berikut:

#### `src/types/api.ts`
```ts
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  current_page: number
  data: T[]
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
  per_page: number
  total: number
}
```

#### `src/types/auth.ts`
```ts
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
```

#### `src/types/product.ts`
```ts
export interface Store {
  id: number
  user_id: number
  name: string
  description: string
  address: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  store_id: number
  name: string
  description: string
  price: number
  stock: number
  image_url: string | null
  created_at: string
  updated_at: string
  store?: Store
  average_rating?: number
  review_count?: number
}

export interface Review {
  id: number
  product_id: number
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}
```

#### `src/types/order.ts`
```ts
export type OrderStatus =
  | 'sedang_dikemas'
  | 'menunggu_pengirim'
  | 'sedang_dikirim'
  | 'pesanan_selesai'
  | 'dikembalikan'

export type DeliveryMethod = 'instant' | 'next_day' | 'regular'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  store_id: number
  status: OrderStatus
  delivery_method: DeliveryMethod
  delivery_fee: number
  subtotal: number
  ppn: number
  discount_amount: number
  total: number
  voucher_code: string | null
  due_at: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
  store?: Store
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: Product
}

export interface Cart {
  items: CartItem[]
  store: Store | null
  subtotal: number
}

export interface Delivery {
  id: number
  order_id: number
  driver_id: number | null
  status: string
  due_at: string
  delivery_method: DeliveryMethod
  earning: number
  order?: Order
}
```

#### `src/types/wallet.ts`
```ts
export type TransactionType = 'topup' | 'payment' | 'refund' | 'earning'

export interface WalletTransaction {
  id: number
  user_id: number
  type: TransactionType
  amount: number
  description: string
  created_at: string
}

export interface Wallet {
  balance: number
  transactions: WalletTransaction[]
}

export interface TopupPayload {
  amount: number
  payment_method: string
}

export interface TopupResponse {
  merchantOrderId: string
  paymentUrl?: string
  vaNumber?: string
  qrString?: string
}
```

---

### 3. API Proxy (Universal)

Buat file `src/app/api/[...path]/route.ts`:

```ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_URL = process.env.LARAVEL_API_URL ?? 'http://localhost:8000'

async function handler(req: NextRequest) {
  const cookieStore = cookies()
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
```

---

### 4. Axios Instance

Buat `src/lib/axios.ts`:

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Response interceptor: handle 401 global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect ke login jika session expired
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

### 5. Auth Helper

Buat `src/lib/auth.ts`:

```ts
'use server'
import { cookies } from 'next/headers'
import type { Role } from '@/types/auth'

export async function getToken(): Promise<string | undefined> {
  return cookies().get('seapedia_token')?.value
}

export async function getActiveRole(): Promise<Role | undefined> {
  return cookies().get('seapedia_role')?.value as Role | undefined
}

export async function setAuthCookies(token: string, role: Role) {
  const cookieStore = cookies()
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
  const cookieStore = cookies()
  cookieStore.delete('seapedia_token')
  cookieStore.delete('seapedia_role')
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getToken())
}
```

---

### 6. Utils

Buat `src/lib/utils.ts` (tambahkan ke yang sudah ada dari Shadcn, jangan replace):

```ts
// Format angka ke Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal ke bahasa Indonesia
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr))
}

// Format tanggal + jam
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

// Label status pesanan
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    sedang_dikemas: 'Sedang Dikemas',
    menunggu_pengirim: 'Menunggu Pengirim',
    sedang_dikirim: 'Sedang Dikirim',
    pesanan_selesai: 'Pesanan Selesai',
    dikembalikan: 'Dikembalikan',
  }
  return labels[status] ?? status
}

// Label metode pengiriman
export function getDeliveryMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    instant: 'Instant (3 jam)',
    next_day: 'Next Day (1 hari)',
    regular: 'Regular (3 hari)',
  }
  return labels[method] ?? method
}
```

---

### 7. Zustand Auth Store

Buat `src/stores/authStore.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '@/types/auth'

interface AuthState {
  user: User | null
  activeRole: Role | null
  isLoggedIn: boolean
  setAuth: (user: User, role: Role) => void
  setRole: (role: Role) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      isLoggedIn: false,

      setAuth: (user, role) =>
        set({ user, activeRole: role, isLoggedIn: true }),

      setRole: (role) =>
        set({ activeRole: role }),

      clearAuth: () =>
        set({ user: null, activeRole: null, isLoggedIn: false }),
    }),
    {
      name: 'seapedia-auth',
      // Hanya persist user & activeRole, bukan token (token di httpOnly cookie)
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
```

---

### 8. Zustand UI Store

Buat `src/stores/uiStore.ts`:

```ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
}))
```

---

### 9. Middleware Route Protection

Buat `src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password']

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
  if (token && PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
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
```

---

### 10. Root Layout & Provider

Buat `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Seapedia — Marketplace Lokal Indonesia',
  description: 'Belanja produk pilihan dari seller terpercaya di seluruh Indonesia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

Buat `src/components/providers/QueryProvider.tsx`:

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 menit
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

### 11. Environment Variables

Buat `.env.local`:

```
LARAVEL_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Seapedia
```

---

## Checklist Setelah Selesai

- [ ] `tailwind.config.ts` sudah ada warna `ocean`
- [ ] Folder `src/types/` berisi `api.ts`, `auth.ts`, `product.ts`, `order.ts`, `wallet.ts`
- [ ] `src/app/api/[...path]/route.ts` sudah ada dan bisa forward request ke Laravel
- [ ] `src/lib/axios.ts` menggunakan baseURL `/api` (bukan langsung ke Laravel)
- [ ] `src/lib/auth.ts` bisa set/clear httpOnly cookie
- [ ] `src/lib/utils.ts` berisi `formatRupiah`, `formatDate`, `getOrderStatusLabel`
- [ ] `src/stores/authStore.ts` berisi state user + activeRole + isLoggedIn
- [ ] `src/stores/uiStore.ts` berisi state sidebar
- [ ] `src/middleware.ts` melindungi route berdasarkan token dan role
- [ ] `src/app/layout.tsx` sudah wrap dengan `QueryProvider`
- [ ] `.env.local` sudah ada `LARAVEL_API_URL`

## Catatan Penting

- Jangan buat halaman apapun di prompt ini — hanya fondasi
- Token TIDAK disimpan di localStorage, hanya di httpOnly cookie
- Axios selalu hit `/api/...` (proxy Next.js), bukan langsung `localhost:8000`
- Semua tipe data harus TypeScript strict, tidak ada `any`

# SEAPEDIA FRONTEND — P2: Auth Pages

## Konteks

Kamu melanjutkan project **Seapedia** frontend Next.js 14 App Router + TypeScript.
Fondasi sudah selesai di P1 (types, axios, proxy, middleware, stores, utils).

Sekarang buat seluruh halaman **autentikasi**: login, register, forgot password, verify OTP, dan reset password.

---

## Struktur File yang Harus Dibuat

```
src/
├── app/
│   └── (auth)/
│       ├── layout.tsx
│       ├── login/
│       │   └── page.tsx
│       ├── register/
│       │   └── page.tsx
│       ├── forgot-password/
│       │   └── page.tsx
│       ├── verify-otp/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
│
├── components/
│   └── auth/
│       ├── AuthCard.tsx         ← wrapper card dengan animasi
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ForgotPasswordForm.tsx
│       ├── VerifyOtpForm.tsx
│       └── ResetPasswordForm.tsx
│
└── hooks/
    └── useAuth.ts               ← semua logic auth (login, register, dll)
```

---

## Ilustrasi

Semua ilustrasi diambil dari folder `public/illustrations/`. Gunakan komponen `next/image` untuk menampilkannya.

File ilustrasi yang dibutuhkan (Juju akan download dari unDraw dan rename sesuai nama ini):
- `public/illustrations/auth-login.svg` → dipakai di halaman login
- `public/illustrations/auth-register.svg` → dipakai di halaman register
- `public/illustrations/auth-forgot.svg` → dipakai di halaman forgot password
- `public/illustrations/auth-otp.svg` → dipakai di halaman verify OTP
- `public/illustrations/auth-reset.svg` → dipakai di halaman reset password

Cara pakai ilustrasi:
```tsx
import Image from 'next/image'

<Image
  src="/illustrations/auth-login.svg"
  alt="Login illustration"
  width={320}
  height={320}
  priority
/>
```

---

## Desain & Layout

### Global Auth Layout (`src/app/(auth)/layout.tsx`)

- Background halaman: `#F7FAFD` (ocean light)
- Card auth ditampilkan di tengah halaman (horizontally + vertically centered)
- Card: `background: white`, `border-radius: 20px`, `border: 0.5px solid #D6E8F5`
- Card ukuran: `max-width: 900px`, `width: 95%`, `min-height: 480px`
- Card dibagi dua kolom: **ilustrasi** dan **form**
- Tidak ada navbar/sidebar di layout ini

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center p-4">
      {children}
    </div>
  )
}
```

---

### AuthCard Component (`src/components/auth/AuthCard.tsx`)

Wrapper card dengan **animasi transisi** saat berpindah antara login dan register.

Props:
```ts
interface AuthCardProps {
  illustrationSide: 'left' | 'right'  // posisi ilustrasi
  illustrationSrc: string              // path ke file SVG
  illustrationAlt: string
  illustrationCaption: string          // teks di bawah ilustrasi
  children: React.ReactNode            // form content
}
```

Layout:
- Kalau `illustrationSide === 'right'`: kolom kiri = form, kolom kanan = ilustrasi (**login**)
- Kalau `illustrationSide === 'left'`: kolom kiri = ilustrasi, kolom kanan = form (**register**)

Animasi:
- Gunakan **Framer Motion** (`motion.div`) untuk animasi masuk halaman
- Animasi: `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}` → `transition={{ duration: 0.35, ease: 'easeOut' }}`
- Panel ilustrasi dan panel form masing-masing punya animasi sendiri dengan sedikit delay beda

Panel ilustrasi:
- Background: `#EBF5FC`
- Display: flex column, center semua konten
- Padding: `32px`
- Caption teks: `14px`, `color: #4A7A9B`, center, `max-width: 200px`

Panel form:
- Padding: `40px 36px`
- Display: flex column, justify center

Install Framer Motion jika belum ada:
```bash
npm install framer-motion
```

---

## Hook Auth (`src/hooks/useAuth.ts`)

Buat custom hook yang handle semua API call auth menggunakan **Axios** (`src/lib/axios.ts`) dan **Zustand** (`src/stores/authStore.ts`).

```ts
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { LoginPayload, RegisterPayload, AuthData, SwitchRolePayload, SwitchRoleResponse } from '@/types/auth'
import type { ApiResponse } from '@/types/api'

export function useAuth() {
  const router = useRouter()
  const { setAuth, setRole, clearAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login
  const login = async (payload: LoginPayload) => {
    setLoading(true)
    setError(null)
    const res = await api.post<ApiResponse<AuthData>>('/auth/login', payload)
    const { user, active_role, token } = res.data.data
    // Simpan token ke httpOnly cookie via server action
    await fetch('/api/auth/set-cookie', {
      method: 'POST',
      body: JSON.stringify({ token, role: active_role }),
    })
    setAuth(user, active_role)
    setLoading(false)
    router.push('/')
  }

  // Register
  const register = async (payload: RegisterPayload) => {
    setLoading(true)
    setError(null)
    const res = await api.post<ApiResponse<AuthData>>('/auth/register', payload)
    const { user, active_role, token } = res.data.data
    await fetch('/api/auth/set-cookie', {
      method: 'POST',
      body: JSON.stringify({ token, role: active_role }),
    })
    setAuth(user, active_role)
    setLoading(false)
    router.push('/')
  }

  // Logout
  const logout = async () => {
    await api.post('/auth/logout')
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  // Switch Role
  const switchRole = async (payload: SwitchRolePayload) => {
    setLoading(true)
    const res = await api.post<ApiResponse<SwitchRoleResponse>>('/auth/switch-role', payload)
    const { active_role, token } = res.data.data
    await fetch('/api/auth/set-cookie', {
      method: 'POST',
      body: JSON.stringify({ token, role: active_role }),
    })
    setRole(active_role)
    setLoading(false)
    // Redirect sesuai role
    const redirectMap: Record<string, string> = {
      buyer: '/',
      seller: '/seller/dashboard',
      driver: '/driver/dashboard',
      admin: '/admin/dashboard',
    }
    router.push(redirectMap[active_role] ?? '/')
  }

  // Forgot Password — kirim OTP ke email
  const forgotPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    await api.post('/auth/forgot-password', { email })
    setLoading(false)
    // Simpan email ke sessionStorage untuk dipakai di halaman verify-otp
    sessionStorage.setItem('reset_email', email)
    router.push('/verify-otp')
  }

  // Verify OTP
  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true)
    setError(null)
    await api.post('/auth/verify-otp', { email, otp })
    setLoading(false)
    sessionStorage.setItem('reset_otp', otp)
    router.push('/reset-password')
  }

  // Reset Password
  const resetPassword = async (email: string, otp: string, password: string, password_confirmation: string) => {
    setLoading(true)
    setError(null)
    await api.post('/auth/reset-password', { email, otp, password, password_confirmation })
    setLoading(false)
    sessionStorage.removeItem('reset_email')
    sessionStorage.removeItem('reset_otp')
    router.push('/login')
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
```

---

## Cookie Handler Routes

Buat dua API route khusus untuk set/clear cookie dari client:

### `src/app/api/auth/set-cookie/route.ts`
```ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token, role } = await req.json()
  const cookieStore = cookies()

  cookieStore.set('seapedia_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  cookieStore.set('seapedia_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ success: true })
}
```

### `src/app/api/auth/clear-cookie/route.ts`
```ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete('seapedia_token')
  cookieStore.delete('seapedia_role')
  return NextResponse.json({ success: true })
}
```

---

## Halaman-Halaman Auth

### 1. Login (`src/app/(auth)/login/page.tsx`)

Layout: **form KIRI, ilustrasi KANAN**

```tsx
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
```

### `src/components/auth/LoginForm.tsx`

Isi form:
- Logo "**Sea**pedia" di atas (`Sea` navy `#0A2E4A`, `pedia` ocean `#1B8AC4`)
- Heading: "Masuk ke akun" (`22px`, `font-weight: 500`, `#0A2E4A`)
- Subtext + link ke register: "Belum punya akun? **Daftar di sini**"
- Field **Email** (type email)
- Field **Password** (type password, ada toggle show/hide dengan icon mata)
- Link "Lupa password?" rata kanan, `color: #1B8AC4`, `font-size: 13px`
- Tombol **Masuk**: full width, `background: #0A2E4A`, putih, `border-radius: 10px`, `height: 44px`
- Saat loading: tombol disabled + spinner

State management: pakai `useState` untuk field values, pakai `useAuth()` untuk submit.

Error handling: tampilkan pesan error dari API di bawah tombol, dalam `<p>` dengan `color: #E24B4A`.

---

### 2. Register (`src/app/(auth)/register/page.tsx`)

Layout: **ilustrasi KIRI, form KANAN** (dibalik dari login)

```tsx
'use client'
import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthCard
      illustrationSide="left"
      illustrationSrc="/illustrations/auth-register.svg"
      illustrationAlt="Bergabung dengan Seapedia"
      illustrationCaption="Bergabung dan temukan ribuan produk dari seller terpercaya!"
    >
      <RegisterForm />
    </AuthCard>
  )
}
```

### `src/components/auth/RegisterForm.tsx`

Isi form:
- Logo "**Sea**pedia"
- Heading: "Buat akun baru"
- Subtext + link ke login: "Sudah punya akun? **Masuk di sini**"
- Field **Username**
- Field **Email**
- Dua kolom sejajar: **Password** + **Konfirmasi Password** (keduanya ada toggle show/hide)
- Field **Role** — dropdown (`<select>`) dengan pilihan: `buyer`, `seller`, `driver` (default: `buyer`)
- Tombol **Daftar sekarang**: full width, `background: #1B8AC4`, putih, `border-radius: 10px`, `height: 44px`
- Saat loading: tombol disabled + spinner
- Error handling: sama seperti login

---

### 3. Forgot Password (`src/app/(auth)/forgot-password/page.tsx`)

Layout: **form KIRI, ilustrasi KANAN** (sama seperti login)

### `src/components/auth/ForgotPasswordForm.tsx`

Isi form:
- Logo "**Sea**pedia"
- Icon: `ti-lock` besar (`48px`, `color: #1B8AC4`) di atas heading
- Heading: "Lupa password?"
- Subtext: "Masukkan email kamu dan kami akan mengirimkan kode OTP untuk reset password."
- Field **Email**
- Tombol **Kirim OTP**: full width, `background: #1B8AC4`
- Link kembali: "← Kembali ke login", `color: #4A7A9B`, `font-size: 13px`, di bawah tombol

---

### 4. Verify OTP (`src/app/(auth)/verify-otp/page.tsx`)

Layout: **form KIRI, ilustrasi KANAN**

### `src/components/auth/VerifyOtpForm.tsx`

Isi form:
- Logo "**Sea**pedia"
- Icon: `ti-mail` besar (`48px`, `color: #1B8AC4`)
- Heading: "Cek email kamu"
- Subtext: "Kami telah mengirim kode OTP ke **{email}**. Masukkan kode 6 digit di bawah."
  - Email diambil dari `sessionStorage.getItem('reset_email')`
- Input OTP: **6 kotak terpisah** (bukan satu field biasa)
  - Setiap kotak: `width: 48px`, `height: 56px`, `border: 0.5px solid #D6E8F5`, `border-radius: 10px`, `text-align: center`, `font-size: 20px`, `font-weight: 500`
  - Auto-focus pindah ke kotak berikutnya saat isi angka
  - Auto-focus pindah mundur saat tekan Backspace
  - Focus state: `border-color: #1B8AC4`
- Tombol **Verifikasi**: full width, `background: #0A2E4A`
- Link "Kirim ulang kode" (`color: #1B8AC4`, `font-size: 13px`)

---

### 5. Reset Password (`src/app/(auth)/reset-password/page.tsx`)

Layout: **form KIRI, ilustrasi KANAN**

### `src/components/auth/ResetPasswordForm.tsx`

Isi form:
- Logo "**Sea**pedia"
- Icon: `ti-shield-check` besar (`48px`, `color: #1B8AC4`)
- Heading: "Buat password baru"
- Subtext: "Password baru harus berbeda dari password sebelumnya."
- Field **Password baru** (toggle show/hide)
- Field **Konfirmasi password baru** (toggle show/hide)
- Tombol **Simpan password**: full width, `background: #1B8AC4`
- Email dan OTP diambil otomatis dari `sessionStorage` (tidak ditampilkan ke user)
- Setelah berhasil: redirect ke `/login` + tampilkan toast sukses

---

## Styling Detail

Semua form field menggunakan style konsisten:
```tsx
// Label
<label className="text-xs text-[#4A7A9B] mb-1 block">Email</label>

// Input
<input
  className="w-full border border-[#D6E8F5] rounded-[10px] px-3.5 py-2.5 text-sm text-[#0A2E4A] bg-[#F7FAFD] outline-none focus:border-[#1B8AC4] transition-colors"
/>

// Error message
<p className="text-xs text-[#E24B4A] mt-1">{error}</p>

// Primary button (dark)
<button className="w-full bg-[#0A2E4A] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#0d3a5c] transition-colors disabled:opacity-60">

// Primary button (blue)
<button className="w-full bg-[#1B8AC4] text-white rounded-[10px] h-11 text-sm font-medium hover:bg-[#1572A8] transition-colors disabled:opacity-60">
```

---

## Animasi Transisi

Di `AuthCard.tsx`, gunakan Framer Motion:

```tsx
import { motion } from 'framer-motion'

// Wrapper card
<motion.div
  initial={{ opacity: 0, scale: 0.97 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
  className="..."
>
  {/* Panel ilustrasi */}
  <motion.div
    initial={{ opacity: 0, x: illustrationSide === 'left' ? -20 : 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
  >
    ...
  </motion.div>

  {/* Panel form */}
  <motion.div
    initial={{ opacity: 0, x: illustrationSide === 'left' ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
  >
    ...
  </motion.div>
</motion.div>
```

---

## API Endpoints yang Dipakai

| Action | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Logout | POST | `/auth/logout` |
| Switch Role | POST | `/auth/switch-role` |
| Forgot Password | POST | `/auth/forgot-password` |
| Verify OTP | POST | `/auth/verify-otp` |
| Reset Password | POST | `/auth/reset-password` |

Semua request dikirim via Axios ke `/api/...` (proxy Next.js → Laravel).
Response format: `{ success: boolean, message: string, data: T }`

---

## Checklist Setelah Selesai

- [ ] `src/app/(auth)/layout.tsx` — layout terpusat, background `#F7FAFD`
- [ ] `src/components/auth/AuthCard.tsx` — card dua kolom + Framer Motion animasi
- [ ] `src/hooks/useAuth.ts` — semua logic auth
- [ ] `src/app/api/auth/set-cookie/route.ts` — set httpOnly cookie
- [ ] `src/app/api/auth/clear-cookie/route.ts` — clear httpOnly cookie
- [ ] `/login` — form kiri, ilustrasi kanan, pakai `auth-login.svg`
- [ ] `/register` — ilustrasi kiri, form kanan (dibalik), pakai `auth-register.svg`
- [ ] `/forgot-password` — form + icon lock, pakai `auth-forgot.svg`
- [ ] `/verify-otp` — 6 kotak OTP terpisah dengan auto-focus, pakai `auth-otp.svg`
- [ ] `/reset-password` — dua field password + toggle, pakai `auth-reset.svg`
- [ ] Framer Motion terinstall (`npm install framer-motion`)
- [ ] Semua error API ditampilkan di UI
- [ ] Toggle show/hide password berfungsi di semua field password
- [ ] Redirect setelah login/register ke `/`
- [ ] Redirect setelah logout ke `/login`

## Catatan Penting

- Ilustrasi diambil dari `public/illustrations/` — jika file belum ada, buat placeholder sementara dengan `<div>` berwarna `#EBF5FC`
- Jangan hardcode token di mana pun — selalu lewat httpOnly cookie
- Semua halaman ini `'use client'` karena butuh form interaktif
- Gunakan `next/link` untuk navigasi antar halaman auth (bukan `<a>` biasa)
- Pastikan `sessionStorage` hanya diakses di client side (bungkus dengan `typeof window !== 'undefined'`)

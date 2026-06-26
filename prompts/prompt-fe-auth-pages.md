# Prompt: Auth Pages (Login & Register) — SEAPEDIA Frontend

Buatkan halaman Login dan Register untuk project Next.js 14 (App Router) bernama SEAPEDIA menggunakan TypeScript. Ini adalah langkah PERTAMA pembangunan frontend — belum ada komponen lain yang dibuat sebelumnya.

## Tech Stack yang Sudah Terinstall

```
Next.js 14 (App Router)
TypeScript
Tailwind CSS
Shadcn/ui (sudah di-init, komponen UI bisa langsung di-import dari '@/components/ui/...')
Zustand
React Query (TanStack Query)
Axios
```

## Warna Brand SEAPEDIA (gunakan sebagai Tailwind custom color atau inline style)

```
Primary (navy)  : #042C53
Accent (teal)   : #0F6E56
Background      : #F1EFE8
Text utama      : #1A1A1A
Text sekunder   : #6B7280
Border          : #E5E3DC
```

Tambahkan custom color ini ke `tailwind.config.ts`:

```ts
colors: {
  seapedia: {
    navy: '#042C53',
    teal: '#0F6E56',
    bg: '#F1EFE8',
  }
}
```

## Arsitektur Auth (PENTING, ikuti persis)

- Token Sanctum Laravel disimpan sebagai **httpOnly cookie** — JavaScript TIDAK bisa baca/set cookie ini secara langsung
- Semua request ke Laravel API dilakukan lewat **Next.js API Route proxy** (belum dibuat di prompt ini, akan dibuat di prompt berikutnya) — untuk saat ini, anggap endpoint proxy tersedia di `/api/auth/login` dan `/api/auth/register`
- Setelah login sukses, data user dan `active_role` disimpan ke **Zustand store** (bukan di cookie/localStorage langsung)
- Cookie httpOnly di-set oleh Next.js API Route proxy di server-side (bukan di halaman ini)

## File yang Perlu Dibuat

### 1. Zustand Auth Store

**Path:** `stores/authStore.ts`

```ts
interface AuthUser {
  id: number;
  username: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  activeRole: string | null;
  roles: string[];
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, activeRole: string, roles: string[]) => void;
  clearAuth: () => void;
}
```

Gunakan `create` dari Zustand. `setAuth` mengisi semua field, `clearAuth` reset semua ke null/false/[].

### 2. Axios Instance

**Path:** `lib/axios.ts`

- Base URL: `/api` (relative, karena request ke Next.js proxy, bukan langsung ke Laravel)
- Default headers: `Content-Type: application/json`
- Interceptor response: jika response status 401, redirect ke `/login` (gunakan `window.location.href`)
- Export sebagai default

### 3. TypeScript Types

**Path:** `types/auth.ts`

```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginData {
  user: {
    id: number;
    username: string;
    email: string;
  };
  roles: string[];
  active_role: string;
  token: string;
}

export interface RegisterData {
  user: {
    id: number;
    username: string;
    email: string;
  };
  active_role: string;
  token: string;
}
```

### 4. Halaman Login

**Path:** `app/(auth)/login/page.tsx`

**Layout:** dua kolom (desktop), satu kolom (mobile)

- **Kolom kiri (60%)**: ilustrasi undraw sebagai `<img>` dengan src placeholder `/illustrations/login.svg` — gunakan undraw style (user bisa ganti file-nya nanti). Background kolom kiri menggunakan warna `seapedia.bg` (`#F1EFE8`). Tambahkan tagline singkat SEAPEDIA di bawah ilustrasi.
- **Kolom kanan (40%)**: form login

**Form Login:**

- Logo/nama "seapedia" di atas (text, pakai warna `seapedia.navy`)
- Heading: "Selamat datang kembali"
- Subheading: "Masuk ke akun SEAPEDIA Anda"
- Field: `email` (type email), `password` (type password, ada toggle show/hide)
- Tombol submit: "Masuk" — background `seapedia.navy`, full width, loading state saat submit
- Link di bawah: "Belum punya akun? **Daftar sekarang**" → `/register`

**Logic:**

1. Submit form → POST ke `/api/auth/login` via axios dengan `{ email, password }`
2. Jika sukses (`success: true`): simpan `user`, `active_role`, `roles` ke Zustand store → redirect berdasarkan `active_role`:
   - `buyer` → `/`
   - `seller` → `/seller/dashboard`
   - `driver` → `/driver/dashboard`
   - `admin` → `/admin/dashboard`
3. Jika gagal: tampilkan pesan error dari response (`message`) di bawah form (bukan alert browser)
4. Gunakan `useState` untuk form state dan loading state (bukan React Query, karena ini mutation satu kali)

### 5. Halaman Register

**Path:** `app/(auth)/register/page.tsx`

**Layout:** sama seperti login (dua kolom), tapi ilustrasi berbeda — src placeholder `/illustrations/register.svg`

**Form Register:**

- Logo/nama "seapedia" di atas
- Heading: "Buat akun baru"
- Subheading: "Bergabung dengan SEAPEDIA hari ini"
- Field:
  - `username` (text)
  - `email` (type email)
  - `password` (type password, ada toggle show/hide)
  - `password_confirmation` (type password, ada toggle show/hide)
  - `role` — dropdown `<Select>` dari Shadcn/ui dengan pilihan: Pembeli (`buyer`), Penjual (`seller`), Driver (`driver`)
- Tombol submit: "Daftar" — background `seapedia.navy`, full width, loading state
- Link di bawah: "Sudah punya akun? **Masuk**" → `/login`

**Logic:**

1. Submit form → POST ke `/api/auth/register` via axios dengan `{ username, email, password, password_confirmation, role }`
2. Validasi client-side sederhana: password dan password_confirmation harus sama sebelum submit
3. Jika sukses (`success: true`): tampilkan pesan sukses "Registrasi berhasil! Silakan masuk." → redirect ke `/login` setelah 1.5 detik
4. Jika gagal: tampilkan pesan error dari response (`message`) di bawah form

## Styling & UX Rules

- Gunakan komponen Shadcn/ui: `Input`, `Button`, `Label`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- Semua halaman auth menggunakan background putih (`#FFFFFF`) untuk kolom form, `#F1EFE8` untuk kolom ilustrasi
- Font size heading: `text-2xl font-semibold`
- Border radius input: ikuti default Shadcn
- Responsive: di mobile (< 768px), kolom ilustrasi disembunyikan (`hidden md:block`), hanya form yang tampil full width
- Form validation error ditampilkan dengan teks merah kecil (`text-sm text-red-500`) di bawah field yang bermasalah (jika ada error dari server per field di `errors` object) ATAU di bawah tombol submit (jika error umum dari `message`)

## Catatan Penting

- JANGAN hardcode URL Laravel langsung (`http://localhost:8000/api/...`) — selalu gunakan axios instance dari `lib/axios.ts` yang base URL-nya `/api` (proxy)
- JANGAN gunakan `localStorage` untuk menyimpan token — token dihandle server-side oleh proxy (akan dibuat di prompt berikutnya)
- Folder `public/illustrations/` perlu dibuat manual oleh user, lalu isi dengan file SVG dari undraw.co — cukup buat referensi path-nya saja di kode, jangan generate SVG inline
- Komponen UI dari Shadcn yang belum ada perlu di-install dulu, tambahkan command instalasinya di awal response sebagai catatan

## Output yang Diharapkan

1. `tailwind.config.ts` — ditambahkan custom color seapedia
2. `stores/authStore.ts` — Zustand auth store
3. `lib/axios.ts` — axios instance
4. `types/auth.ts` — TypeScript interfaces
5. `app/(auth)/login/page.tsx` — halaman login lengkap
6. `app/(auth)/register/page.tsx` — halaman register lengkap
7. Folder `public/illustrations/` dibuat kosong dengan `README.md` berisi instruksi download ilustrasi dari undraw.co

## Batasan

- JANGAN membuat middleware.ts dulu — itu prompt berikutnya
- JANGAN membuat Next.js API Route proxy dulu — itu prompt berikutnya
- JANGAN menggunakan React Query untuk form submission auth — cukup `useState` + axios langsung
- JANGAN membuat halaman lain selain login dan register
- Pastikan semua import path menggunakan alias `@/` (sudah dikonfigurasi di `tsconfig.json`)

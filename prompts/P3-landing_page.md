Baik, saya tulis ulang prompt P3 dengan format yang **rapi, terstruktur, dan enak dibaca** dalam satu blok teks. Copy seluruh isi di bawah ini dan jalankan ke Cline.

---

# SEAPEDIA FRONTEND — P3: LANDING PAGE / HOMEPAGE BUYER

## 1. KONTEKS
P1 (Fondasi) dan P2 (Auth Pages) sudah selesai. Sekarang buat Landing Page / Homepage untuk role **buyer** (public). Halaman ini bisa diakses tanpa login, tapi konten tertentu berubah berdasarkan status autentikasi. Backend API sudah siap (lihat `docs/API-REFERENCE.md`). Semua data produk, kategori, dan cart berasal dari API.

---

## 2. STRUKTUR FILE YANG HARUS DIBUAT
```
src/
├── app/
│   └── page.tsx                         ← Landing page (root)
│
├── components/
│   ├── shared/
│   │   ├── Navbar.tsx                   ← Navbar dengan search + cart badge + auth
│   │   ├── Footer.tsx                   ← Footer
│   │   └── ProductCard.tsx              ← Card produk (grid)
│   │
│   ├── landing/
│   │   ├── HeroSection.tsx              ← Hero + CTA
│   │   ├── CategoryBar.tsx              ← Category horizontal scroll (dari API)
│   │   ├── ProductGrid.tsx              ← Grid produk + pagination + filter sort
│   │   ├── PromoBanner.tsx              ← Promo banner (static dulu)
│   │   └── SearchBar.tsx                ← Live search (di Navbar)
│   │
│   └── ui/
│       └── Skeleton.tsx                 ← Loading shimmer (custom)
│
├── hooks/
│   ├── useProducts.ts                   ← UPDATE: tambah search & sort
│   ├── useCategories.ts                 ← BARU: fetch categories
│   └── useDebounce.ts                   ← BARU: debounce untuk live search
│
├── stores/
│   └── cartStore.ts                     ← BARU: Zustand cart store dengan persist
│
└── lib/
    └── constants.ts                     ← UPDATE: tambah DELIVERY_METHODS jika belum
```

---

## 3. DESAIN & VISUAL
**Warna (sudah di tailwind.config.ts):**
- `ocean-700: #0A2E4A` (navy, untuk teks utama, tombol dark)
- `ocean-500: #1B8AC4` (primary accent, untuk tombol biru, link)
- `ocean-50: #F7FAFD` (background light)
- `ocean-100: #EBF5FC` (card, hover)
- `ocean-200: #C8E2F5` (border, placeholder)
- `ocean-400: #4A7A9B` (subtext)
- Putih: untuk card, navbar, footer

**Tipografi (Inter dari layout):**
- Hero heading: `text-4xl md:text-5xl lg:text-6xl font-bold text-ocean-700 leading-tight`
- Hero subheading: `text-lg md:text-xl text-ocean-400`
- Nama produk: `text-sm font-medium text-ocean-700 truncate`
- Harga produk: `text-base font-bold text-ocean-700`
- Nama toko: `text-xs text-ocean-400 truncate`
- Kategori: `text-sm font-medium text-ocean-700`
- Section title: `text-2xl font-bold text-ocean-700`

**Spacing & Layout:**
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Navbar height: `h-16`
- Hero: `min-h-[480px] flex items-center`
- Product grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6`
- Category bar: `flex gap-4 overflow-x-auto py-4 scrollbar-hide`
- Section spacing: `py-12 md:py-16`

---

## 4. KOMPONEN YANG HARUS DIBUAT (URUTAN PRIORITAS)

### 4.1 `src/stores/cartStore.ts` (Zustand)
- State: `items: CartItem[]` (dengan `product_id`, `quantity`, `product` object), `totalItems: number`, `totalPrice: number`
- Actions: `addItem` (merge jika produk sudah ada), `removeItem`, `updateQuantity` (jika <=0 hapus), `clearCart`, `syncWithApi`
- Gunakan persist middleware dengan nama `'seapedia-cart'`
- `CartItem` type dari `src/types/order.ts`

### 4.2 `src/hooks/useDebounce.ts`
- `function useDebounce<T>(value: T, delay: number = 300): T`
- State `debouncedValue`, useEffect dengan setTimeout, cleanup clearTimeout

### 4.3 `src/hooks/useCategories.ts`
- React Query hook: `export function useCategories()`
- Query key: `['categories']`
- Query fn: `api.get<ApiResponse<Category[]>>('/categories')` → return `res.data.data`
- Type Category: `{ id: number, name: string, slug: string, icon: string }`
- StaleTime: 5 menit

### 4.4 `src/hooks/useProducts.ts` (UPDATE dari P1)
- Tambah parameter `search` dan `sort`
- Interface: `UseProductsParams { search?: string, sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating', page?: number, per_page?: number }`
- Query key: `['products', params]`
- Endpoint: `GET /products` dengan query params
- Per_page default: 8
- Return: `PaginatedResponse<Product>`
- StaleTime: 1 menit

### 4.5 `src/components/ui/Skeleton.tsx`
- Komponen sederhana dengan className: `animate-pulse bg-ocean-100 rounded`
- Props: `className?: string`
- Untuk gambar: tambahkan `aspect-square`
- Untuk teks: `h-4 w-full`
- Untuk card: `rounded-xl`

### 4.6 `src/components/shared/ProductCard.tsx`
- Props: `product: Product`
- Tampilkan: image (pakai `next/image` dengan fallback placeholder), name (truncate), price (`formatRupiah`), store name (truncate), rating (bintang dari `average_rating`)
- Bungkus dengan `Link` ke `/products/[id]`
- Tombol "Tambah ke Keranjang": onClick panggil `useCartStore.addItem`
- Animasi hover: `scale-105 shadow-lg transition-all`
- Jika `stock === 0`: tampilkan label "Stok Habis" dan disable tombol

### 4.7 `src/components/landing/HeroSection.tsx`
- Layout: `flex flex-col md:flex-row items-center gap-8 md:gap-12`
- Kiri: h1 tagline "Temukan produk pilihan dari seller terpercaya", p subheading "Belanja aman dan terpercaya di Seapedia", tombol "Mulai Belanja" (bg ocean-700, text-white, rounded-xl px-8 py-3, hover:opacity-90)
- Klik tombol: smooth scroll ke `#products-section`
- Kanan: placeholder div `w-full md:w-1/2 aspect-video bg-ocean-200 rounded-2xl flex items-center justify-center text-ocean-400` dengan tulisan "Hero Image Placeholder"

### 4.8 `src/components/landing/CategoryBar.tsx`
- Gunakan `useCategories()`
- Loading: tampilkan 8 skeleton horizontal (Skeleton dengan width 72px height 72px)
- Error: tampilkan pesan error
- Data: map ke div dengan icon + name (flex-col items-center gap-1 min-w-[72px])
- Klik category → set filter category di parent state (via props `onCategoryChange`)
- Overflow-x: auto, scrollbar-hide

### 4.9 `src/components/landing/SearchBar.tsx` (di dalam Navbar)
- Input text placeholder "Cari produk..." 
- ClassName: `w-full max-w-md px-4 py-2 rounded-xl border border-ocean-200 bg-ocean-50 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500`
- Gunakan `useDebounce` untuk value (delay 300ms)
- useEffect trigger `onSearch` ke parent

### 4.10 `src/components/landing/ProductGrid.tsx`
- Props: `search?: string`, `category?: string`, `sort?: string`
- Gunakan `useProducts` dengan params `{ search, per_page: 8, sort }`
- Loading: tampilkan 8 skeleton cards (grid)
- Error: tampilkan pesan error
- Data kosong: tampilkan "Tidak ada produk"
- Sort dropdown: `newest`, `price_asc`, `price_desc` (onChange setSort ke parent)
- Pagination: tombol Prev/Next berdasarkan `data.current_page` dan `data.last_page`

### 4.11 `src/components/landing/PromoBanner.tsx`
- Static untuk P3: div bg ocean-700 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center
- Kiri: h3 text-2xl font-bold text-white "Dapatkan diskon hingga 50% untuk pembelian pertama!", p text-ocean-100 "Gunakan kode promo WELCOME50"
- Kanan: tombol "Lihat Promo" (bg white, text-ocean-700, rounded-xl px-6 py-3)

### 4.12 `src/components/shared/Navbar.tsx`
- Layout: flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto
- Kiri: Logo "Sea pedia" (Sea ocean-700, pedia ocean-500) + Link ke `/`
- Tengah: SearchBar (hidden md:flex)
- Kanan: conditional rendering
  - Belum login: tombol "Masuk" (Link ke `/login`) dan "Daftar" (Link ke `/register`)
  - Login: Wallet balance (tampilkan "Rp 0" dulu, icon Wallet), Cart badge (Link ke `/cart`, tampilkan totalItems dari cartStore dengan badge merah), Avatar dropdown (Profile, Switch Role jika roles > 1, Logout)
- Gunakan `useAuthStore` untuk user, activeRole, isLoggedIn
- Gunakan `useCartStore` untuk totalItems
- Switch role: panggil `useAuth().switchRole` lalu redirect sesuai role

### 4.13 `src/components/shared/Footer.tsx`
- Layout: bg-white border-t border-ocean-100 py-8 md:py-12
- Grid 2/4 kolom: Logo + deskripsi, "Tentang" (Tentang Kami, Kontak, Karir), "Belanja" (Produk, Toko, Promo), "Bantuan" (FAQ, Kebijakan Privasi, Syarat & Ketentuan)
- Bottom: border-t, copyright

### 4.14 `src/app/page.tsx` (Client Component)
- State: `search`, `category`, `sort` (lifted)
- Gunakan useState untuk ketiga state tersebut
- Render: Navbar, HeroSection, CategoryBar (with onCategoryChange), section id="products-section" dengan title "Produk Pilihan", ProductGrid (dengan props search, category, sort), PromoBanner, Footer
- Framer Motion fade-in untuk Hero, ProductGrid, PromoBanner

---

## 5. API INTEGRASI
- `GET /api/categories` (public) → CategoryBar
- `GET /api/products?search=&per_page=8&sort=` (public) → ProductGrid
- Cart API (GET, POST, PUT, DELETE) akan diintegrasikan di P4, tapi cartStore sudah siap untuk sync

---

## 6. ANIMASI & INTERAKSI
- ProductCard hover: scale-105, shadow-lg, transition-all duration-200
- Category item hover: bg-ocean-100 rounded-lg transition
- Button hover: opacity-90
- Skeleton: animate-pulse
- Framer Motion fade-in: Hero, ProductGrid, PromoBanner (`motion.div` dengan `initial opacity 0 y 20`, `animate opacity 1 y 0`, `transition 0.4`)
- Smooth scroll ke `#products-section` saat klik "Mulai Belanja"

---

## 7. AUTH FLOW DI HOMEPAGE
- Belum login: tampilkan tombol "Masuk" dan "Daftar" di navbar, wallet tidak muncul, cart badge tetap muncul (0)
- Sudah login: tombol login/daftar hilang, muncul wallet + avatar + cart badge
- Switch role: panggil `useAuth().switchRole`, redirect ke halaman sesuai role (buyer → `/`, seller → `/seller/dashboard`, driver → `/driver/dashboard`, admin → `/admin/dashboard`)

---

## 8. CHECKLIST
- [ ] `src/stores/cartStore.ts` dengan persist dan semua actions
- [ ] `src/hooks/useDebounce.ts`
- [ ] `src/hooks/useCategories.ts`
- [ ] `src/hooks/useProducts.ts` (update dengan search & sort)
- [ ] `src/components/ui/Skeleton.tsx`
- [ ] `src/components/shared/ProductCard.tsx` (dengan add to cart, hover, stock check)
- [ ] `src/components/landing/HeroSection.tsx` (placeholder, smooth scroll)
- [ ] `src/components/landing/CategoryBar.tsx` (dari API, horizontal scroll, filter)
- [ ] `src/components/landing/SearchBar.tsx` (live search dengan debounce)
- [ ] `src/components/landing/ProductGrid.tsx` (grid, skeleton, pagination, sort dropdown)
- [ ] `src/components/landing/PromoBanner.tsx` (static)
- [ ] `src/components/shared/Navbar.tsx` (conditional auth, wallet, cart badge, avatar dropdown, switch role)
- [ ] `src/components/shared/Footer.tsx`
- [ ] `src/app/page.tsx` (gabungkan semua, state lifted)
- [ ] Framer Motion untuk animasi fade-in
- [ ] Semua import dan type benar
- [ ] Tidak ada error TypeScript
- [ ] Responsive di semua ukuran layar

---

## 9. CATATAN PENTING
- Semua komponen interaktif pakai `'use client'`
- Ilustrasi hero pakai placeholder div (nanti bisa diganti)
- Wallet balance untuk sementara tampilkan "Rp 0" meskipun sudah login (integrasi P4)
- Cart badge ambil dari `cartStore.totalItems`, belum sync API (nanti P4)
- Category filter: klik category → set state di page.tsx → ProductGrid refetch
- Sort dropdown: default "newest"
- Pagination: gunakan data dari `useProducts`, tombol Prev/Next set page
- Semua error API ditampilkan ke user (toast atau alert)
- Gunakan `next/link` untuk navigasi internal, jangan `<a>`
- Gambar produk pakai `next/image` dengan width/height, fallback placeholder
- Pastikan `framer-motion` sudah terinstall: `npm install framer-motion`

---

**Selesai. Jalankan prompt ini ke Cline untuk generate seluruh P3.**
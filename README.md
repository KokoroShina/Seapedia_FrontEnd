# SEAPEDIA - Marketplace Platform

<p align="center">
  <img src="https://via.placeholder.com/120x40/1B8AC4/FFFFFF?text=SEAPEDIA" alt="SEAPEDIA Logo" />
</p>

> **SEAPEDIA** adalah platform marketplace terpercaya yang menyediakan berbagai produk berkualitas dari ribuan seller di seluruh Indonesia. Namanya mungkin terinspirasi dari "Sea" (Laut), tapi sebenarnya kami menyediakan **berbagai kategori produk** - bukan hanya seafood! Mulai dari makanan, minuman, fashion, elektronik, hingga kebutuhan rumah tangga - semua ada di SEAPEDIA.

## 📋 Deskripsi Project

SEAPEDIA adalah platform e-commerce multi-role yang memungkinkan pengguna untuk berperan sebagai:

- **Pembeli (Buyer)** - Belanja berbagai produk dari seller terpercaya
- **Penjual (Seller)** - Memulai dan mengelola toko online sendiri
- **Driver** - Mengambil dan mengantar pesanan ke pembeli
- **Admin** - Mengelola platform, kategori, promo, dan voucher

### ✨ Fitur Utama

- 🛒 **Multi-Role System** - Ganti role dengan mudah sesuai kebutuhan
- 💰 **Single-Store Checkout** - Checkout per toko dalam satu waktu
- 👛 **Seapedia Wallet** - Sistem dompet digital untuk transaksi
- 🎫 **Promo & Voucher** - Diskon dan voucher menarik
- 📱 **Responsive Design** - Tampilan optimal di semua device
- 🔒 **Secure Authentication** - Login/register dengan OTP

## 🛠 Tech Stack

| Teknologi | Deskripsi |
|-----------|-----------|
| **Framework** | Next.js 16.2.9 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Framer Motion |
| **State Management** | Zustand |
| **Data Fetching** | TanStack Query (React Query) |
| **HTTP Client** | Axios |
| **UI Components** | Shadcn/UI + Radix UI |
| **Icons** | Lucide React |
| **Authentication** | Cookie-based dengan JWT |

## 🚀 Cara Setup & Instalasi

### Prasyarat

- Node.js 20+
- npm / yarn / pnpm / bun

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd seapedia_frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.production .env.local

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Environment Variables

Buat file `.env.local` di root project dengan variabel berikut:

```env
# API Configuration
LARAVEL_API_URL=https://seapediabackend-production-6b92.up.railway.app
NEXT_PUBLIC_APP_NAME=Seapedia

# Optional: Local Development API
# LARAVEL_API_URL=http://localhost:8000
```

| Variable | Required | Default | Deskripsi |
|----------|----------|---------|-----------|
| `LARAVEL_API_URL` | Yes | - | Base URL API backend Laravel |
| `NEXT_PUBLIC_APP_NAME` | No | SEAPEDIA | Nama aplikasi |

## 🔐 Demo Accounts

Gunakan akun berikut untuk testing berbagai role:

| Role | Email | Password | Keterangan |
|------|-------|----------|------------|
| **Admin** | admin+seapedia@email.com |  seapedia123 | Full admin access |
| **Seller** | seller+seapedia@email.com | seapedia123 | Toko dengan berbagai produk |
| **Buyer** | buyer+seapedia@email.com| seapedia123 | Akun pembeli aktif |
| **Driver 2** |driver+seapedia@email.com |  seapedia123 | Driver kedua |

> 📌 **Catatan:** Password default untuk semua akun adalah ` seapedia123`. Jika demo accounts tidak berfungsi, hubungi backend developer untuk reset password.

## 🔄 Role Selection Flow

SEAPEDIA menggunakan sistem **multi-role** yang memungkinkan satu akun memiliki beberapa peran. Berikut alur pemilihan role:

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER LOGIN                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION SUCCESS                           │
│  - JWT Token di-set sebagai HTTP-Only Cookie                    │
│  - User data tersimpan di Zustand store                          │
│  - Default role: sesuai yang dipilih saat register               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DASHBOARD                                    │
│                                                                   │
│  [Navbar Dropdown] ──► "Ganti Role" menu                          │
│      │                                                               │
│      ├──► 👤 Mode Pembeli (Buyer) ──► /buyer/*                    │
│      ├──► 🏪 Mode Penjual (Seller) ──► /seller/*                   │
│      └──► 🚚 Mode Driver (Driver) ──► /driver/*                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cara Ganti Role:

1. **Dari Navbar**: Klik dropdown user → Pilih role yang diinginkan
2. **Role Aktif**: Terlihat di badge pada dropdown user
3. **Navigasi**: Otomatis berubah sesuai role yang dipilih

### Role Permissions:

| Feature | Buyer | Seller | Driver | Admin |
|---------|-------|--------|--------|-------|
| Browse Products | ✅ | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ❌ | ❌ | ❌ |
| Checkout | ✅ | ❌ | ❌ | ❌ |
| Manage Store | ❌ | ✅ | ❌ | ❌ |
| Manage Products | ❌ | ✅ | ❌ | ✅ |
| Accept Orders | ❌ | ✅ | ❌ | ❌ |
| Pickup Delivery | ❌ | ❌ | ✅ | ❌ |
| Manage Categories | ❌ | ❌ | ❌ | ✅ |
| Manage Promos | ❌ | ❌ | ❌ | ✅ |
| Time Simulation | ❌ | ❌ | ❌ | ✅ |

## 🛒 Single-Store Checkout

SEAPEDIA menggunakan sistem **single-store checkout**, yang berarti:

### Konsep:
- Keranjang dapat berisi produk dari **beberapa toko**
- Checkout dilakukan **per toko** (bukan sekaligus)
- Setiap checkout membuat order terpisah per toko

### Alur Checkout:

```
┌─────────────────────────────────────────────────────────────────┐
│                        KERANJANG                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Toko A                                      [Checkout]   │   │
│  │  ├─ Produk 1 (2x)                          Rp 60.000    │   │
│  │  └─ Produk 2 (1x)                          Rp 35.000    │   │
│  │ Total Toko A: Rp 95.000                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Toko B                                      [Checkout]   │   │
│  │  ├─ Produk 3 (1x)                          Rp 50.000    │   │
│  │ Total Toko B: Rp 50.000                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Keunggulan Single-Store Checkout:

1. **Seller lebih mudah manage order** - Setiap order jelas dari satu toko
2. **Driver pick-up lebih efisien** - Satu driver per toko per order
3. **Tracking lebih jelas** - Pembeli bisa lacak setiap order terpisah
4. **Flexible payment** - Mungkin berbeda metode pembayaran per order (future)

### UI/UX Considerations:

- Keranjang menampilkan **group by store**
- Tombol checkout **per section** (per toko)
- Total dihitung **per toko**
- Progress checkout **per order**

## 🌐 Deployment

### Vercel (Recommended)

Deploy langsung ke Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

 atau

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables di Vercel

Set environment variables berikut di Vercel Dashboard:

- `LARAVEL_API_URL` = `https://seapediabackend-production-6b92.up.railway.app`
- `NEXT_PUBLIC_APP_NAME` = `SEAPEDIA`

### Live Demo

🌐 **Production URL**: https://seapedia-front-end.vercel.app/

## 🧪 Testing Guide

Ikuti langkah-langkah berikut untuk testing end-to-end:

### Langkah 1: Guest Browse (Tanpa Login)

```
1. Buka https://seapedia-front-end.vercel.app/
2. Landing page dengan hero section dan produk
3. Klik "Jelajahi Sekarang" → scroll ke produk
4. Filter berdasarkan kategori (klik kategori di CategoryBar)
5. Gunakan search bar untuk cari produk
6. Klik produk → lihat detail produk
```

### Langkah 2: Register & Login

```
1. Klik "Daftar" di navbar
2. Pilih role: "Pembeli", "Penjual", atau "Driver"
3. Isi form registrasi:
   - Username
   - Email
   - Password
   - Konfirmasi Password
4. Klik "Daftar sekarang"
5. Verifikasi email (jika OTP enabled)
6. Login dengan kredensial yang sudah dibuat
```

### Langkah 3: Testing sebagai Pembeli (Buyer)

```
1. Login sebagai buyer
2. Browse produk di homepage
3. Klik "Keranjang" pada produk → masuk ke cart
4. Atur quantity jika diperlukan
5. Pergi ke /buyer/cart
6. Klik "Checkout" pada salah satu toko
7. Pilih alamat pengiriman (tambah jika belum ada)
8. Pilih metode pengiriman (Instant/Next Day/Regular)
9. (Optional) Masukkan kode voucher
10. Klik "Bayar Sekarang"
11. Order berhasil → redirect ke halaman pesanan
12. Lacak pesanan di /buyer/orders
```

### Langkah 4: Testing sebagai Penjual (Seller)

```
1. Ganti role ke "Mode Penjual" via navbar dropdown
2. Buka /seller/dashboard
3. Lihat statistik toko:
   - Total produk
   - Pesanan masuk
   - Revenue
4. Kelola produk di /seller/products:
   - Tambah produk baru
   - Edit produk
   - Hapus produk
5. Kelola pesanan di /seller/orders:
   - Lihat pesanan baru
   - Accept/reject pesanan
   - Update status pesanan
```

### Langkah 5: Testing sebagai Driver

```
1. Ganti role ke "Mode Driver" via navbar dropdown
2. Buka /driver/dashboard
3. Lihat job yang tersedia di /driver/jobs
4. Accept job pickup
5. Lihat delivery aktif di /driver/active
6. Update status:
   - Pickup dari seller
   - Sedang di perjalanan
   - Tiba di tujuan
7. Lihat riwayat di /driver/history
```

### Langkah 6: Testing sebagai Admin

```
1. Login sebagai admin
2. Buka /admin dashboard
3. Kelola kategori di /admin/categories:
   - Tambah kategori baru
   - Edit kategori
   - Hapus kategori
4. Kelola promo di /admin/promos:
   - Buat promo baru
   - Set min purchase & diskon
   - Set periode berlaku
5. Kelola voucher di /admin/vouchers:
   - Generate voucher codes
   - Set quota & expiry
6. Time simulation di /admin/time-simulation:
   - Simulasi waktu untuk testing promo/expiry
```

### Checklist Testing

- [ ] Landing page loads correctly
- [ ] Search functionality works
- [ ] Category filter works
- [ ] User registration successful
- [ ] User login successful
- [ ] Role switching works
- [ ] Add to cart works
- [ ] Cart shows items grouped by store
- [ ] Checkout flow completes
- [ ] Payment deduction from wallet
- [ ] Order appears in buyer orders
- [ ] Seller receives order notification
- [ ] Seller can process order
- [ ] Driver can pick up order
- [ ] Order status updates correctly
- [ ] Promo auto-applied at checkout
- [ ] Voucher can be applied manually
- [ ] All pages are responsive

## 📂 Project Structure

```
seapedia_frontend/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (proxies to backend)
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── verify-otp/
│   │   └── reset-password/
│   ├── buyer/                # Buyer role pages
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── addresses/
│   │   └── wallet/
│   ├── seller/               # Seller role pages
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── store/
│   ├── driver/               # Driver role pages
│   │   ├── dashboard/
│   │   ├── active/
│   │   ├── jobs/
│   │   └── history/
│   ├── admin/                # Admin role pages
│   │   ├── categories/
│   │   ├── promos/
│   │   ├── vouchers/
│   │   └── time-simulation/
│   ├── layout.tsx
│   ├── page.tsx              # Landing page
│   └── globals.css
│
├── components/               # React components
│   ├── ui/                   # Base UI components (shadcn)
│   ├── shared/               # Shared components (Navbar, Footer)
│   ├── landing/              # Landing page components
│   ├── auth/                 # Auth form components
│   └── animations/           # Animation components
│
├── lib/                      # Utility libraries
│   ├── api.ts                # Axios instance
│   ├── auth.ts               # Auth utilities
│   ├── utils.ts              # General utilities
│   └── queryClient.tsx       # React Query provider
│
├── stores/                   # Zustand stores
│   ├── authStore.ts          # Auth state
│   ├── cartStore.ts          # Cart state
│   └── uiStore.ts            # UI state
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   ├── useCategories.ts
│   ├── useProducts.ts
│   ├── useProtectedRoute.ts
│   └── useDebounce.ts
│
├── types/                    # TypeScript types
│   ├── api.ts
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   └── wallet.ts
│
└── public/                   # Static assets
    ├── illustrations/
    └── ...
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin master`)
5. Open Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Kontak

- **Email**: raehanathaiya@gmail.com


---



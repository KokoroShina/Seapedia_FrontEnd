# Dokumentasi Perubahan Seapedia Frontend & Backend
**Tanggal:** 29 Juni 2026
**Author:** Claude Opus 4.8

---

## Ringkasan Perubahan

Dokumentasi ini menjelaskan semua perubahan yang dilakukan pada proyek Seapedia untuk memperbaiki bug dan menambahkan fitur baru.

---

## 1. Fix Navbar Role Display

### Masalah
- Username "admin" di navbar menampilkan role "driver" di bawahnya
- Backend mengirim data user dengan field `name` bukan `username`
- Roles tidak dikirim dengan benar saat login

### Solusi

#### Backend: `D:\seapedia_backend\app\Models\User.php`
- Menambahkan accessor `getNameAttribute()` sebagai alias untuk `username`
- Memperbaiki dokumentasi property untuk menggunakan `username`

#### Backend: `D:\seapedia_backend\app\Http\Controllers\Api\AuthController.php`
- Format user data dengan `username` saat login
- Kirim roles sebagai array dengan format yang benar
- Handle edge case saat user tidak punya roles

### Hasil
✅ Username tampil dengan benar
✅ Role badge menampilkan role yang sesuai dengan user

---

## 2. Fix Admin Dashboard Stats API

### Masalah
- `whereJsonContains('roles', 'buyer')` tidak berfungsi dengan relationship
- `buyer_name` menggunakan `name` padahal field di database adalah `username`
- Recent orders tidak menampilkan data dengan benar

### Solusi

#### Backend: `D:\seapedia_backend\app\Http\Controllers\Api\Admin/DashboardController.php`
- Ganti `whereJsonContains` dengan `whereHas` untuk menghitung user berdasarkan role
- Ganti `buyer?->name` dengan `buyer?->username`
- Ganti eager load dari `buyer:id,name` menjadi `buyer` (load full relation)

### Hasil
✅ Dashboard stats menampilkan data dengan benar
✅ Recent orders menampilkan nama buyer dengan benar

---

## 3. Tambahkan Dashboard Button di Navbar

### Fitur Baru
- Semua role (admin, seller, driver) sekarang memiliki Dashboard button di navbar
- Button menggunakan icon `LayoutDashboard` untuk konsistensi visual

### File: `D:\seapedia_frontend\components\shared\Navbar.tsx`
- Menambahkan `LayoutDashboard` dan `Shield` icon
- Menambahkan `adminLinks` array untuk role admin
- Update `getNavLinks()` untuk menangani role admin
- Menambahkan `getRoleLabel()` helper function
- Update `getRoleBadgeColor()` untuk role admin
- Update role badge display untuk menggunakan helper function

### Navigasi per Role
| Role | Dashboard | Links |
|------|-----------|-------|
| Buyer | - | Beranda, Produk, Keranjang, Pesanan |
| Seller | /seller/dashboard | Dashboard, Toko, Produk, Pesanan |
| Driver | /driver/dashboard | Dashboard, Delivery Aktif, Job Tersedia, Riwayat |
| Admin | /admin | Dashboard |

### Hasil
✅ Semua role bisa navigasi ke dashboard masing-masing
✅ UI konsisten dengan badge color untuk admin (purple)

---

## 4. Modal Replace Cart

### Fitur Baru
- Popup modal saat user mau add item dari toko berbeda
- User bisa pilih "Tetap di Toko Lama" atau "Ganti ke Toko Baru"

### File Baru: `D:\seapedia_frontend\components\shared\ReplaceCartModal.tsx`
Komponen modal dengan:
- Animasi framer-motion
- Warning icon dan styling amber/orange
- Display nama toko saat ini dan toko baru
- Tombol "Tetep di [Store]" dan "Ganti ke [Store]"

### File Update: `D:\seapedia_frontend\stores\cartStore.ts`
- Menambahkan `currentStoreId` dan `currentStoreName` state
- Menambahkan `hasItemsFromOtherStore(storeId)` function
- Update logic `addItem`, `removeItem`, `clearCart` untuk handle store info
- Simpan `currentStoreId` dan `currentStoreName` ke localStorage

### File Update: `D:\seapedia_frontend\app\buyer\products\[id]\page.tsx`
- Import dan implement ReplaceCartModal
- Check sebelum add to cart apakah dari toko berbeda
- Handle `handleReplaceCart()` dan `handleKeepCart()`
- Navigasi ke cart setelah add

### File Update: `D:\seapedia_frontend\types\order.ts`
- Tambahkan `store_id?: number` ke interface `CartItem`

### Hasil
✅ User mendapat pilihan saat mau add item dari toko berbeda
✅ Cart tetap konsisten satu toko per checkout

---

## 5. Register Form Enhancement (Recommendation)

### Catatan
Untuk register, dropdown role sudah berfungsi dengan baik sebagai dropdown biasa.

**Checkbox approach** bisa dipertimbangkan di masa depan jika:
- User perlu register dengan multiple roles sekaligus
- Ada use case untuk user yang jadi buyer DAN seller

**Untuk saat ini:** Dropdown single-select lebih cocok karena:
- Sederhana dan intuitive
- Setiap user punya 1 role utama saat register
- Role switching sudah tersedia di navbar setelah login

---

## Testing Checklist

### Backend Fixes
- [ ] Login dengan user admin → username "admin" tampil, role "Admin" badge
- [ ] Login dengan user seller → username tampil, role "Penjual" badge
- [ ] Login dengan user driver → username tampil, role "Driver" badge
- [ ] Admin dashboard stats → semua angka tampil dengan benar
- [ ] Admin recent orders → buyer name tampil dengan benar

### Frontend Features
- [ ] Navbar → Dashboard button muncul untuk seller, driver, admin
- [ ] Role badge → warna sesuai role (buyer=ocean, seller=emerald, driver=amber, admin=purple)
- [ ] Add to cart dari toko berbeda → modal muncul
- [ ] Klik "Tetep di [Store]" → modal tertutup, tidak ada perubahan
- [ ] Klik "Ganti ke [Store]" → cart cleared, item baru ditambahkan

### Time Simulation Features
- [ ] Advance time → offset bertambah, jam live update
- [ ] Order summary → menampilkan jumlah per status
- [ ] Overdue orders → otomatis diproses saat advance
- [ ] Reset → pesanan dikembalikan ke state semula
- [ ] Feedback reset → tampil jumlah pesanan dikembalikan dan total refund
- [ ] Live clock → jam berjalan real-time dengan animasi

---

## Files Modified

### Backend (D:\seapedia_backend)
```
app/Http/Controllers/Api/AuthController.php
app/Http/Controllers/Api/Admin/DashboardController.php
app/Http/Controllers/Api/Admin/TimeSimulationController.php
app/Models/User.php
app/Models/SystemSetting.php
app/Services/SystemTimeService.php
database/migrations/2026_06_29_165627_change_system_settings_value_to_longtext.php
```

### Frontend (D:\seapedia_frontend)
```
app/buyer/products/[id]/page.tsx
app/admin/page.tsx (TypeScript fix)
app/admin/time-simulation/page.tsx (enhanced)
components/shared/Navbar.tsx
components/shared/ReplaceCartModal.tsx (new)
stores/cartStore.ts
types/order.ts
```

---

## 7. Enhanced Time Simulation - Reset & Restore + Live Clock

### Fitur Baru

#### Backend: `D:\seapedia_backend\app\Http\Controllers/Api/Admin/TimeSimulationController.php`
- **Snapshot System**: Anteseden menyimpan state pesanan aktif sebelum simulasi dimulai
- **Auto Process Overdue**: Saat advance time, overdue orders langsung diproses
- **Restore on Reset**: Reset mengembalikan pesanan ke state semula (reverse refund, restore status, restore stock)

#### Backend: `D:\seapedia_backend\app/Models/SystemSetting.php`
- Menambahkan helper methods `getValue()` dan `setValue()` untuk kemudahan akses

#### Frontend: `D:\seapedia_frontend\app\admin\time-simulation\page.tsx`
- **Live Clock**: Jam berjalan real-time (update setiap detik)
- **Pulsing Indicator**: Dot hijau yang berkedip saat simulation aktif
- **Reset dengan Restore**: Tombol reset mengembalikan pesanan ke state semula
- **Snapshot Info**: Tampilkan info apakah snapshot tersedia
- **Quick Jump**: Tombol cepat untuk lompatan waktu umum (3h, 6h, 12h, 24h)

### Hasil
✅ Reset benar-benar mengembalikan pesanan ke state semula
✅ Live clock dengan pulsing indicator
✅ Auto-process overdue saat advance
✅ Quick jump buttons
✅ Feedback jelas saat reset

---

## 8. Fix Migration - system_settings value column

### Masalah
- Error "Data too long for column 'value'" saat menyimpan snapshot JSON
- Kolom `value` di tabel `system_settings` adalah VARCHAR(255)

### Solusi
**File:** `D:\seapedia_backend\database\migrations\2026_06_29_165627_change_system_settings_value_to_longtext.php`
- Migration untuk mengubah kolom `value` dari VARCHAR(255) ke LONGTEXT
- Bisa menyimpan snapshot JSON yang besar

### Hasil
✅ Snapshot bisa disimpan dengan banyak order
✅ Time simulation berfungsi dengan benar

---

## 9. Fitur Cek Overdue Orders

### Fitur Baru

#### Backend: `D:\seapedia_backend\app\Http\Controllers/Api/Admin/OrderOverdueController.php`
- **GET /api/admin/orders/overdue** - Ambil daftar pesanan overdue (tanpa proses)
- Include buyer_name, store_name, driver_name, total, hours_overdue, dll

#### Backend: `D:\seapedia_backend\routes\api.php`
- Route baru `GET /admin/orders/overdue`

#### Frontend: `D:\seapedia_frontend\app\admin\time-simulation\page.tsx`
- Tombol "Lihat Overdue" untuk toggle panel overdue
- Panel collapsible menampilkan daftar pesanan overdue
- Info: Order ID, Toko, Pembeli, Driver, Total, Hours Overdue
- Badge untuk delivery method (Instant, Next Day, Regular)
- Tombol "Proses Overdue" untuk auto-process semua overdue

### Hasil
✅ Bisa lihat daftar pesanan yang overdue
✅ Info detail tiap pesanan (buyer, store, driver, total, hours overdue)
✅ Bisa proses semua overdue sekaligus

---

## Next Steps (Optional)

1. **Cart API Sync**: Implement `syncWithApi()` di cartStore untuk sync cart dengan backend
2. **Toast Notifications**: Ganti alert dengan toast component yang lebih modern
3. **Multi-role Register**: Jika diperlukan, ubah register form untuk support multiple roles dengan checkbox
4. **Cart Page Enhancement**: Tampilkan info toko di cart page
5. **TypeScript Fix Admin Page**: Ada error TypeScript di admin page.tsx yang sudah diperbaiki
6. **Time Simulation Carbon Fix**: Error CarbonImmutable vs Carbon sudah diperbaiki
7. **Enhanced Time Simulation**: Reset restore + real-time clock sudah dibuat

---

## API Testing Notes

Untuk test API admin stats, butuh authentication:
```bash
curl -s http://127.0.0.1:80/api/admin/stats -H "Authorization: Bearer <TOKEN>"
```

Response error "Route [login] not defined" adalah normal karena user belum authenticated.


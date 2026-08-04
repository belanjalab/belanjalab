# BelanjaLab Technical Audit v1

Tanggal audit: 4 Agustus 2026
Sumber audit: `belanjalab-main (2).zip`

## Ringkasan eksekutif

Fondasi BelanjaLab sudah sehat untuk MVP. Struktur App Router, pemisahan business logic di `lib/`, Supabase Auth, CMS, produk, artikel, pencarian, compare, dan CSV import sudah terbentuk.

Skor sementara: **8.1/10**

Catatan: ZIP yang diaudit belum memuat seluruh perubahan lokal terakhir setelah Tahap 3 CSV Import, jadi bagian CSV perlu diverifikasi ulang pada ZIP berikutnya.

## Temuan prioritas

### P0 — sebelum production

1. **Belum ada SEO foundation lengkap**
   - Tidak ditemukan `app/sitemap.ts`.
   - Tidak ditemukan `app/robots.ts`.
   - Halaman produk belum memiliki `generateMetadata()`.
   - Halaman produk belum memiliki Product JSON-LD.
   - Metadata global masih sangat dasar.

2. **Halaman publik dipaksa selalu dinamis**
   - Homepage, product detail, compare, search, articles, dan article detail memakai `force-dynamic`.
   - Ini menghilangkan manfaat cache/ISR dan menambah query langsung ke Supabase pada setiap kunjungan.

3. **Konfigurasi Supabase ditulis langsung di middleware**
   - URL dan publishable key berada langsung di `middleware.ts`.
   - Publishable key bukan secret, tetapi konfigurasi sebaiknya tetap berasal dari environment variable agar aman untuk staging/production dan rotasi key.

4. **Proteksi middleware hanya mengecek sesi pengguna**
   - Middleware memastikan user login, tetapi belum memastikan user terdaftar sebagai admin.
   - Beberapa halaman melakukan pengecekan `admin_users` sendiri, tetapi pola ini perlu dibuat konsisten agar tidak ada route admin yang terlewat.

### P1 — dampak tinggi

5. **Penggunaan elemen `<img>` sangat luas**
   - Homepage, product detail, search, compare, artikel, dan admin menggunakan `<img>`.
   - Untuk halaman publik sebaiknya beralih ke `next/image` agar optimasi ukuran, lazy loading, dan CLS lebih baik.

6. **Fallback gambar produk masih spesifik Logitech**
   - Product detail masih menggunakan `/images/products/logitech-g102.png` ketika gambar kosong.
   - Harus diganti ke placeholder produk netral.

7. **Belum ada error boundary dan not-found khusus**
   - Tidak ditemukan `app/error.tsx`, `app/global-error.tsx`, atau `app/not-found.tsx`.
   - Error runtime berpotensi tampil sebagai halaman generik dan pengalaman pengguna kurang baik.

8. **Cache dan revalidation belum terstruktur**
   - `revalidatePath` baru terlihat pada sebagian admin action.
   - Query publik belum memakai strategi cache/tag yang konsisten.

### P2 — kualitas dan skalabilitas

9. **Admin page sangat besar**
   - `app/admin/page.tsx` sudah lebih dari seribu baris.
   - Perlu dipecah menjadi komponen dashboard, tabel produk, statistik, filter, dan server actions terpisah.

10. **Validasi status produk perlu constraint database**
    - `products.status` bertipe text.
    - Rekomendasi nilai: `draft`, `published`, `archived`, `hidden` melalui check constraint.

11. **Spesifikasi belum siap penuh untuk score engine**
    - `value_text` fleksibel untuk tampilan, tetapi tidak ideal untuk kalkulasi.
    - Tambahkan secara bertahap `value_numeric`, `unit`, dan tipe data spesifikasi.

12. **Perlu audit index dan unique constraint**
    - Pastikan index pada `products.slug`, `products.category_id`, `products.brand_id`, `product_prices.product_id`, dan `product_prices.marketplace_id`.
    - Pastikan unique constraint yang sesuai untuk slug dan offer marketplace.

## Status modul

| Modul | Status | Catatan |
|---|---|---|
| Foundation | Baik | Struktur Next.js dan Supabase sehat |
| Homepage | Perlu optimasi | Dinamis penuh, banyak `<img>` |
| Product Detail | Perlu perbaikan | Metadata, JSON-LD, cache, placeholder |
| Compare | Perlu optimasi | Dinamis penuh dan client-heavy |
| Search | Cukup baik | Perlu pagination dan strategi cache/query |
| Articles | Cukup baik | Metadata detail sudah ada, cache belum optimal |
| Admin CMS | Baik | Perlu konsistensi guard dan modularisasi |
| CSV Import | Verifikasi ulang | ZIP belum memuat seluruh perubahan Tahap 3 |
| Security | Cukup baik | Auth ada, admin authorization perlu dipusatkan |
| SEO | Belum siap | Sitemap, robots, product metadata, structured data |
| Performance | Perlu perbaikan | `force-dynamic` dan `<img>` pada halaman publik |
| Database | Baik | Perlu constraint dan index verification |

## Roadmap perbaikan

### Sprint 1 — SEO Foundation

1. Tambahkan `app/sitemap.ts`.
2. Tambahkan `app/robots.ts`.
3. Tingkatkan metadata global di `app/layout.tsx`.
4. Tambahkan `generateMetadata()` pada product detail.
5. Tambahkan Product JSON-LD dan Breadcrumb JSON-LD.

### Sprint 2 — Public Performance

1. Hapus `force-dynamic` dari halaman yang bisa memakai ISR.
2. Terapkan `revalidate` dan cache tags.
3. Ubah gambar publik prioritas tinggi ke `next/image`.
4. Tambahkan placeholder netral.

### Sprint 3 — Admin Security Hardening

1. Buat helper tunggal `requireAdmin()`.
2. Gunakan helper pada seluruh server action dan halaman admin.
3. Pindahkan konfigurasi Supabase middleware ke environment variables.
4. Audit RLS seluruh tabel admin.

### Sprint 4 — Database Hardening

1. Tambahkan check constraint status.
2. Verifikasi index dan unique constraint.
3. Verifikasi foreign key dan aturan `ON DELETE`.
4. Siapkan struktur spesifikasi numerik untuk score engine.

## Langkah berikutnya

Mulai dari **SEO Foundation: metadata global, robots, dan sitemap**. Ini memberi dampak langsung tanpa mengubah business logic atau database utama.

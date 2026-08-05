# BelanjaLab Progress Log

Terakhir diperbarui: 4 Agustus 2026

## Ringkasan

Fokus pekerjaan terbaru adalah membuat fitur **CSV Bulk Product Import** lebih aman dan siap dipakai untuk input banyak produk tanpa Shopee scraper.

Status saat ini:

- Tahap 1 — Download template CSV: selesai
- Tahap 2 — Validasi CSV sebelum import: selesai
- Tahap 3 — Atomic import dan audit log: sebagian terpasang

---

## Tahap 1 — Download Template CSV

### File yang dikerjakan

`components/admin/product-csv-import-client.tsx`

### Perubahan

- Menambahkan tombol Download Template CSV
- Template berisi seluruh header yang didukung
- Menambahkan satu baris contoh produk
- Menggunakan UTF-8 BOM agar aman dibuka di Excel
- Tidak mengubah alur import yang sudah ada

### Status

Sudah dipasang oleh pemilik project.

### Commit message

`feat(admin): add CSV product import template download`

---

## Tahap 2 — Validasi CSV Sebelum Import

### File yang dikerjakan

`components/admin/product-csv-import-client.tsx`

`lib/admin-product-import.ts`

### Perubahan

- Validasi otomatis setelah file CSV dipilih
- Tombol import dinonaktifkan saat masih ada error kritis
- Menampilkan jumlah baris valid dan jumlah error
- Normalisasi format harga seperti `249000`, `249.000`, dan `Rp249.000`
- Validasi kategori terhadap database
- Validasi brand terhadap database
- Validasi marketplace terhadap database
- Validasi slug duplikat di database dan di dalam CSV
- Validasi affiliate URL duplikat di database dan di dalam CSV
- Marketplace wajib diisi ketika harga atau affiliate URL tersedia
- Harga harus lebih dari nol ketika marketplace diisi
- Batas maksimal 200 baris per import

### Status

Sudah dipasang oleh pemilik project.

### Commit message

`feat(admin): validate CSV products before import`

---

## Tahap 3 — Atomic CSV Import dan Audit Log

### File yang dikerjakan

`lib/admin-product-import.ts`

`components/admin/product-csv-import-client.tsx`

`supabase/migrations/202608040001_atomic_product_csv_import.sql`

`public/images/products/product-placeholder.svg`

### Perubahan

- Import setiap produk melalui Supabase PostgreSQL RPC
- Product, score, dan marketplace price diproses dalam satu transaksi database
- Rollback otomatis jika salah satu proses gagal
- Import tetap lanjut ketika satu baris gagal
- Menampilkan ringkasan berhasil dan gagal
- Mencatat nama file CSV pada histori import
- Menambahkan tabel histori `product_csv_import_runs`
- Menambahkan proteksi slug dan affiliate URL duplikat di sisi database
- Menghapus fallback gambar Logitech untuk produk tanpa gambar
- Menggunakan placeholder produk yang netral

### Status pemasangan

Sudah dipasang:

- `lib/admin-product-import.ts`
- `components/admin/product-csv-import-client.tsx`

Sudah tersedia di repository:

- `supabase/migrations/202608040001_atomic_product_csv_import.sql`
- `public/images/products/product-placeholder.svg`

Eksekusi migration di Supabase tetap harus diverifikasi setelah paket final dipasang.

### Langkah yang masih harus dilakukan

1. Jalankan migration SQL di Supabase SQL Editor.
2. Tambahkan placeholder ke `public/images/products/product-placeholder.svg`.
3. Jalankan `npm run build`.
4. Tes import 2–3 produk draft.
5. Pastikan product, score, dan price masuk bersama.
6. Buat satu baris gagal untuk memastikan rollback bekerja.
7. Cek tabel `product_csv_import_runs` untuk memastikan histori import tersimpan.

### Commit message

`feat(admin): add atomic CSV import and audit logging`

---

## File yang Sudah Disentuh dalam Sesi Ini

| File | Tahap | Status |
|---|---:|---|
| `components/admin/product-csv-import-client.tsx` | 1, 2, 3 | Sudah dipasang |
| `lib/admin-product-import.ts` | 2, 3 | Sudah dipasang |
| `supabase/migrations/202608040001_atomic_product_csv_import.sql` | 3 | Tersedia; eksekusi perlu verifikasi |
| `public/images/products/product-placeholder.svg` | 3 | Sudah tersedia |

---

## Keputusan Teknis

- Shopee scraping otomatis ditunda karena kompleks, rapuh, dan berisiko sering rusak.
- Jalur input produk yang diprioritaskan adalah CSV Bulk Import dan Quick Product Entry.
- Atomic import dilakukan di PostgreSQL, bukan hanya cleanup manual di aplikasi.
- Satu produk dianggap satu unit transaksi: product, score, dan marketplace price harus berhasil atau gagal bersama.

---

## Prioritas Setelah Tahap 3 Selesai

1. Verifikasi build dan tes CSV import end-to-end.
2. Tambahkan halaman histori CSV import di admin.
3. Bangun Quick Product Entry.
4. Audit Product Detail dinamis.
5. Audit Compare dan Search.
6. Persiapan production dan launching.

---

## Catatan Penggunaan

Simpan file ini di root repository dengan nama:

`BELANJALAB_PROGRESS.md`

Perbarui bagian status setiap kali file sudah dipasang, migration sudah dijalankan, atau satu tahap selesai.

---

## Finalization RC — 4 Agustus 2026

- Dependency security baseline diperbarui.
- CSV Import admin authorization dan validasi diperketat.
- Manual create/edit product diberi rollback dan cleanup gambar.
- Price history dan rollback harga diperkuat.
- Hero, Footer, article image, dan product image URL disanitasi.
- Footer tidak lagi membuat tautan palsu untuk halaman yang belum ada.
- Dokumentasi deployment dan release checklist diperbarui.

Status: **MVP Release Candidate `1.0.0-rc.1`**.


---

## Finalization RC2 — 4 Agustus 2026

- Versi release candidate dinaikkan menjadi `1.0.0-rc.2`.
- Bulk update harga marketplace dipindahkan ke RPC atomic.
- Price history dibuat untuk bulk update dan harga baru.
- URL affiliate publik dan admin preview disanitasi ulang saat dibaca.
- Placeholder affiliate legacy `#` dibersihkan lewat migration.
- Batas Server Action diatur 6 MB agar upload maksimum 5 MB dapat diproses.
- Dependency, dokumentasi, dan release checklist diselaraskan.

Status: **source finalisasi lengkap; menunggu Cloudflare build dan smoke test untuk keputusan production**.

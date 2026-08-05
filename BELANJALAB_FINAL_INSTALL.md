# BelanjaLab Final Installation

## 1. Pasang source

Pilih salah satu:

- Ganti repository dengan ZIP project lengkap; atau
- Overlay isi ZIP patch finalisasi pada repository terbaru.

## 2. Jalankan migration Supabase

Jalankan seluruh isi file berikut lewat Supabase SQL Editor:

```text
supabase/migrations/202608040001_atomic_product_csv_import.sql
```

File aman dijalankan ulang dan kini mencakup:

- Atomic CSV import
- CSV import audit log
- Initial product price history
- Atomic bulk marketplace price update
- Pembersihan affiliate URL legacy `#`

## 3. Pastikan Cloudflare variables

Tambahkan pada Build Variables dan Runtime Variables:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## 4. Deploy

Commit seluruh perubahan dan tunggu Cloudflare build.

## 5. Verifikasi

Ikuti `BELANJALAB_RELEASE_CHECKLIST.md`. Production final baru ditetapkan setelah build dan smoke test lolos.

# BelanjaLab MVP Release Candidate 2

Tanggal finalisasi: 4 Agustus 2026

Versi aplikasi: `1.0.0-rc.2`

## Status

Fondasi MVP telah difinalisasi sebagai Release Candidate. Status production final ditetapkan setelah Cloudflare build berhasil dan semua smoke test pada release checklist lolos.

## Finalisasi yang diterapkan

### Dependency dan runtime

- Next.js diperbarui ke `15.5.21`.
- React dan React DOM diperbarui ke `19.2.6`.
- Minimum Node.js ditetapkan ke `20.11.0`.
- Script `npm run check` ditambahkan.
- `.env.example` dilengkapi.

### Admin dan data integrity

- Create Product memiliki validasi URL, harga, dan marketplace.
- Gambar upload dibersihkan jika penyimpanan produk gagal.
- Product, score, price, dan initial price history dibatalkan jika salah satu tahap gagal.
- Edit Product mengembalikan data produk sebelumnya jika penyimpanan score gagal.
- Product Price menyimpan `null`, bukan `#`, untuk affiliate URL kosong.
- Perubahan harga mencatat history dan melakukan rollback jika history gagal.
- Aksi harga dibatasi berdasarkan `product_id` dan `price_id`.
- Bulk update harga marketplace sekarang berjalan dalam satu RPC atomic dan ikut mencatat price history.

### CSV import

- Validasi dan import hanya dapat dipanggil admin.
- Validasi skor, status, URL, harga, slug, kategori, brand, marketplace, dan duplikasi diperketat.
- RPC import tetap atomic per produk.
- Initial price history ikut dibuat saat CSV import.
- Import run tetap tercatat pada `product_csv_import_runs`.

### Security dan public content

- URL dari Hero dan Footer disanitasi sebelum dirender.
- Link Footer yang belum tersedia tidak lagi diarahkan ke halaman palsu/404.
- URL gambar publik disanitasi dan memakai placeholder aman jika invalid.
- Affiliate URL publik dan preview admin disanitasi saat dibaca.
- Placeholder affiliate lama `#` dibersihkan menjadi `null` melalui migration.
- Secret Supabase tidak disimpan di source code.
- Route admin tetap memerlukan session dan record `admin_users`.

### SEO dan stability

- Metadata global, product, dan article tersedia.
- Sitemap hanya memuat halaman publik yang dapat diindeks.
- Robots memblokir admin dan auth.
- JSON-LD Product dan Article memakai data aktual.
- Error, global error, loading, dan not-found page tersedia.

## Fitur yang sengaja belum masuk release ini

- Marketplace price sync otomatis
- Product Score Engine otomatis
- Affiliate click analytics
- Multi-role admin/editor
- Browser extension import marketplace

Fitur tersebut adalah roadmap setelah MVP stabil dan bukan blocker untuk Release Candidate.

## Upload image

Server Action menerima body sampai 6 MB. Validasi aplikasi tetap menolak file gambar di atas 5 MB.

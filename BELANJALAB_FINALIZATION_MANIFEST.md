# BelanjaLab Finalization Manifest

Tanggal paket: 4 Agustus 2026  
Versi: `1.0.0-rc.2`

Paket ini dibuat dari ZIP project terbaru yang diterima pada 4 Agustus 2026 dan disiapkan sebagai Release Candidate final sebelum smoke test production.

## File baru

- `.env.example`
- `BELANJALAB_FINALIZATION_MANIFEST.md`
- `BELANJALAB_FINAL_INSTALL.md`

## File yang diperbarui

### Konfigurasi dan dokumentasi

- `package.json`
- `next.config.mjs`
- `README.md`
- `BELANJALAB_PROGRESS.md`
- `BELANJALAB_RELEASE_FINAL.md`
- `BELANJALAB_RELEASE_CHECKLIST.md`
- `SECURITY_CHANGES.md`

### Admin CMS

- `app/admin/page.tsx`
- `app/admin/hero/page.tsx`
- `app/admin/footer/page.tsx`
- `app/admin/prices/page.tsx`
- `app/admin/articles/page.tsx`
- `app/admin/articles/[id]/edit/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/edit/page.tsx`
- `app/admin/products/[id]/preview/page.tsx`
- `app/admin/products/[id]/prices/page.tsx`
- `app/admin/products/[id]/specifications/page.tsx`
- `components/admin/bulk-product-actions.tsx`
- `components/admin/confirm-delete-button.tsx`

### Public pages dan data layer

- `app/page.tsx`
- `app/articles/page.tsx`
- `app/articles/[slug]/page.tsx`
- `app/compare/compare-client.tsx`
- `app/product/[slug]/marketplace-offers.tsx`
- `lib/site-config.ts`
- `lib/hero.ts`
- `lib/footer.ts`
- `lib/products.ts`
- `lib/search-products.ts`
- `lib/articles.ts`
- `lib/marketplace-prices.ts`
- `lib/admin-product-import.ts`
- `lib/admin-product-prices.ts`

### Database

- `supabase/migrations/202608040001_atomic_product_csv_import.sql`

## Perbaikan inti

- Dependency dan runtime baseline diperbarui.
- Server Action menerima payload sampai 6 MB; validasi aplikasi tetap membatasi gambar 5 MB.
- URL gambar, Hero, Footer, dan affiliate disanitasi.
- Admin create/edit product memiliki validasi, cleanup gambar, dan compensating rollback.
- Harga manual dan bulk update mencatat price history serta melakukan rollback saat pencatatan gagal.
- Bulk marketplace price memakai RPC atomic.
- CSV import memverifikasi admin, memvalidasi seluruh data, dan tetap atomic per produk.
- Migration membersihkan affiliate URL legacy `#` dan menambahkan audit log import.

## Verifikasi lokal

- 66 file TypeScript/TSX berhasil diparse: **0 syntax error**.
- Pemeriksaan semantic TypeScript berbasis stub dependency lokal: **0 error**.
- 69 source file diperiksa: **seluruh import lokal resolve**.
- 27 route dan 66 referensi route statis diperiksa: **tidak ditemukan referensi route internal yang hilang**.
- `next.config.mjs` lolos pemeriksaan syntax Node.js.
- `package.json` valid.
- Tidak ditemukan Supabase project URL, JWT, `service_role`, atau secret key hardcode.

## Verifikasi production yang wajib

Dependency project tidak tersedia di environment audit, sehingga `next build` penuh belum dapat dijalankan secara lokal. Cloudflare build dan smoke test pada `BELANJALAB_RELEASE_CHECKLIST.md` menjadi verifikasi akhir sebelum status production.

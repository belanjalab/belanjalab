# Affiliate Import — Stage 2

## File yang ditambahkan

- `app/api/admin/affiliate/scan/route.ts`
- `lib/affiliate-import/fetcher.ts`
- `lib/affiliate-import/metadata.ts`

## File yang diganti

- `app/admin/import/affiliate/page.tsx`
- `components/admin/affiliate-link-import-client.tsx`
- `lib/affiliate-import/types.ts`

## Fitur

- Mengikuti redirect short link Shopee secara aman.
- Mengambil nama, gambar, harga, rentang harga, dan deskripsi.
- Membaca Open Graph, JSON-LD, serta fallback HTML.
- Scan bertahap agar aman untuk Cloudflare Workers.
- Admin authentication pada API scan.
- Proteksi redirect keluar domain Shopee.
- Preview editable dan tombol coba ulang per produk.
- Tidak membutuhkan dependency, migration, atau environment variable baru.

## Tes

1. Deploy ke Cloudflare.
2. Buka `/admin/import/affiliate`.
3. Paste 1–3 link affiliate Shopee terlebih dahulu.
4. Klik `Validasi & Preview`.
5. Klik `Ambil Data Produk`.
6. Periksa nama, gambar, dan harga sebelum lanjut ke tahap penyimpanan database.

Shopee dapat membatasi request otomatis. Jika metadata tidak tersedia, hasil ditandai sebagian/gagal dan kolom tetap dapat dilengkapi manual.

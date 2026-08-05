# BelanjaLab — Audit UI/UX Semua Halaman

Tanggal audit: 6 Agustus 2026
Paket sumber: `belanjalab-main (22).zip`

## Ringkasan

Audit mencakup seluruh halaman publik, state sistem, dan seluruh halaman admin/CMS. Fokus perbaikan adalah konsistensi sistem visual, keterbacaan mobile, target sentuh, navigasi, hierarki konten, dan positioning BelanjaLab sebagai Shopping Decision Platform.

## Masalah utama yang ditemukan

1. Halaman Homepage sudah memakai desain Stage 3, tetapi Search, Compare, Product Detail, dan Articles masih memakai header, bottom navigation, tipografi, warna, dan kartu versi lama.
2. Banyak teks pada halaman lama dan admin berukuran 8–11 px sehingga sulit dibaca pada mobile.
3. Navigasi mobile memakai simbol Unicode yang berbeda-beda pada setiap halaman.
4. Compare menampilkan tiga kartu dalam kolom sempit pada mobile dan tabel spesifikasi sulit dipindai.
5. Search masih terasa seperti katalog marketplace dan belum konsisten dengan kartu keputusan di homepage.
6. Product Detail belum menampilkan sumber harga, waktu pemeriksaan, dan aksi compare secara jelas.
7. Artikel memakai shell halaman yang berbeda dan belum memiliki footer/navigasi mobile yang konsisten.
8. Error, loading, dan 404 memakai gaya visual yang berbeda dari halaman utama.
9. “Jelajahi Kategori” berada terlalu bawah, padahal merupakan jalur eksplorasi utama pengguna baru.
10. Admin/CMS menggunakan ukuran label dan aksen oranye yang tidak seragam.

## Perbaikan yang diterapkan

### Sistem visual publik

Dibuat komponen bersama:

- `components/site/site-header.tsx`
- `components/site/site-footer.tsx`
- `components/site/mobile-bottom-nav.tsx`
- `components/site/page-intro.tsx`
- `components/site/breadcrumbs.tsx`

Semua halaman publik sekarang menggunakan pola yang sama untuk:

- Logo dan navigasi utama
- Drawer menu tablet/mobile
- CTA pencarian
- Footer
- Bottom navigation mobile
- Breadcrumb
- Page intro/hero internal
- Focus state dan target sentuh

### Homepage

- “Jelajahi Kategori” dipindahkan tepat di bawah header dan sebelum hero.
- Kategori memakai ikon di atas label.
- Mobile memakai horizontal category rail agar kategori langsung terlihat tanpa membuat halaman terlalu panjang.
- Section kategori lama di bagian bawah dihapus agar tidak duplikat.

### Search

- Header dan navigasi disamakan dengan homepage.
- Search form diperbesar dan diberi focus ring yang jelas.
- Product card diperbarui dengan hierarchy yang lebih konsisten.
- Harga dan score dipisahkan dengan jelas.
- Empty state dan suggested searches diperbaiki.
- Pagination memiliki target sentuh minimal 44 px.

### Compare

- Kartu produk menjadi horizontal-scroll pada mobile dan grid pada desktop.
- Tombol hapus produk memiliki target sentuh 44 px.
- Product picker diperbaiki dengan search input yang jelas.
- Tabel perbandingan dibuat scrollable secara horizontal dengan header dan row label tetap mudah dipindai.
- Ditambahkan peringatan jika pengguna membandingkan kategori berbeda.
- Kesimpulan diubah menjadi “skor tertinggi di pilihan ini”, bukan klaim pemenang mutlak.

### Product Detail

- Header, breadcrumb, footer, dan navigasi mobile disamakan.
- Harga, jumlah sumber harga, waktu pemeriksaan, dan BelanjaLab Score ditampilkan sebagai decision summary.
- Tombol compare sekarang meneruskan produk melalui query URL.
- Rincian skor dan ringkasan produk memakai kartu dan spacing yang konsisten.
- Marketplace offers diperbarui dengan hierarchy harga, status stok, diskon, total, riwayat harga, dan waktu pemeriksaan yang lebih jelas.

### Articles

- Article list dan article detail memakai shell halaman yang sama.
- Kartu artikel, metadata, reading time, empty state, dan CTA diperbarui.
- Article detail memiliki breadcrumb, hero artikel, gambar, konten yang lebih mudah dibaca, footer, dan bottom navigation.

### System states

- `loading.tsx`, `error.tsx`, `global-error.tsx`, dan `not-found.tsx` diselaraskan dengan visual BelanjaLab.
- Tombol dan teks pada state sistem memenuhi ukuran minimum yang lebih aman.

### Admin/CMS

Admin tetap memakai bahasa visual dashboard yang terpisah dari website publik, tetapi fondasinya dinormalisasi:

- Seluruh teks 8–11 px dinaikkan menjadi minimal 12 px.
- Aksen teks dan tombol utama memakai orange-700/orange-800 agar lebih kontras.
- Form control di dalam admin memiliki minimum height 44 px melalui admin scope.
- Semua halaman admin dibungkus dalam `admin-scope` untuk background, typography, dan interaksi yang konsisten.

## Hasil pemeriksaan statis

- Teks di bawah 12 px: **0 occurrence**
- Section `#kategori` pada homepage: **1 occurrence**
- Halaman publik utama yang memakai shared header: **6/6**
- Halaman publik utama yang memakai shared mobile navigation: **6/6**
- Parsing sintaks TypeScript/TSX: **lolos**
- Resolusi seluruh import lokal: **lolos**
- Tombol publik tanpa atribut `type`: **0**
- Legacy header atau bottom navigation pada halaman publik: **0**

## Halaman yang diaudit

### Publik

- `/`
- `/search`
- `/compare`
- `/product/[slug]`
- `/articles`
- `/articles/[slug]`
- Loading, error, global error, dan 404

### Admin/CMS

- Dashboard
- Login dan recovery flow
- Product list, create, edit, delete, preview, prices, specifications, dan CSV import
- Articles list/edit/delete
- Hero
- Footer
- Taxonomies
- Marketplaces
- Prices
- Affiliate/Shopee import

## Catatan validasi

Paket tidak menyertakan `node_modules`, dan registry npm tidak dapat diakses dari lingkungan audit. Karena itu build Next.js penuh dan browser render terhadap data Supabase nyata belum dapat dijalankan di sini. Pemeriksaan yang sudah dilakukan adalah parsing semua file TypeScript/TSX, pemeriksaan import lokal, audit class responsive/accessibility, dan pemeriksaan struktur route.

Setelah memasang paket, jalankan:

```bash
npm run typecheck
npm run build
```

Tidak ada migration database atau perubahan schema pada paket ini.

# BelanjaLab Public UI/UX Pass

## Tujuan

Merapikan pengalaman halaman publik pada desktop dan mobile tanpa mengubah schema database, data produk, atau konfigurasi Cloudflare.

## Perubahan utama

- Halaman kategori dan rekomendasi memakai header, footer, breadcrumb, dan navigasi mobile yang sama dengan halaman publik lain.
- Ikon kategori tidak lagi memakai emoji. Slug kategori dipetakan ke ilustrasi SVG animasi yang sudah menjadi bagian design system BelanjaLab.
- Informasi visual "Produk ditemukan" dan jumlah produk pada header kategori dihapus.
- Filter kategori diubah menjadi toolbar ringkas seperti halaman marketplace:
  - Rekomendasi
  - Skor
  - Terbaru
  - Harga terendah/tertinggi
  - Tombol Filter untuk merek dan rentang harga
- Filter menjadi sticky di bawah header, horizontal-scroll pada mobile, serta membuka bottom sheet/modal yang responsif.
- Kartu produk kategori dan rekomendasi dibuat lebih ringkas, konsisten, dan responsif.
- Mobile bottom navigation sekarang memiliki menu Kategori.
- Link Kategori dan Rekomendasi pada footer diarahkan ke landing page masing-masing.

## File yang berubah

- `app/globals.css`
- `app/kategori/page.tsx`
- `app/kategori/[slug]/page.tsx`
- `app/kategori/[slug]/[subslug]/page.tsx`
- `app/rekomendasi/page.tsx`
- `app/rekomendasi/[slug]/page.tsx`
- `components/category/category-filter-bar.tsx`
- `components/category/category-landing-view.tsx`
- `components/category/category-product-grid.tsx`
- `components/recommendation/recommendation-landing-view.tsx`
- `components/recommendation/recommendation-product-grid.tsx`
- `components/site/mobile-bottom-nav.tsx`
- `components/site/site-footer.tsx`
- `components/site/site-header.tsx`
- `lib/categories.ts`

## Instalasi

1. Overlay isi ZIP ke root repository.
2. Commit dan deploy melalui Cloudflare.
3. Tidak perlu migration SQL atau environment variable baru.

## Pengujian

Cek halaman berikut pada desktop dan mobile:

- `/`
- `/kategori`
- `/kategori/gadget`
- `/kategori/gadget/smartphone`
- `/rekomendasi`
- `/rekomendasi/hp-terbaik`

Pada halaman kategori, uji:

- sort Rekomendasi, Skor, Terbaru, dan Harga;
- filter merek;
- harga minimum/maksimum;
- Reset;
- pagination setelah filter aktif.

## Commit

```text
feat(ui): refine public category and recommendation experience
```

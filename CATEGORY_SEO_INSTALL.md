# BelanjaLab Category SEO Landing Pages

## File baru
- `app/kategori/page.tsx`
- `app/kategori/[slug]/page.tsx`
- `components/category/category-product-grid.tsx`

## File pengganti
- `lib/categories.ts`
- `app/sitemap.ts`
- `app/page.tsx`

## Migration kategori inti
Jalankan `supabase/migrations/202608070001_seed_core_seo_categories.sql` di Supabase SQL Editor. Migration ini aman dijalankan ulang dan hanya menambah kategori inti yang belum ada.

Fitur menggunakan kolom `categories.id`, `categories.name`, `categories.slug`, dan `categories.created_at` yang sudah ada.

## Setelah deploy
1. Pastikan kategori utama tersedia dan punya slug yang benar, misalnya:
   - `Gadget` -> `gadget`
   - `Elektronik` -> `elektronik`
   - `Rumah Tangga` -> `rumah-tangga`
   - `Gaming` -> `gaming`
2. Buka `/kategori`.
3. Buka `/kategori/gadget`.
4. Buka `/sitemap.xml` dan pastikan URL kategori tampil.
5. Submit ulang sitemap di Google Search Console bila perlu.

## Catatan SEO
- Halaman kategori pertama (`page=1`) dapat diindeks.
- Pagination `?page=2` dan seterusnya `noindex, follow` untuk mengurangi duplikasi.
- Kategori baru di Supabase otomatis ikut hub kategori dan sitemap.

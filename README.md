# BelanjaLab

BelanjaLab adalah Shopping Decision Platform untuk membantu pengguna menemukan, membandingkan, dan mengevaluasi produk sebelum membeli.

## Status

**MVP Release Candidate — `1.0.0-rc.2`**

Fitur utama yang tersedia:

- Homepage dinamis
- Product Detail dan penawaran marketplace
- Search dan Compare
- Artikel dan CMS artikel
- CMS produk, kategori, brand, marketplace, hero, dan footer
- Upload gambar produk dan artikel
- CSV Bulk Import atomic dengan audit log
- Metadata SEO, sitemap, robots, Open Graph, dan JSON-LD
- Proteksi route admin dan security headers

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Auth, Storage, dan RLS
- Cloudflare Workers & Pages

## Environment Variables

Tambahkan sebagai **Build Variables** dan **Runtime Variables** di Cloudflare:

```text
NEXT_PUBLIC_SITE_URL=https://belanjalab.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Gunakan publishable/anon key. Jangan menyimpan `service_role` atau secret key di repository.

## Database Migration

Pastikan migration berikut sudah dijalankan melalui Supabase SQL Editor:

```text
supabase/migrations/202608040001_atomic_product_csv_import.sql
```

Migration tersebut membuat import CSV atomic, audit log import, riwayat harga awal, pembersihan link affiliate legacy, dan bulk update harga marketplace atomic.

## Scripts

```bash
npm run dev
npm run typecheck
npm run build
npm run check
```

## Deployment

Repository terhubung ke Cloudflare. Setiap commit akan memicu build dan deployment. Setelah deploy, jalankan checklist di `BELANJALAB_RELEASE_CHECKLIST.md`.

## Dokumentasi

- `BELANJALAB_PROGRESS.md`
- `BELANJALAB_TECHNICAL_AUDIT_v1.md`
- `BELANJALAB_RELEASE_FINAL.md`
- `BELANJALAB_RELEASE_CHECKLIST.md`
- `BELANJALAB_FINALIZATION_MANIFEST.md`

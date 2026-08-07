# BelanjaLab - Category SEO Stage 3

## Tujuan
Menambahkan landing page keyword/rekomendasi yang mengambil produk langsung dari database BelanjaLab.

## URL baru
- /rekomendasi
- /rekomendasi/hp-terbaik
- /rekomendasi/hp-3-jutaan
- /rekomendasi/hp-5-jutaan
- /rekomendasi/gadget-terbaik
- /rekomendasi/gaming-terbaik
- /rekomendasi/elektronik-terbaik
- /rekomendasi/rumah-tangga-terbaik

## File baru
- app/rekomendasi/page.tsx
- app/rekomendasi/[slug]/page.tsx
- components/recommendation/recommendation-landing-view.tsx
- components/recommendation/recommendation-product-grid.tsx
- lib/recommendations.ts

## File diganti
- app/sitemap.ts
- components/category/category-landing-view.tsx

## Perilaku SEO
- Metadata unik untuk setiap keyword landing page.
- Canonical hanya ke halaman utama keyword.
- Pagination halaman 2+ dibuat noindex, follow.
- CollectionPage, BreadcrumbList, dan ItemList JSON-LD.
- Semua landing recommendation masuk sitemap.
- Category page menautkan recommendation terkait untuk internal linking.
- Produk diambil otomatis dari data published.
- HP 3 jutaan: harga terendah Rp3.000.000-Rp3.999.999.
- HP 5 jutaan: harga terendah Rp5.000.000-Rp5.999.999.
- Ranking menggunakan overall score tertinggi.

## Migration
Tidak ada migration database.

## Setelah deploy
Cek:
- https://belanjalab.com/rekomendasi
- https://belanjalab.com/rekomendasi/hp-terbaik
- https://belanjalab.com/rekomendasi/hp-3-jutaan
- https://belanjalab.com/rekomendasi/gadget-terbaik
- https://belanjalab.com/sitemap.xml

## Commit
feat(seo): add recommendation keyword landing pages

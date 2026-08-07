# Homepage Exact Restore

Sumber desain: `belanjalab-main (35).zip`.

Yang dipertahankan persis:
- urutan kategori -> Produk Terlaris -> hero -> trust -> compare -> methodology -> articles
- visual kategori dan spacing
- product cards
- hero product card
- typography, radius, shadow, warna, dan responsive layout
- shared SiteHeader / SiteFooter / MobileBottomNav

Perubahan non-visual untuk SEO:
- link kategori menuju `/kategori/[slug]`
- tombol `Cari lainnya` pada kategori menuju `/kategori`

Tidak mengubah sitemap, recommendation pages, database, atau migration.

Commit:
`fix(ui): restore exact final homepage design`

---

## Update — Audit UI/UX (fix non-fungsional)

Perubahan berikut diterapkan di atas restore ini, semuanya class/atribut saja — tidak mengubah data, urutan section, atau logika:

1. Tambah `<h1 className="sr-only">` judul halaman di awal `<main>`; heading Hero diturunkan dari `h1` → `h2`, dan judul produk di hero card dari `h2` → `h3`. Urutan heading jadi H1 → H2 → H2 → H2(Hero) → H3, tanpa mengubah tampilan visual.
2. Badge "BelanjaLab Score" di hero card sekarang netral (slate) saat skor produk belum tersedia ("Belum dinilai"), dan tetap hijau (emerald) saat skor asli ada.
3. Tombol "Lihat analisis" di hero card diubah dari solid dark jadi outline, supaya tidak bersaing dengan CTA utama hero ("Cari produk").
4. Tambah `focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2` pada seluruh link/tombol interaktif di halaman ini (kategori, produk, hero, trust items, artikel, dst).
5. Section "Keunggulan BelanjaLab" sekarang punya eyebrow label visual ("Kenapa BelanjaLab") mengikuti pola section lain, dengan `h2` sr-only untuk screen reader.
6. Grid "Produk Terlaris" tambah `sm:grid-cols-3` supaya transisi kolom lebih halus di lebar tablet.
7. Judul artikel tambah `line-clamp-2` supaya tinggi antar kartu lebih konsisten.

Belum diubah (butuh komponen/keputusan lain di luar `page.tsx`):
- Anchor tiap trust item ke sub-bagian spesifik di `#metodologi` — perlu id di dalam komponen `ScoreMethodology`.
- Fade/scroll-cue di rel kategori mobile dan diferensiasi visual antara "Cara menggunakan" vs "Pencarian populer" di hero — polish opsional, belum diterapkan.

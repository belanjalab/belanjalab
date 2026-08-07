# BelanjaLab Homepage Restore

Penyebab regresi:
- Paket SEO Category Landing Pages Stage 1 membawa `app/page.tsx` versi lama.
- File tersebut kemudian menimpa homepage hasil final UI/UX pass.
- Pada ZIP terbaru, `app/page.tsx` identik dengan versi di paket SEO Stage 1.
- Komponen desain final (`SiteHeader`, `SiteFooter`, `MobileBottomNav`,
  `CategoryVisual`, `DecisionProductCard`, `QuickComparison`, dan
  `ScoreMethodology`) masih ada dan tidak rusak.

Patch:
- Mengembalikan homepage ke shared design system final.
- Mempertahankan link kategori SEO ke `/kategori/[slug]`.
- Mempertahankan link `/rekomendasi`.
- Kategori kembali berada tepat di bawah header dan sebelum hero.
- Menggunakan category visual final, decision product card, quick compare,
  methodology, footer, dan mobile bottom navigation.
- Tidak mengubah database, sitemap, category Stage 2, atau recommendation Stage 3.

Commit:
fix(ui): restore final homepage after SEO overlay regression

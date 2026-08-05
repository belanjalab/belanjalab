# BelanjaLab — Final Design & UX Audit

Tanggal audit: 6 Agustus 2026  
Cakupan: seluruh halaman publik, state sistem, navigasi mobile, serta konsistensi dasar dashboard admin.

## Executive verdict

BelanjaLab sudah memiliki fondasi visual dan pengalaman pengguna yang layak untuk **beta publik atau soft launch**. Produk kini lebih jelas diposisikan sebagai **Shopping Decision Platform**, bukan sekadar katalog atau daftar harga.

Secara keseluruhan, desain final memperoleh skor internal **8,6/10**. Kekuatan utamanya adalah hierarchy homepage, konsistensi shell publik, alur pencarian–analisis–perbandingan, navigasi mobile, dan transparansi data. Sisa pekerjaan utama bukan redesign, melainkan QA produksi dengan data nyata, performa deployment, dan penyempurnaan berbasis perilaku pengguna.

## Scorecard final

| Area | Skor | Catatan |
|---|---:|---|
| Identitas merek dan visual system | 8,7/10 | Warna, tipografi, radius, iconography, dan surface sudah terasa satu produk. |
| Homepage dan hierarchy | 8,8/10 | Kategori tampil lebih awal; hero dan value proposition tetap cepat terbaca. |
| Navigasi mobile | 9,0/10 | Drawer, bottom navigation, focus handling, dan target sentuh sudah matang. |
| Search dan discovery | 8,5/10 | Result card lebih mudah dipindai dan seluruh kartu dapat diklik. |
| Compare | 8,7/10 | Tabel lebih nyaman di mobile; ringkasan tidak lagi menyesatkan saat hanya satu produk. |
| Product detail | 8,7/10 | Score, harga, sumber, freshness, marketplace, dan compare memiliki hierarchy jelas. |
| Artikel/editorial | 8,4/10 | Kartu artikel, metadata, cover ratio, dan reading experience sudah konsisten. |
| Accessibility | 8,6/10 | Focus state, drawer keyboard, target sentuh, reduced motion, dan skip link sudah tersedia. |
| Dashboard admin | 8,0/10 | Tetap fungsional sebagai tool internal; kontrol penting dan focus state telah dinormalisasi. |
| **Keseluruhan** | **8,6/10** | Siap menuju QA produksi dan soft launch. |

## Keputusan desain final

### 1. Kategori diletakkan sebelum hero

“Jelajahi Kategori” kini berada tepat setelah header. Ikon berada di atas label, sehingga pengguna dapat memahami cakupan produk BelanjaLab dalam beberapa detik. Pada mobile, kategori memakai rail horizontal agar tidak membuat halaman awal terlalu panjang.

### 2. Visual system dibuat lebih tenang

Gradient, shadow, radius, dan decorative surface dikurangi agar tidak saling bersaing. Oranye dipakai sebagai warna tindakan dan identitas, sedangkan slate menjadi fondasi informasi dan trust. Hasilnya lebih dekat dengan produk startup matang daripada landing page template.

### 3. Navigasi mobile disederhanakan

Bottom navigation dikurangi menjadi empat tujuan utama: Beranda, Cari, Bandingkan, dan Artikel. Kategori tidak diduplikasi karena sudah muncul di atas homepage. Menu tambahan dipindahkan ke drawer yang memiliki overlay, focus trap, Escape-to-close, body scroll lock, dan pengembalian fokus.

### 4. Homepage memperjelas keputusan, bukan hanya produk

Kartu produk menampilkan kekuatan produk, score, harga mulai, jumlah sumber, freshness, analisis, dan compare. Trust copy menggunakan “Analisis transparan”, bukan klaim abstrak seperti “review jujur”.

### 5. Search dan artikel memakai whole-card interaction

Seluruh area kartu menjadi target klik, bukan hanya judul atau tombol kecil. Ini memperbaiki discoverability, terutama di mobile, sekaligus mengurangi elemen interaktif yang berulang di dalam satu kartu.

### 6. Compare lebih stabil di layar kecil

Kolom aspek dibuat sticky saat tabel digeser horizontal. Ringkasan keputusan hanya muncul setelah minimal dua produk dipilih, sehingga pengguna tidak menerima kesimpulan perbandingan yang belum valid.

### 7. Trust dan disclosure diperjelas

Footer menjelaskan bahwa harga, stok, dan promo dapat berubah serta sebagian tautan dapat berupa tautan afiliasi. Penjelasan ini membangun trust tanpa mengganggu alur utama pembelian.

### 8. Aset visual dioptimalkan

- Logo: sekitar 180 KB menjadi 7,7 KB, resolusi 320 × 320.
- Gambar produk contoh: sekitar 2,2 MB menjadi 126 KB, resolusi 1200 × 800.
- Cover artikel dan gambar kartu memakai aspect ratio serta decoding/loading hints yang lebih stabil.

## Konsistensi yang telah diverifikasi

- Seluruh halaman publik utama memakai shared header, footer, dan mobile navigation.
- Seluruh halaman publik memiliki target skip link `#konten-utama`.
- Tidak ditemukan utility teks berukuran 8–11 px.
- Tidak ditemukan `<button>` tanpa atribut `type` eksplisit.
- Local import resolution: 146 import diperiksa, 0 unresolved.
- TypeScript/TSX syntax: 84 file diperiksa, 0 failure.
- CSS globals berhasil diparse.
- Arbitrary design values publik tersisa hanya untuk hero besar yang memang disengaja.
- Tidak ada perubahan database atau migration.

## Perubahan file utama

- `components/site/site-header.tsx`
- `components/site/mobile-bottom-nav.tsx`
- `components/site/site-footer.tsx`
- `components/site/breadcrumbs.tsx`
- `components/site/page-intro.tsx`
- `app/page.tsx`
- `app/search/page.tsx`
- `app/compare/compare-client.tsx`
- `app/product/[slug]/page.tsx`
- `app/product/[slug]/marketplace-offers.tsx`
- `app/articles/page.tsx`
- `app/articles/[slug]/page.tsx`
- `app/loading.tsx`
- `app/error.tsx`
- `app/not-found.tsx`
- `app/globals.css`
- beberapa kontrol penting pada halaman admin
- aset logo dan gambar produk contoh

## Wajib diverifikasi sebelum production launch

1. Jalankan `npm run typecheck` dan `npm run build` di environment project yang memiliki dependencies.
2. Uji homepage, search, compare, product detail, artikel, loading, error, dan 404 dengan data Supabase nyata.
3. Uji perangkat nyata pada lebar kecil, tablet, laptop, dan layar besar—termasuk drawer dan horizontal compare table.
4. Jalankan Lighthouse setelah deployment untuk LCP, CLS, INP, accessibility, dan SEO.
5. Pastikan URL legal, kontak, social link, canonical domain, dan disclosure bisnis sudah final.
6. Uji edge cases: judul sangat panjang, gambar gagal, harga kosong, hanya satu marketplace, puluhan spesifikasi, serta artikel panjang.
7. Pasang analytics event untuk search, compare, product analysis, dan marketplace outbound click sebelum mengambil keputusan desain berikutnya.

## Rekomendasi setelah peluncuran

Jangan melakukan redesign besar lagi sebelum data penggunaan tersedia. Setelah soft launch, fokuskan iterasi pada tiga metrik: rasio pencarian yang menghasilkan klik produk, penggunaan fitur compare, dan outbound click ke marketplace. Desain berikutnya sebaiknya ditentukan oleh friksi nyata pengguna, bukan tambahan dekorasi.

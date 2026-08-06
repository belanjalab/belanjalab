# BelanjaLab — Design Pass, 6 Agustus 2026

Audit sebelumnya (`BELANJALAB_FINAL_DESIGN_AUDIT.md`) sudah menetapkan struktur halaman, navigasi, dan accessibility dengan baik. Pass ini fokus pada satu temuan kritis yang terlewat: **identitas warna BelanjaLab identik dengan Shopee**, bukan sekadar terinspirasi.

## Temuan utama

Header, harga produk, dan tombol CTA utama memakai hex `#ee4d2d` / `#d94322` — warna brand Shopee secara literal (bukan pendekatan/interpretasi, tapi kode warna yang sama persis). Ini melanggar instruksi eksplisit "jangan menyalin tampilan Shopee secara langsung".

## Perubahan

1. **Sistem warna dirombak** — token warna lama (`--brand-500..800`, oranye Shopee) diganti dengan skala amber/gold. Warna aksi utama (tombol CTA) dipindah ke **navy/slate-900**, bukan oranye. Amber kini dipakai secara konsisten hanya untuk aksen sekunder: label eyebrow, badge, hover state, dan elemen terkait skor/kualitas.
2. **Header dirombak total** (`components/site/site-header.tsx`) — dari bar oranye solid (paling mirip Shopee) menjadi header putih bersih dengan border tipis, search bar netral, dan CTA navy. Drawer mobile disamakan gaya dengan footer (slate-950).
3. **Harga tidak lagi dominan secara visual** — di homepage, product card, search card, dan compare table, warna harga diubah dari oranye mencolok menjadi warna ink netral (`text-slate-900`), sesuai instruksi "harga tanpa mendominasi". Skor (emerald) tetap jadi elemen yang paling menonjol karena itu adalah diferensiator BelanjaLab.
4. **Compare page**: ditambahkan badge "Termurah" dan "Tertinggi" pada baris Harga dan BelanjaLab Score di tabel perbandingan (`app/compare/compare-client.tsx`) — memenuhi requirement "menampilkan pemenang per kategori jika relevan" yang sebelumnya belum ada.
5. **Skor per-atribut di halaman produk** (rincian skor: Performa, Desain, Fitur, dst) disatukan ke warna emerald, konsisten dengan badge skor di tempat lain — sebelumnya oranye, tidak konsisten dengan sistem skor global.
6. Semua kelas Tailwind `orange-*` yang tersisa (label, border, ring, focus state) — baik di halaman publik maupun admin — diganti ke `amber-*` agar satu sistem token dipakai di seluruh project, termasuk dashboard admin.

## File yang diubah

- `app/globals.css` — token warna, gradient hero, warna seleksi teks, outline focus admin
- `components/site/site-header.tsx` — rombak struktur & warna
- `components/site/mobile-bottom-nav.tsx`, `components/site/site-footer.tsx`, `components/site/page-intro.tsx`
- `components/home/decision-product-card.tsx` — hierarki harga vs skor, CTA
- `app/page.tsx`, `app/search/page.tsx`, `app/compare/compare-client.tsx` (+ fitur pemenang), `app/product/[slug]/page.tsx`, `app/product/[slug]/marketplace-offers.tsx`, `app/articles/page.tsx`, `app/articles/[slug]/page.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Seluruh halaman `app/admin/**` dan `components/admin/**` — swap token warna saja, tidak ada perubahan struktur/logic

## Yang sengaja TIDAK diubah

- Supabase, skema database, API, business logic, struktur data — sesuai instruksi.
- Halaman **kategori** dan **brand** sebagai route terpisah — belum ada di codebase ini (ditangani lewat `/search?q=`); menambah route baru butuh keputusan produk/data model baru, di luar cakupan "jangan mengubah routing tanpa alasan penting".
- Bagian **"Kelebihan dan kekurangan produk"** dan **"Produk alternatif"** di halaman detail produk (item brief #6) — tidak diimplementasikan karena tidak ada field data untuk ini di skema saat ini (`lib/products.ts`), dan instruksi eksplisit melarang mengubah struktur data/business logic. **Rekomendasi**: ini butuh kolom baru (mis. `product_pros`, `product_cons`, relasi produk terkait) sebelum bisa ditambahkan dengan data asli, bukan konten dummy.

## Hasil pengecekan

- `npx tsc --noEmit` → **0 error** (baseline sebelum edit juga 0 error).
- `npm run build` → kompilasi webpack **berhasil**, typecheck **lulus**, tahap generate static page gagal di sandbox ini **karena tidak ada akses jaringan ke Google Fonts dan Supabase** (bukan bug kode — dikonfirmasi dengan build percobaan memakai font stub, yang lolos sampai tahap fetch data Supabase). Jalankan `npm run build` di environment dengan akses internet + kredensial Supabase asli untuk verifikasi akhir end-to-end.
- Tidak ada perubahan pada `package.json`, dependency baru, atau routing.

## Perlu diverifikasi manual sebelum deploy

1. `npm run build` dengan kredensial Supabase asli.
2. Review visual di browser nyata (desktop + mobile) — perubahan ini murni token warna + 2 penambahan kecil (winner badge di compare, konsistensi warna skor), risiko regresi layout rendah tapi tetap perlu dicek langsung.
3. Cek kontras warna baru (navy CTA di atas putih, amber di atas terang) dengan Lighthouse/axe — desain baru menggunakan `slate-900`/`amber-700` ke atas yang seharusnya memenuhi AA, tapi verifikasi otomatis tetap disarankan.

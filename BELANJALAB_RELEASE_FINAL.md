# BelanjaLab Release Finalization RC2

## Perbaikan dalam paket ini

- Canonical homepage dipindahkan dari root layout agar tidak diwariskan ke semua halaman.
- Canonical `/articles` ditambahkan.
- Halaman admin diberi `noindex` dan `nofollow`.
- URL situs dipusatkan di `lib/site-config.ts`.
- Reset password tidak lagi memakai domain Worker yang ditulis langsung di source.
- Middleware tidak lagi berpotensi redirect loop saat environment variable belum tersedia.
- Relasi Supabase kategori, brand, skor, dan marketplace mendukung bentuk object maupun array.
- Harga nol, stok habis, dan penawaran tidak tersedia tidak dipakai sebagai harga terendah.
- Fallback gambar Logitech dihapus dari alur publik dan admin.
- Hero gagal dimuat tidak lagi menjatuhkan seluruh homepage.
- Halaman artikel publik tidak memakai cookie sehingga ISR dapat bekerja.
- Dependency yang tidak digunakan dihapus.
- Script `npm run typecheck` ditambahkan.

## Pemeriksaan setelah deploy

- [ ] Cloudflare build berhasil.
- [ ] Homepage menampilkan kategori, skor, dan harga dengan benar.
- [ ] Detail produk menampilkan nama brand dan marketplace yang benar.
- [ ] Search tidak menampilkan harga Rp0.
- [ ] Produk tanpa gambar memakai placeholder netral.
- [ ] `/articles` dan artikel detail dapat dibuka.
- [ ] `/robots.txt` dan `/sitemap.xml` dapat dibuka.
- [ ] Login admin dan reset password berhasil.
- [ ] Akun non-admin ditolak dari `/admin`.
- [ ] CSV Import atomic berhasil.

## Environment variable wajib

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

# BelanjaLab Release Candidate 1

## Temuan yang diperbaiki

- CSV Import di repository sempat kembali ke versi non-transactional.
- File migration atomic import hanya berisi 1 byte.
- Fallback gambar Logitech masih muncul pada alur import lama.
- Halaman Shopee Import masih menampilkan fitur Coming Soon.
- Product JSON-LD memakai `AggregateRating` dengan jumlah rating buatan.
- Contoh environment variable belum tersimpan di repository.

## Urutan pemasangan

1. Ganti semua file dari paket finalisasi sesuai struktur folder.
2. Jalankan ulang migration `202608040001_atomic_product_csv_import.sql` di Supabase SQL Editor.
3. Commit dan tunggu Cloudflare menyelesaikan build.
4. Tes CSV berisi 2 produk valid dan 1 produk sengaja salah.
5. Pastikan produk gagal tidak meninggalkan product, score, atau price parsial.
6. Cek `product_csv_import_runs` untuk histori import.
7. Cek homepage, detail produk, artikel, search, compare, login admin, robots, dan sitemap.

## Pemeriksaan sebelum rilis

- [ ] Cloudflare build berhasil.
- [ ] Homepage terbuka tanpa error.
- [ ] `/robots.txt` dapat dibuka.
- [ ] `/sitemap.xml` dapat dibuka.
- [ ] Login admin berhasil.
- [ ] Akun non-admin ditolak dari `/admin`.
- [ ] Tambah/edit/hapus produk berhasil.
- [ ] CSV Import atomic berhasil.
- [ ] Product Detail menampilkan harga dan marketplace.
- [ ] Search dan Compare berfungsi.
- [ ] Artikel published dapat dibuka.
- [ ] Tidak ada secret key atau service-role key di repository.

## Catatan

Repository belum memiliki lockfile dependency. Tambahkan `package-lock.json` pada kesempatan berikutnya agar instalasi dependency lebih deterministik.

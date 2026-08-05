# BelanjaLab Final Release Checklist

## A. Cloudflare

- [ ] Build variables tersedia:
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Runtime variables memiliki nilai yang sama.
- [ ] Cloudflare build berhasil tanpa TypeScript error.
- [ ] Production deployment aktif pada domain utama.

## B. Supabase

- [ ] Migration `202608040001_atomic_product_csv_import.sql` sudah dijalankan.
- [ ] Tabel `product_csv_import_runs` tersedia.
- [ ] RPC berikut tersedia:
  - [ ] `start_product_csv_import`
  - [ ] `import_product_from_csv_atomic`
  - [ ] `finish_product_csv_import`
  - [ ] `upsert_marketplace_prices_bulk_atomic`
- [ ] RLS aktif pada tabel admin/sensitif.
- [ ] User admin tercatat di `admin_users`.
- [ ] Tidak ada secret key atau `service_role` di repository.

## C. Public smoke test

- [ ] `/` terbuka normal.
- [ ] `/search?q=mouse` menampilkan hasil atau empty state.
- [ ] `/compare` terbuka normal.
- [ ] `/articles` terbuka normal.
- [ ] Satu halaman artikel published terbuka.
- [ ] Satu halaman produk published terbuka.
- [ ] Harga dan link marketplace tampil benar.
- [ ] Produk tanpa gambar memakai placeholder.
- [ ] `/robots.txt` terbuka.
- [ ] `/sitemap.xml` terbuka dan tidak berisi `/admin`, `/auth`, `/search`, atau `/compare`.
- [ ] Halaman tidak ditemukan menampilkan custom 404.

## D. Admin smoke test

- [ ] `/admin` mengarahkan user yang belum login ke login.
- [ ] Akun non-admin ditolak.
- [ ] Login admin berhasil.
- [ ] Tambah produk tanpa marketplace berhasil.
- [ ] Tambah produk dengan marketplace dan harga berhasil.
- [ ] Affiliate URL invalid ditolak.
- [ ] Edit produk dan score berhasil.
- [ ] Upload dan penggantian gambar berhasil.
- [ ] Tambah/edit harga membuat price history.
- [ ] Bulk update harga marketplace mencatat price history.
- [ ] Hapus produk berhasil.
- [ ] Hero dan Footer CMS berhasil disimpan.
- [ ] Link Footer kosong tidak muncul di homepage.
- [ ] Create/edit/publish artikel berhasil.

## E. CSV atomic test

Gunakan CSV berisi dua produk valid dan satu produk sengaja invalid.

- [ ] Preview menampilkan seluruh error sebelum import.
- [ ] Import hanya dapat dijalankan admin.
- [ ] Produk valid masuk lengkap bersama score dan price.
- [ ] Produk invalid tidak meninggalkan row parsial.
- [ ] Initial price history terbentuk.
- [ ] Import run tercatat lengkap.
- [ ] Re-import slug atau affiliate URL yang sama ditolak.

## Keputusan rilis

- [ ] Semua blocker di atas selesai.
- [ ] Release Candidate disetujui menjadi production release.

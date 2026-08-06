HAPUS FITUR AMBIL LINK GAMBAR SHOPEE

1. Ekstrak isi ZIP ke folder utama project BelanjaLab dan pilih Replace/Timpa.
2. Jalankan hapus-fitur-shopee.bat dari folder utama project.
3. Commit dan deploy ulang.

File yang dinonaktifkan:
- /admin/import/shopee dialihkan ke /admin
- /admin/import/affiliate dialihkan ke /admin
- /api/admin/affiliate/scan mengembalikan 404
- Tombol Ambil Link Gambar Shopee di dashboard admin dihapus

File/folder yang dibersihkan oleh script:
- components/admin/affiliate-link-import-client.tsx
- lib/affiliate-import/
- google-apps-script/
- INSTALL_SHOPEE_IMAGE_RESOLVER.md

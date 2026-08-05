# BelanjaLab CSV Import — Cloudflare Subrequest Fix

## Urutan pemasangan

1. Jalankan `supabase/migrations/202608050001_bulk_product_csv_import.sql` di Supabase SQL Editor.
2. Ganti `lib/admin-product-import.ts`.
3. Ganti `components/admin/product-csv-import-client.tsx`.
4. Commit dan deploy ulang Cloudflare.

## Setelah deploy

Upload ulang CSV yang sama. Produk yang sudah sempat masuk pada percobaan sebelumnya akan berstatus **dilewati**, sedangkan produk yang belum masuk akan diimport. Jadi aman untuk melanjutkan import parsial tanpa membuat duplikat.

## Perubahan teknis

Sebelumnya setiap produk memanggil Supabase melalui request terpisah. CSV 100 produk dapat menghasilkan lebih dari 100 subrequest dalam satu Worker invocation. Sekarang seluruh batch diproses melalui satu RPC PostgreSQL, tetapi transaksi tetap terisolasi per produk.

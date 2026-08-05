# Affiliate Import Stage 2.1

Perbaikan untuk hasil scan Shopee yang berhasil mengambil nama/gambar tetapi tidak mendapatkan harga.

## Perubahan

- Mendukung URL hasil redirect berbentuk `/nama-toko/{shopId}/{itemId}`.
- Mengambil `shopId` dan `itemId` dari link mobile/affiliate terbaru.
- Menambahkan fallback data produk melalui endpoint detail Shopee.
- Mencoba endpoint PDP terlebih dahulu, lalu endpoint item lama sebagai fallback.
- Menggabungkan data API hanya untuk field yang tidak tersedia dari metadata HTML.
- Harga sebelum diskon tidak dianggap sebagai rentang variasi selama harga aktif tersedia.
- Kegagalan endpoint tambahan tidak menggagalkan nama/gambar yang sudah berhasil diambil.

## File

- `lib/affiliate-import/metadata.ts`
- `lib/affiliate-import/fetcher.ts`
- `lib/affiliate-import/shopee-product-api.ts`

Tidak membutuhkan migration, package, atau environment variable baru.

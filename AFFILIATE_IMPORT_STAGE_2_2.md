# Affiliate Import Stage 2.2

## Masalah yang diperbaiki

- Nomor item tidak lagi dianggap sebagai nama produk.
- File CSS/JavaScript tidak lagi dianggap sebagai gambar produk.
- Kegagalan membaca halaman publik Shopee tidak menghentikan pemanggilan Open API.
- Metadata dari API resmi diprioritaskan sebelum fallback halaman publik.
- Status konfigurasi Open API terlihat pada halaman admin.

## Cloudflare runtime variables

Tambahkan pada **Workers & Pages > BelanjaLab > Settings > Variables and Secrets**:

```text
SHOPEE_AFFILIATE_APP_ID
SHOPEE_AFFILIATE_APP_SECRET
```

Gunakan **Text** untuk App ID dan **Secret** untuk App Secret. Jangan memakai prefix
`NEXT_PUBLIC`, karena App Secret hanya boleh tersedia di server.

## Catatan

Tanpa kredensial Open API, sistem tetap mencoba membaca halaman publik dan endpoint
produk Shopee. Jalur tersebut bersifat best effort karena Shopee dapat membatasi
request otomatis dari Cloudflare.

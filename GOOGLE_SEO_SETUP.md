# Google SEO Setup — BelanjaLab

## Sudah diterapkan

- Sitemap dinamis: `/sitemap.xml`
- Robots: `/robots.txt`
- Canonical URL pada halaman publik
- Metadata Open Graph dan Twitter
- Schema JSON-LD `Organization`, `WebSite`, `Product`, dan `Article`
- Halaman admin, pencarian internal, dan perbandingan dinamis tidak diindeks
- Dukungan Google Search Console verification melalui environment variable
- Web app manifest: `/manifest.webmanifest`

## Environment variable Cloudflare

Tambahkan variable berikut setelah memperoleh kode verifikasi dari Google Search Console:

```text
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=kode_verifikasi_dari_google
```

Isi hanya nilai pada atribut `content`, bukan seluruh tag HTML.

Contoh tag dari Google:

```html
<meta name="google-site-verification" content="abc123xyz" />
```

Nilai environment variable yang dipakai:

```text
abc123xyz
```

## Langkah setelah deploy

1. Buka Google Search Console dan tambahkan properti domain `belanjalab.com`.
2. Verifikasi domain melalui DNS TXT (metode terbaik) atau gunakan meta tag di atas.
3. Kirim sitemap: `https://belanjalab.com/sitemap.xml`.
4. Uji halaman beranda dan beberapa halaman produk menggunakan URL Inspection.
5. Uji schema produk/artikel menggunakan Google Rich Results Test.
6. Pastikan produk yang dipublikasikan memiliki nama, deskripsi unik, gambar yang jelas, merek, kategori, dan harga terbaru.

## Catatan konten SEO

- Jangan membuat deskripsi produk yang sama untuk banyak produk.
- Gunakan judul artikel yang menjawab kebutuhan pencarian pengguna.
- Tautkan artikel ke produk terkait dan produk ke artikel panduan yang relevan.
- Jangan memasukkan halaman hasil pencarian internal ke sitemap.
- `lastModified` sitemap hanya berasal dari `updated_at` database agar tidak terlihat berubah setiap deploy.

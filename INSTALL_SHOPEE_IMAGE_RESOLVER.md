# Instalasi Shopee Image Resolver untuk BelanjaLab

Versi ini tidak lagi meminta Cloudflare Worker membuka Shopee. Resolver berjalan di Google Apps Script dan dipanggil langsung dari browser admin BelanjaLab. Fungsinya hanya mengambil URL gambar utama lalu menyalin atau mengekspor hasil ke CSV.

## A. Pasang resolver Google Apps Script

Anda dapat memakai project Apps Script yang sebelumnya sudah dibuat.

1. Buka project Google Apps Script.
2. Ganti seluruh isi `Code.gs` dengan file `google-apps-script/Code.gs` dari paket ini.
3. Buka **Project Settings** dan aktifkan **Show "appsscript.json" manifest file in editor**.
4. Ganti isi `appsscript.json` dengan file `google-apps-script/appsscript.json` dari paket ini.
5. Klik **Save**.
6. Pilih fungsi `authorizeResolver`, lalu klik **Run** dan berikan izin yang diminta.
7. Pilih **Deploy > New deployment**. Jika sebelumnya sudah pernah membuat Web App, pilih **Deploy > Manage deployments > Edit** dan buat versi baru.
8. Pilih jenis deployment **Web app**.
9. Atur:
   - **Execute as:** Me
   - **Who has access:** Anyone
10. Klik **Deploy**, kemudian salin URL Web App yang berakhiran `/exec`.

Contoh format:

```text
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
```

Jangan memakai URL `/dev`.

## B. Timpa file BelanjaLab

Ekstrak ZIP ini ke root project BelanjaLab dan timpa file lama berikut:

```text
app/admin/page.tsx
app/admin/import/shopee/page.tsx
app/api/admin/affiliate/scan/route.ts
components/admin/affiliate-link-import-client.tsx
```

Folder `google-apps-script` hanya untuk disalin ke editor Apps Script dan tidak perlu ikut dibuild oleh Next.js.

Deploy ulang BelanjaLab ke Cloudflare.

## C. Hubungkan resolver di halaman admin

1. Buka `/admin/import/shopee`.
2. Tempel URL Web App `/exec` ke bagian **Resolver Google Apps Script**.
3. Klik **Simpan Resolver**.
4. Tempel satu link Shopee terlebih dahulu untuk pengujian.
5. Klik **Ambil Link Gambar**.

URL resolver disimpan di `localStorage` browser. Anda juga dapat menyetelnya sebagai environment variable publik saat build:

```env
NEXT_PUBLIC_SHOPEE_IMAGE_RESOLVER_URL=https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec
```

Nilai ini bukan secret, karena Web App memang harus dapat diakses oleh halaman admin.

## D. Tes resolver tanpa BelanjaLab

Buka URL berikut di browser, dengan link Shopee yang sudah di-encode:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?url=https%3A%2F%2Fs.shopee.co.id%2FKODE_LINK
```

Hasil normal berbentuk JSON seperti ini:

```json
{
  "success": true,
  "image_url": "https://down-id.img.susercontent.com/file/id-...",
  "resolved_url": "https://shopee.co.id/...",
  "source": "product-page",
  "message": "Link gambar produk berhasil ditemukan."
}
```

Jika yang tampil adalah halaman login atau pesan izin, deployment belum menggunakan akses **Anyone**.

## E. Perilaku versi ini

- Tidak memakai Shopee Affiliate Open API.
- Tidak mengambil harga, nama, atau deskripsi.
- Tidak menjalankan scan Shopee di Cloudflare Worker.
- Memproses satu link per request agar stabil.
- Menolak favicon, logo, dan ikon aplikasi Shopee.
- Membuat CSV langsung di browser tanpa request tambahan.
- Menyimpan cache hasil di Apps Script selama enam jam.

## Commit message

```text
fix: move Shopee image resolution outside Cloudflare worker
```

# Security Changes

## Environment

- Supabase URL dan publishable key dibaca dari Cloudflare variables.
- Tidak ada service-role atau secret key di source code.
- Variabel yang sama wajib tersedia pada build dan runtime.

## Admin access

- Middleware memproteksi `/admin/*`.
- Session Supabase diverifikasi.
- User wajib tercatat pada `admin_users`.
- Server action penting melakukan pemeriksaan admin kembali.

## Data validation

- URL publik hanya menerima path internal, `http`, `https`, dan `mailto` khusus kontak.
- Affiliate URL hanya menerima `http/https`.
- URL gambar invalid diganti placeholder atau tidak dirender.
- CSV import memvalidasi semua baris sebelum RPC dijalankan.
- Affiliate URL disanitasi lagi saat dibaca untuk halaman publik dan preview admin.
- Bulk price update dijalankan lewat RPC atomic dengan verifikasi admin.

## Response headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy: same-origin`
- HSTS pada production

## Dependency baseline

- Next.js `15.5.21`
- React `19.2.6`
- React DOM `19.2.6`

## Upload boundary

- Server Action upload limit diatur eksplisit menjadi `6mb`.
- Validasi aplikasi tetap membatasi gambar produk dan artikel maksimum 5 MB.

# BelanjaLab Security Hardening

## File yang diubah

- `middleware.ts`
- `lib/supabase-config.ts` (baru)
- `lib/supabase.ts`
- `lib/supabase-server.ts`
- `app/sitemap.ts`

## Perubahan

- Menghapus fallback Supabase URL dan publishable key dari source.
- Menolak akses `/admin/*` untuk akun yang tidak terdaftar di `admin_users`.
- Menambahkan security headers dasar.
- Mengaktifkan HSTS hanya pada production.
- Menghapus `/search` dan `/compare` dari sitemap karena keduanya `noindex`.

## Environment variable wajib

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Pengujian

1. Buka homepage.
2. Buka `/robots.txt` dan `/sitemap.xml`.
3. Login menggunakan akun admin.
4. Pastikan akun non-admin tidak dapat membuka `/admin`.
5. Pastikan `/search` dan `/compare` tidak tampil di sitemap.

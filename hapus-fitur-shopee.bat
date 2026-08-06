@echo off
setlocal

if not exist package.json (
  echo Jalankan file ini dari folder utama project BelanjaLab.
  pause
  exit /b 1
)

del /q "components\admin\affiliate-link-import-client.tsx" 2>nul
rmdir /s /q "lib\affiliate-import" 2>nul
rmdir /s /q "google-apps-script" 2>nul
del /q "INSTALL_SHOPEE_IMAGE_RESOLVER.md" 2>nul

echo Fitur Ambil Link Gambar Shopee sudah dibersihkan.
pause

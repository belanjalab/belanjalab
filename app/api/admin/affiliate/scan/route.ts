import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Scanner Shopee di Cloudflare sudah dinonaktifkan. Gunakan resolver Google Apps Script pada halaman admin.",
    },
    {
      status: 410,
      headers: NO_STORE_HEADERS,
    },
  );
}

import { NextRequest, NextResponse } from "next/server";

type ScanItem = {
  name: string;
  price: string;
  affiliateUrl: string;
  productUrl: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as ScanItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada data untuk diproses." },
        { status: 400 },
      );
    }

    // Tahap pertama: validasi & preview.
    // Tahap berikutnya akan mengambil data produk dari productUrl.
    const results = items.map((item) => ({
      ...item,
      status: "ready_to_scan",
    }));

    return NextResponse.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}

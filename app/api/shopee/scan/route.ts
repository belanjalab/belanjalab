import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { shopeeScanRequestSchema } from "@/lib/shopee/types"; // Sesuaikan path ini jika perlu

export async function POST(request: NextRequest) {
  try {
    // 1. Cek Autentikasi: Pastikan yang mengakses adalah Admin yang sedang login
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Anda harus login sebagai admin." },
        { status: 401 }
      );
    }

    // 2. Validasi Payload yang masuk menggunakan Zod Schema
    const body = await request.json();
    const parsedData = shopeeScanRequestSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Format data tidak valid.", 
          details: parsedData.error.format() // Memberitahu bagian mana yang salah (misal: URL tidak valid)
        },
        { status: 400 }
      );
    }

    const items = parsedData.data.items;

    // 3. Proses Data
    const results = items.map((item) => ({
      ...item,
      status: "ready_to_scan" as const,
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
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
